import FeedingSchedule from "../../models/feedingSchedule.js";
import FeedFormulations from "../../models/feedFormulation.js";
import Shed from "../../models/shed.js";
import Pen from "../../models/pen.js";
import { getUserById } from "../../repo/user.js";
import { ApiError } from "../../utils/ApiError.js";
import sendSuccessResponse from "../../utils/responses/sendSuccessResponse.js";
import { Op } from "sequelize";

const GetShedFeedReport = async (req, res, next) => {
    try {
        const {
            query: {
                shedId,
                start_date,
                end_date,
                meal_time,
                feeding_status,
                limit = 50,
                page = 1
            },
            userId
        } = req;

        const offset = (page - 1) * limit;
        const user = await getUserById(userId);
        if (!user) throw new ApiError("Unauthorized", 400, "Unauthorized access.", true);

        const { farmId } = user;
        if (!farmId) throw new ApiError("Unauthorized", 400, "Farm not found.", true);

        // Build where conditions
        const whereConditions = { farmId };

        if (shedId) {
            const shed = await Shed.findOne({
                where: { uuid: shedId, farmId, isDeleted: false }
            });
            if (!shed) throw new ApiError("Invalid Details", 400, "Shed not found.", true);
            whereConditions.shedId = shed.uuid;
        }

        if (start_date && end_date) {
            whereConditions.feeding_date = {
                [Op.between]: [start_date, end_date]
            };
        } else if (start_date) {
            whereConditions.feeding_date = {
                [Op.gte]: start_date
            };
        } else if (end_date) {
            whereConditions.feeding_date = {
                [Op.lte]: end_date
            };
        }

        if (meal_time) {
            whereConditions.meal_time = meal_time;
        }

        if (feeding_status) {
            whereConditions.feeding_status = feeding_status;
        }

        const { count, rows: schedules } = await FeedingSchedule.findAndCountAll({
            where: whereConditions,
            offset,
            limit: Number(limit),
            order: [["feeding_date", "DESC"], ["meal_time", "ASC"]],
            include: [
                {
                    model: Shed,
                    as: "shed",
                    attributes: ["uuid", "name", "shed_type", "location"]
                },
                {
                    model: Pen,
                    as: "pen",
                    attributes: ["uuid", "name", "pen_type", "capacity"]
                },
                {
                    model: FeedFormulations,
                    as: "feedFormulation",
                    attributes: ["uuid", "name", "description", "cost_per_kg"]
                }
            ]
        });

        // Calculate summary statistics
        const summary = {
            totalSchedules: count,
            totalAnimals: 0,
            totalPlannedQuantity: 0,
            totalActualQuantity: 0,
            totalCost: 0,
            statusBreakdown: {
                scheduled: 0,
                in_progress: 0,
                completed: 0,
                skipped: 0,
                partially_completed: 0
            },
            mealTimeBreakdown: {
                morning: 0,
                afternoon: 0,
                evening: 0,
                night: 0
            }
        };

        // Format schedules and calculate summary
        const formattedSchedules = schedules.map(schedule => {
            const planned = parseFloat(schedule.scheduled_quantity || 0);
            summary.totalAnimals += Number(schedule.animals_count || 0);
            summary.totalPlannedQuantity += planned;
            summary.totalActualQuantity += parseFloat(schedule.actual_quantity || 0);
            summary.totalCost += planned * parseFloat(schedule.feedFormulation?.cost_per_kg || 0);
            if (summary.statusBreakdown[schedule.feeding_status] !== undefined) summary.statusBreakdown[schedule.feeding_status]++;
            if (summary.mealTimeBreakdown[schedule.meal_time] !== undefined) summary.mealTimeBreakdown[schedule.meal_time]++;

            return {
                uuid: schedule.uuid,
                feeding_date: schedule.feeding_date,
                meal_time: schedule.meal_time,
                animals_count: schedule.animals_count,
                scheduled_quantity: schedule.scheduled_quantity,
                actual_quantity: schedule.actual_quantity,
                per_animal_quantity: schedule.per_animal_quantity,
                feeding_status: schedule.feeding_status,
                is_stock_deducted: schedule.is_stock_deducted,
                notes: schedule.notes,
                shed: schedule.shed,
                pen: schedule.pen,
                recipe: schedule.feedFormulation,
                estimatedCost: (planned * parseFloat(schedule.feedFormulation?.cost_per_kg || 0)).toFixed(2),
                createdAt: schedule.createdAt,
                updatedAt: schedule.updatedAt
            };
        });

        const totalPages = Math.ceil(count / limit);
        const responseData = {
            schedules: formattedSchedules,
            summary: {
                ...summary,
                totalCost: summary.totalCost.toFixed(2),
                averageQuantityPerAnimal: summary.totalAnimals > 0
                    ? (summary.totalPlannedQuantity / summary.totalAnimals).toFixed(2)
                    : 0,
                completionRate: count > 0
                    ? ((summary.statusBreakdown.completed / count) * 100).toFixed(1)
                    : 0
            },
            page: Number(page),
            totalPages: Number(totalPages),
            limit: Number(limit),
            skip: offset,
            totalCount: Number(count)
        };

        return sendSuccessResponse(res, 200, true, "Shed feed report fetched successfully.", "feedReport", responseData);
    } catch (error) {
        next(error);
    }
};

export default GetShedFeedReport;
