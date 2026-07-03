import FeedingSchedule from "../../models/feedingSchedule.js";
import FeedFormulations from "../../models/feedFormulation.js";
import FeedFormulationItems from "../../models/feedFormulationItems.js";
import Shed from "../../models/shed.js";
import Pen from "../../models/pen.js";
import StockItem from "../../models/stockItem.js";
import { getUserById } from "../../repo/user.js";
import { ApiError } from "../../utils/ApiError.js";
import sendSuccessResponse from "../../utils/responses/sendSuccessResponse.js";
import { Op } from "sequelize";

const GetDateWiseFeedReport = async (req, res, next) => {
    try {
        const { 
            query: { 
                start_date,
                end_date,
                groupBy = 'date', // 'date', 'shed', 'recipe'
                shedId,
                meal_time
            }, 
            userId 
        } = req;
        
        const user = await getUserById(userId);
        if (!user) throw new ApiError("Unauthorized", 400, "Unauthorized access.", true);
        
        const { farmId } = user;
        if (!farmId) throw new ApiError("Unauthorized", 400, "Farm not found.", true);

        if (!start_date || !end_date) {
            throw new ApiError("Invalid Details", 400, "Start date and end date are required.", true);
        }

        // Build where conditions
        const whereConditions = { 
            farmId,
            feeding_date: {
                [Op.between]: [start_date, end_date]
            }
        };

        if (shedId) {
            const shed = await Shed.findOne({
                where: { uuid: shedId, farmId, isDeleted: false }
            });
            if (!shed) throw new ApiError("Invalid Details", 400, "Shed not found.", true);
            whereConditions.shedId = shed.uuid;
        }

        if (meal_time) {
            whereConditions.meal_time = meal_time;
        }

        // Get all feeding schedules for the period
        const schedules = await FeedingSchedule.findAll({
            where: whereConditions,
            include: [
                {
                    model: Shed,
                    as: "shed",
                    attributes: ["uuid", "name", "shed_type"]
                },
                {
                    model: Pen,
                    as: "pen",
                    attributes: ["uuid", "name", "pen_type"]
                },
                {
                    model: FeedFormulations,
                    as: "feedFormulation",
                    attributes: ["uuid", "name", "description", "cost_per_kg"],
                    include: [
                        {
                            model: FeedFormulationItems,
                            as: "items",
                            include: [
                                {
                                    model: StockItem,
                                    as: "stockItem",
                                    attributes: ["uuid", "name"]
                                }
                            ]
                        }
                    ]
                }
            ],
            order: [["feeding_date", "ASC"], ["meal_time", "ASC"]]
        });

        let groupedData = {};
        const summary = {
            totalSchedules: schedules.length,
            totalAnimals: 0,
            totalPlannedQuantity: 0,
            totalActualQuantity: 0,
            totalCost: 0,
            dateRange: { start_date, end_date },
            ingredientUsage: {},
            statusBreakdown: {
                scheduled: 0,
                in_progress: 0,
                completed: 0,
                skipped: 0,
                partially_completed: 0
            }
        };

        // Process schedules based on groupBy parameter
        schedules.forEach(schedule => {
            let groupKey;
            
            switch (groupBy) {
                case 'shed':
                    groupKey = `${schedule.shed?.uuid}_${schedule.shed?.name}`;
                    break;
                case 'recipe':
                    groupKey = `${schedule.feedFormulation?.uuid}_${schedule.feedFormulation?.name}`;
                    break;
                case 'date':
                default:
                    groupKey = schedule.feeding_date;
                    break;
            }

            if (!groupedData[groupKey]) {
                groupedData[groupKey] = {
                    groupKey,
                    groupName: groupBy === 'shed' ? schedule.shed?.name :
                              groupBy === 'recipe' ? schedule.feedFormulation?.name :
                              schedule.feeding_date,
                    schedules: [],
                    summary: {
                        totalAnimals: 0,
                        totalPlannedQuantity: 0,
                        totalActualQuantity: 0,
                        totalCost: 0,
                        schedulesCount: 0
                    }
                };
            }

            const plannedQty = parseFloat(schedule.scheduled_quantity || 0);
            const actualQty = parseFloat(schedule.actual_quantity || 0);
            const cost = plannedQty * parseFloat(schedule.feedFormulation?.cost_per_kg || 0);

            // Update group summary
            groupedData[groupKey].summary.totalAnimals += Number(schedule.animals_count || 0);
            groupedData[groupKey].summary.totalPlannedQuantity += plannedQty;
            groupedData[groupKey].summary.totalActualQuantity += actualQty;
            groupedData[groupKey].summary.totalCost += cost;
            groupedData[groupKey].summary.schedulesCount++;

            // Update overall summary
            summary.totalAnimals += Number(schedule.animals_count || 0);
            summary.totalPlannedQuantity += plannedQty;
            summary.totalActualQuantity += actualQty;
            summary.totalCost += cost;
            if (summary.statusBreakdown[schedule.feeding_status] !== undefined) summary.statusBreakdown[schedule.feeding_status]++;

            // Track ingredient usage — each ingredient's share of the planned
            // quantity is its recipe quantity over the total recipe quantity.
            const recipeItems = schedule.feedFormulation?.items || [];
            const totalRecipeQty = recipeItems.reduce((sum, item) => sum + parseFloat(item.quantity || 0), 0);
            if (totalRecipeQty > 0) {
                recipeItems.forEach(ingredient => {
                    const ingredientName = ingredient.stockItem?.name || "Unknown";
                    const share = parseFloat(ingredient.quantity || 0) / totalRecipeQty;
                    const usedQuantity = plannedQty * share;

                    if (!summary.ingredientUsage[ingredientName]) {
                        summary.ingredientUsage[ingredientName] = {
                            totalQuantity: 0,
                            percentage: (share * 100).toFixed(1),
                            stockItemId: ingredient.stockItem?.uuid
                        };
                    }
                    summary.ingredientUsage[ingredientName].totalQuantity += usedQuantity;
                });
            }

            // Add schedule to group
            groupedData[groupKey].schedules.push({
                uuid: schedule.uuid,
                feeding_date: schedule.feeding_date,
                meal_time: schedule.meal_time,
                animals_count: schedule.animals_count,
                scheduled_quantity: schedule.scheduled_quantity,
                actual_quantity: schedule.actual_quantity,
                feeding_status: schedule.feeding_status,
                is_stock_deducted: schedule.is_stock_deducted,
                shed: schedule.shed,
                pen: schedule.pen,
                recipe: schedule.feedFormulation,
                estimatedCost: cost.toFixed(2)
            });
        });

        // Convert grouped data to array and sort
        const groupedArray = Object.values(groupedData).map(group => ({
            ...group,
            summary: {
                ...group.summary,
                totalCost: group.summary.totalCost.toFixed(2),
                averageQuantityPerAnimal: group.summary.totalAnimals > 0 
                    ? (group.summary.totalPlannedQuantity / group.summary.totalAnimals).toFixed(2) 
                    : 0
            }
        }));

        // Sort based on groupBy
        groupedArray.sort((a, b) => {
            if (groupBy === 'date') {
                return new Date(a.groupKey) - new Date(b.groupKey);
            }
            return (a.groupName || "").localeCompare(b.groupName || "");
        });

        const responseData = {
            groupBy,
            groups: groupedArray,
            summary: {
                ...summary,
                totalCost: summary.totalCost.toFixed(2),
                averageQuantityPerAnimal: summary.totalAnimals > 0 
                    ? (summary.totalPlannedQuantity / summary.totalAnimals).toFixed(2) 
                    : 0,
                completionRate: summary.totalSchedules > 0 
                    ? ((summary.statusBreakdown.completed / summary.totalSchedules) * 100).toFixed(1) 
                    : 0,
                topIngredients: Object.entries(summary.ingredientUsage)
                    .sort(([,a], [,b]) => b.totalQuantity - a.totalQuantity)
                    .slice(0, 10)
                    .map(([name, data]) => ({
                        name,
                        totalQuantity: data.totalQuantity.toFixed(2),
                        stockItemId: data.stockItemId
                    }))
            }
        };
        
        return sendSuccessResponse(res, 200, true, "Date-wise feed report fetched successfully.", "dateWiseFeedReport", responseData);
    } catch (error) {
        next(error);
    }
};

export default GetDateWiseFeedReport;