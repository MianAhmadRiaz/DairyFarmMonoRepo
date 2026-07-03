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

const ApplyFeedRecipeShed = async (req, res, next) => {
    const transaction = await sequelize.transaction();

    try {
        const {
            userId,
            body: {
                shedId,
                recipeId,
                feeding_date,
                meal_time, // 'morning', 'afternoon', 'evening', 'night'
                quantity_per_animal,
                auto_calculate = true,
                apply_to_pens = [], // Optional: specific pen IDs, if empty applies to all pens in shed
                notes
            }
        } = req;

        if (!shedId || !recipeId || !feeding_date || !meal_time) {
            throw new ApiError("Invalid Details", 400, "Shed, recipe, feeding date, and meal time are required.", true);
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

        // Verify recipe exists, with its ingredients
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

        // Get pens in the shed
        const penConditions = { shedId: shed.uuid, isDeleted: false };
        if (apply_to_pens.length > 0) {
            penConditions.uuid = { [Op.in]: apply_to_pens };
        }

        const pens = await Pen.findAll({
            where: penConditions,
            include: [
                {
                    model: Animal,
                    as: "animals",
                    where: { isDeleted: false },
                    required: false
                }
            ]
        });

        if (!pens.length) {
            throw new ApiError("Invalid Details", 400, "No pens found in the specified shed.", true);
        }

        // Calculate total animals and feeding requirements
        let totalAnimals = 0;
        const perAnimal = parseFloat(quantity_per_animal) > 0 ? parseFloat(quantity_per_animal) : 5; // Default 5kg per animal
        const penFeedingData = [];

        for (const pen of pens) {
            const animalCount = pen.animals?.length || 0;
            totalAnimals += animalCount;

            if (animalCount > 0) {
                const feedQuantity = auto_calculate
                    ? animalCount * perAnimal
                    : (parseFloat(quantity_per_animal) || 0);

                penFeedingData.push({
                    pen,
                    animalCount,
                    feedQuantity
                });
            }
        }

        if (totalAnimals === 0) {
            throw new ApiError("Invalid Details", 400, "No animals found in the specified pens.", true);
        }

        const totalFeedRequired = penFeedingData.reduce((sum, p) => sum + p.feedQuantity, 0);

        // Resolve stock levels and required quantity per ingredient
        const ingredientRequirements = [];
        const stockChecks = [];
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
                    `${s.ingredient} (need: ${s.required}, have: ${s.available})`
                ).join(', ')}`, true);
        }

        // Create feeding schedules for each pen
        const feedingSchedules = [];
        for (const penData of penFeedingData) {
            const perAnimalQty = penData.animalCount > 0
                ? penData.feedQuantity / penData.animalCount
                : perAnimal;

            const schedule = await FeedingSchedule.create({
                shedId: shed.uuid,
                penId: penData.pen.uuid,
                formulationId: recipe.uuid,
                feeding_date,
                meal_time,
                scheduled_quantity: penData.feedQuantity,
                actual_quantity: 0,
                animals_count: penData.animalCount,
                per_animal_quantity: perAnimalQty,
                feeding_status: 'scheduled',
                is_stock_deducted: false,
                notes,
                farmId,
                createdBy: userId,
                updatedBy: userId
            }, { transaction });

            feedingSchedules.push(schedule);
        }

        // Deduct stock for ingredients and record stock transactions
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
                note: `Applied recipe: ${recipe.name} for ${totalAnimals} animals in ${shed.name}`,
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
                where: { uuid: { [Op.in]: feedingSchedules.map(s => s.uuid) } },
                transaction
            }
        );

        await transaction.commit();

        // Record the feed expense in finance (non-blocking). Reference the
        // first schedule (unique per application) — NOT the recipe, which is
        // reused across applications and would trip the idempotency guard.
        await recordFeedExpense({
            farmId,
            userId,
            amount: totalCost,
            referenceId: feedingSchedules[0]?.uuid || recipe.uuid,
            description: `Feed - ${recipe.name} (${shed.name})`,
            date: feeding_date
        });

        return sendSuccessResponse(res, 201, true, "Feed recipe applied to shed successfully.", "feedingApplication", {
            shedId: shed.uuid,
            shedName: shed.name,
            recipeId: recipe.uuid,
            recipeName: recipe.name,
            feeding_date,
            meal_time,
            totalAnimals,
            totalFeedRequired: totalFeedRequired.toFixed(2),
            totalCost: totalCost.toFixed(2),
            pensAffected: penFeedingData.length,
            schedulesCreated: feedingSchedules.length,
            stockDeducted: true,
            penSummary: penFeedingData.map(p => ({
                penId: p.pen.uuid,
                penName: p.pen.name,
                animalCount: p.animalCount,
                feedQuantity: p.feedQuantity
            }))
        });
    } catch (error) {
        await transaction.rollback();
        next(error);
    }
};

export default ApplyFeedRecipeShed;