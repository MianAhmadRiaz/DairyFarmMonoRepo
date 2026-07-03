import FeedingSchedule from "../../models/feedingSchedule.js";
import FeedFormulations from "../../models/feedFormulation.js";
import FeedFormulationItems from "../../models/feedFormulationItems.js";
import Shed from "../../models/shed.js";
import Pen from "../../models/pen.js";
import StockItem from "../../models/stockItem.js";
import UnitOfMeasure from "../../models/unitsOfMeasures.js";
import { getUserById } from "../../repo/user.js";
import { ApiError } from "../../utils/ApiError.js";
import sendSuccessResponse from "../../utils/responses/sendSuccessResponse.js";
const GetShedFeedStockPrint = async (req, res, next) => {
    try {
        const { 
            query: { 
                shedId,
                feeding_date,
                meal_time,
                includeIngredients = true
            }, 
            userId 
        } = req;
        
        const user = await getUserById(userId);
        if (!user) throw new ApiError("Unauthorized", 400, "Unauthorized access.", true);
        
        const { farmId } = user;
        if (!farmId) throw new ApiError("Unauthorized", 400, "Farm not found.", true);

        if (!shedId || !feeding_date) {
            throw new ApiError("Invalid Details", 400, "Shed ID and feeding date are required.", true);
        }

        // Verify shed exists
        const shed = await Shed.findOne({
            where: { uuid: shedId, farmId, isDeleted: false }
        });

        if (!shed) {
            throw new ApiError("Invalid Details", 400, "Shed not found.", true);
        }

        // Build where conditions
        const whereConditions = {
            shedId: shed.uuid,
            feeding_date,
            farmId
        };

        if (meal_time) {
            whereConditions.meal_time = meal_time;
        }

        // Get feeding schedules for the specified date and shed
        const schedules = await FeedingSchedule.findAll({
            where: whereConditions,
            include: [
                {
                    model: Shed,
                    as: "shed",
                    attributes: ["uuid", "name", "shed_type", "location", "capacity"]
                },
                {
                    model: Pen,
                    as: "pen",
                    attributes: ["uuid", "name", "pen_type", "capacity"]
                },
                {
                    model: FeedFormulations,
                    as: "feedFormulation",
                    attributes: ["uuid", "name", "description", "cost_per_kg"],
                    include: String(includeIngredients) === 'true' ? [
                        {
                            model: FeedFormulationItems,
                            as: "items",
                            include: [
                                {
                                    model: StockItem,
                                    as: "stockItem",
                                    attributes: ["uuid", "name", "description", "unit_of_measure"],
                                    include: [
                                        {
                                            model: UnitOfMeasure,
                                            as: "unit",
                                            attributes: ["uuid", "name"]
                                        }
                                    ]
                                }
                            ]
                        }
                    ] : []
                }
            ],
            order: [["meal_time", "ASC"], [{ model: Pen, as: "pen" }, "name", "ASC"]]
        });

        if (!schedules.length) {
            throw new ApiError("No Data", 404, "No feeding schedules found for the specified date and shed.", true);
        }

        // Calculate totals and organize data for printing
        const summary = {
            shedInfo: {
                uuid: shed.uuid,
                name: shed.name,
                shed_type: shed.shed_type,
                location: shed.location,
                capacity: shed.capacity
            },
            feedingDate: feeding_date,
            mealTimes: meal_time ? [meal_time] : [...new Set(schedules.map(s => s.meal_time))],
            totalAnimals: 0,
            totalPlannedQuantity: 0,
            totalActualQuantity: 0,
            totalEstimatedCost: 0,
            pensCount: new Set(schedules.map(s => s.penId)).size,
            recipesUsed: new Set(schedules.map(s => s.formulationId)).size
        };

        // Group schedules by meal time
        const mealTimeGroups = {};
        const totalIngredientRequirements = {};

        schedules.forEach(schedule => {
            const mealTime = schedule.meal_time;
            
            if (!mealTimeGroups[mealTime]) {
                mealTimeGroups[mealTime] = {
                    meal_time: mealTime,
                    schedules: [],
                    subtotal: {
                        animals: 0,
                        plannedQuantity: 0,
                        actualQuantity: 0,
                        estimatedCost: 0
                    }
                };
            }

            const plannedQty = parseFloat(schedule.scheduled_quantity || 0);
            const actualQty = parseFloat(schedule.actual_quantity || 0);
            const estimatedCost = plannedQty * parseFloat(schedule.feedFormulation?.cost_per_kg || 0);

            // Update summary
            summary.totalAnimals += Number(schedule.animals_count || 0);
            summary.totalPlannedQuantity += plannedQty;
            summary.totalActualQuantity += actualQty;
            summary.totalEstimatedCost += estimatedCost;

            // Update meal time subtotal
            mealTimeGroups[mealTime].subtotal.animals += Number(schedule.animals_count || 0);
            mealTimeGroups[mealTime].subtotal.plannedQuantity += plannedQty;
            mealTimeGroups[mealTime].subtotal.actualQuantity += actualQty;
            mealTimeGroups[mealTime].subtotal.estimatedCost += estimatedCost;

            // Calculate ingredient requirements if requested — each ingredient's
            // share is its recipe quantity over the total recipe quantity.
            const recipeItems = schedule.feedFormulation?.items || [];
            const totalRecipeQty = recipeItems.reduce((sum, item) => sum + parseFloat(item.quantity || 0), 0);
            if (String(includeIngredients) === 'true' && totalRecipeQty > 0) {
                recipeItems.forEach(ingredient => {
                    const ingredientKey = `${ingredient.stockItem?.uuid}_${ingredient.stockItem?.name}`;
                    const requiredQuantity = plannedQty * (parseFloat(ingredient.quantity || 0) / totalRecipeQty);

                    if (!totalIngredientRequirements[ingredientKey]) {
                        totalIngredientRequirements[ingredientKey] = {
                            stockItemId: ingredient.stockItem?.uuid,
                            name: ingredient.stockItem?.name,
                            description: ingredient.stockItem?.description,
                            unit: ingredient.stockItem?.unit?.name || ingredient.stockItem?.unit_of_measure,
                            totalQuantity: 0,
                            mealBreakdown: {}
                        };
                    }

                    totalIngredientRequirements[ingredientKey].totalQuantity += requiredQuantity;

                    if (!totalIngredientRequirements[ingredientKey].mealBreakdown[mealTime]) {
                        totalIngredientRequirements[ingredientKey].mealBreakdown[mealTime] = 0;
                    }
                    totalIngredientRequirements[ingredientKey].mealBreakdown[mealTime] += requiredQuantity;
                });
            }

            // Add formatted schedule to meal time group
            mealTimeGroups[mealTime].schedules.push({
                uuid: schedule.uuid,
                pen: schedule.pen,
                recipe: schedule.feedFormulation,
                animals_count: schedule.animals_count,
                scheduled_quantity: schedule.scheduled_quantity,
                actual_quantity: schedule.actual_quantity,
                feeding_status: schedule.feeding_status,
                is_stock_deducted: schedule.is_stock_deducted,
                estimatedCost: estimatedCost.toFixed(2),
                notes: schedule.notes
            });
        });

        // Format ingredient requirements for print
        const ingredientRequirements = Object.values(totalIngredientRequirements).map(ingredient => ({
            ...ingredient,
            totalQuantity: ingredient.totalQuantity.toFixed(2),
            mealBreakdown: Object.entries(ingredient.mealBreakdown).map(([meal, qty]) => ({
                meal_time: meal,
                quantity: qty.toFixed(2)
            }))
        }));

        // Format meal time groups
        const mealTimeArray = Object.values(mealTimeGroups).map(group => ({
            ...group,
            subtotal: {
                ...group.subtotal,
                plannedQuantity: group.subtotal.plannedQuantity.toFixed(2),
                actualQuantity: group.subtotal.actualQuantity.toFixed(2),
                estimatedCost: group.subtotal.estimatedCost.toFixed(2),
                averagePerAnimal: group.subtotal.animals > 0 
                    ? (group.subtotal.plannedQuantity / group.subtotal.animals).toFixed(2) 
                    : '0.00'
            }
        }));

        const printData = {
            summary: {
                ...summary,
                totalPlannedQuantity: summary.totalPlannedQuantity.toFixed(2),
                totalActualQuantity: summary.totalActualQuantity.toFixed(2),
                totalEstimatedCost: summary.totalEstimatedCost.toFixed(2),
                averagePerAnimal: summary.totalAnimals > 0 
                    ? (summary.totalPlannedQuantity / summary.totalAnimals).toFixed(2) 
                    : '0.00'
            },
            mealTimeGroups: mealTimeArray,
            ingredientRequirements: String(includeIngredients) === 'true' ? ingredientRequirements : [],
            printMetadata: {
                generatedAt: new Date().toISOString(),
                generatedBy: user.firstname ? `${user.firstname} ${user.lastname || ""}`.trim() : user.email,
                farmId,
                includeIngredients: String(includeIngredients) === 'true'
            }
        };
        
        return sendSuccessResponse(res, 200, true, "Shed feed stock print data fetched successfully.", "shedFeedStockPrint", printData);
    } catch (error) {
        next(error);
    }
};

export default GetShedFeedStockPrint;