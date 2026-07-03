import FeedingSchedule from "../../models/feedingSchedule.js";
import FeedFormulations from "../../models/feedFormulation.js";
import FeedFormulationItems from "../../models/feedFormulationItems.js";
import Shed from "../../models/shed.js";
import Pen from "../../models/pen.js";
import Animal from "../../models/animal.js";
import StockItem from "../../models/stockItem.js";
import StockLevel from "../../models/stockLevel.js";
import StockTransactions from "../../models/stockTransactions.js";
import { getUserById } from "../../repo/user.js";
import { ApiError } from "../../utils/ApiError.js";
import sendSuccessResponse from "../../utils/responses/sendSuccessResponse.js";
import { recordFeedExpense } from "../../utils/finance/financeHooks.js";
import { TransactionTypes } from "../../constants/index.js";
import sequelize from "../../config/db.js";
import { Op } from "sequelize";

const ApplyFeedRecipeAdjustableShed = async (req, res, next) => {
    const transaction = await sequelize.transaction();
    
    try {
        const { 
            userId, 
            body: { 
                shedId, 
                recipeId, 
                feeding_date,
                meal_time,
                pen_adjustments = [], // [{ penId, custom_quantity, custom_animal_count }]
                notes
            } 
        } = req;
        
        if (!shedId || !recipeId || !feeding_date || !meal_time) {
            throw new ApiError("Invalid Details", 400, "Shed, recipe, feeding date, and meal time are required.", true);
        }

        if (!pen_adjustments.length) {
            throw new ApiError("Invalid Details", 400, "Pen adjustments are required for adjustable feeding.", true);
        }

        const user = await getUserById(userId);
        if (!user) throw new ApiError("Unauthorized", 400, "Unauthorized access.", true);
        
        const { farmId } = user;
        if (!farmId) throw new ApiError("Unauthorized", 400, "Farm not found.", true);

        // Verify shed exists and belongs to farm
        const shed = await Shed.findOne({
            where: { uuid: shedId, farmId, isDeleted: false }
        });

        if (!shed) {
            throw new ApiError("Invalid Details", 400, "Shed not found.", true);
        }

        // Verify recipe exists
        const recipe = await FeedFormulations.findOne({
            where: { uuid: recipeId, farmId, isDeleted: false },
            include: [
                {
                    model: FeedFormulationItems,
                    as: "items",
                    where: { isDeleted: false },
                    required: false,
                    include: [
                        {
                            model: StockItem,
                            as: "stockItem"
                        }
                    ]
                }
            ]
        });

        if (!recipe) {
            throw new ApiError("Invalid Details", 400, "Recipe not found.", true);
        }

        if (!recipe.items || !recipe.items.length) {
            throw new ApiError("Invalid Details", 400, "Recipe has no ingredients configured.", true);
        }

        // Total recipe proportion (used to distribute the required feed across ingredients)
        const totalRecipeQty = recipe.items.reduce((sum, item) => sum + parseFloat(item.quantity || 0), 0);
        if (totalRecipeQty <= 0) {
            throw new ApiError("Invalid Details", 400, "Recipe ingredient quantities are invalid.", true);
        }

        // Validate pen adjustments
        const penIds = pen_adjustments.map(adj => adj.penId);
        const pens = await Pen.findAll({
            where: { 
                uuid: { [Op.in]: penIds },
                shedId: shed.uuid,
                isDeleted: false 
            },
            include: [
                {
                    model: Animal,
                    as: "animals",
                    where: { isDeleted: false },
                    required: false
                }
            ]
        });

        if (pens.length !== penIds.length) {
            throw new ApiError("Invalid Details", 400, "One or more pens not found in the specified shed.", true);
        }

        // Process adjustments and calculate total feed required
        let totalFeedRequired = 0;
        const penFeedingData = [];

        for (const adjustment of pen_adjustments) {
            const pen = pens.find(p => p.uuid === adjustment.penId);
            if (!pen) continue;

            const actualAnimalCount = pen.animals?.length || 0;
            const adjustedAnimalCount = adjustment.custom_animal_count || actualAnimalCount;
            const feedQuantity = adjustment.custom_quantity || 0;

            if (feedQuantity <= 0) {
                throw new ApiError("Invalid Details", 400, `Feed quantity must be greater than 0 for pen ${pen.name}`, true);
            }

            totalFeedRequired += feedQuantity;
            penFeedingData.push({
                pen,
                actualAnimalCount,
                adjustedAnimalCount,
                feedQuantity,
                adjustment
            });
        }

        // Check stock availability for all ingredients
        const stockChecks = [];
        const ingredientRequirements = [];

        for (const item of recipe.items) {
            const requiredQuantity = totalFeedRequired * (parseFloat(item.quantity) / totalRecipeQty);

            const stockLevel = await StockLevel.findOne({
                where: { itemId: item.itemId, farmId, isDeleted: false }
            });

            if (!stockLevel || stockLevel.quantity < requiredQuantity) {
                stockChecks.push({
                    ingredient: item.stockItem?.name || item.formulation_name,
                    required: requiredQuantity.toFixed(2),
                    available: (stockLevel?.quantity || 0).toFixed(2),
                    shortage: (requiredQuantity - (stockLevel?.quantity || 0)).toFixed(2)
                });
            } else {
                ingredientRequirements.push({ item, stockLevel, requiredQuantity });
            }
        }

        if (stockChecks.length > 0) {
            throw new ApiError("Insufficient Stock", 400, 
                `Insufficient stock for ingredients: ${stockChecks.map(s => 
                    `${s.ingredient} (need: ${s.required}kg, have: ${s.available}kg, shortage: ${s.shortage}kg)`
                ).join(', ')}`, true);
        }

        // Create feeding schedules for each pen
        const feedingSchedules = [];
        for (const penData of penFeedingData) {
            const schedule = await FeedingSchedule.create({
                shedId: shed.uuid,
                penId: penData.pen.uuid,
                formulationId: recipe.uuid,
                feeding_date,
                meal_time,
                scheduled_quantity: penData.feedQuantity,
                actual_quantity: 0,
                animals_count: penData.adjustedAnimalCount,
                per_animal_quantity: penData.adjustedAnimalCount > 0
                    ? penData.feedQuantity / penData.adjustedAnimalCount
                    : penData.feedQuantity,
                feeding_status: 'scheduled',
                is_stock_deducted: false,
                notes: `${notes || ''} | Adjustable feeding - Actual animals: ${penData.actualAnimalCount}, Adjusted count: ${penData.adjustedAnimalCount}`,
                farmId,
                createdBy: userId,
                updatedBy: userId
            }, { transaction });

            feedingSchedules.push(schedule);
        }

        // Deduct stock for ingredients
        let totalCost = 0;
        for (const { item, stockLevel, requiredQuantity } of ingredientRequirements) {
            await StockLevel.decrement(
                { quantity: requiredQuantity },
                {
                    where: { itemId: item.itemId, farmId },
                    transaction
                }
            );

            await StockTransactions.create({
                farmId,
                itemId: item.itemId,
                item_name: stockLevel.item_name || item.stockItem?.name || item.formulation_name,
                quantity: requiredQuantity,
                last_quantity: stockLevel.quantity,
                date: feeding_date,
                price: stockLevel.price || 0,
                note: `Adjustable feeding - applied recipe: ${recipe.name} in ${shed.name}`,
                reference: recipe.uuid,
                transaction_type: TransactionTypes.USAGE,
                createdBy: userId,
                updatedBy: userId
            }, { transaction });

            totalCost += requiredQuantity * (stockLevel.price || 0);
        }

        // Mark all schedules as stock deducted
        await FeedingSchedule.update(
            { is_stock_deducted: true },
            { 
                where: { 
                    uuid: { [Op.in]: feedingSchedules.map(s => s.uuid) } 
                },
                transaction 
            }
        );

        await transaction.commit();

        // Record the feed expense in finance (non-blocking). Reference the
        // first schedule (unique per application) — NOT the reusable recipe id.
        await recordFeedExpense({
            farmId,
            userId,
            amount: totalCost,
            referenceId: feedingSchedules[0]?.uuid || recipe.uuid,
            description: `Feed (adjustable) - ${recipe.name} (${shed.name})`,
            date: feeding_date
        });

        return sendSuccessResponse(res, 201, true, "Adjustable feed recipe applied to shed successfully.", "adjustableFeedingApplication", {
            shedId: shed.uuid,
            shedName: shed.name,
            recipeId: recipe.uuid,
            recipeName: recipe.name,
            feeding_date,
            meal_time,
            totalFeedRequired: totalFeedRequired.toFixed(2),
            pensAffected: penFeedingData.length,
            schedulesCreated: feedingSchedules.length,
            stockDeducted: true,
            penAdjustments: penFeedingData.map(p => ({
                penId: p.pen.uuid,
                penName: p.pen.name,
                actualAnimals: p.actualAnimalCount,
                adjustedAnimals: p.adjustedAnimalCount,
                feedQuantity: p.feedQuantity,
                quantityPerAnimal: p.adjustedAnimalCount > 0 
                    ? (p.feedQuantity / p.adjustedAnimalCount).toFixed(2) 
                    : 0
            })),
            ingredientConsumption: ingredientRequirements.map(ir => ({
                ingredient: ir.item.stockItem?.name || ir.item.formulation_name,
                quantityUsed: ir.requiredQuantity.toFixed(2),
                unit: ir.item.stockItem?.unit_of_measure || 'kg'
            }))
        });
    } catch (error) {
        await transaction.rollback();
        next(error);
    }
};

export default ApplyFeedRecipeAdjustableShed;