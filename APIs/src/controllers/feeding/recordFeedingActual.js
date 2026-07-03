import FeedingSchedule from "../../models/feedingSchedule.js";
import { getUserById } from "../../repo/user.js";
import { ApiError } from "../../utils/ApiError.js";
import sendSuccessResponse from "../../utils/responses/sendSuccessResponse.js";
import isValidUUID from "../../utils/uuidValidator.js";

// Records what was actually fed against a scheduled feeding — closes the
// plan-vs-actual loop (refusals show up as actual < scheduled).
const RecordFeedingActual = async (req, res, next) => {
    try {
        const { body: { scheduleId, actual_quantity, feeding_status, notes }, userId } = req;
        const user = await getUserById(userId);
        if (!user) throw new ApiError("Unauthorized", 400, "Unauthorized access.", true);
        const { farmId } = user;
        if (!farmId) throw new ApiError("Unauthorized", 400, "Farm not found.", true);
        if (!isValidUUID(scheduleId)) throw new ApiError("Invalid Details", 400, "Please provide a valid scheduleId.", true);

        const schedule = await FeedingSchedule.findOne({ where: { uuid: scheduleId, farmId, isDeleted: false } });
        if (!schedule) throw new ApiError("Invalid Details", 400, "Feeding schedule not found with provided scheduleId.", true);

        const validStatuses = ["scheduled", "in_progress", "completed", "skipped", "partially_completed"];
        if (feeding_status && !validStatuses.includes(feeding_status)) {
            throw new ApiError("Invalid Details", 400, `feeding_status must be one of: ${validStatuses.join(", ")}.`, true);
        }

        const actual = Number(actual_quantity);
        if (!(actual >= 0)) throw new ApiError("Invalid Details", 400, "actual_quantity must be a number >= 0.", true);

        // Derive status from actual vs scheduled when not supplied explicitly.
        const scheduled = parseFloat(schedule.scheduled_quantity || 0);
        let status = feeding_status;
        if (!status) {
            if (actual === 0) status = "skipped";
            else if (actual < scheduled) status = "partially_completed";
            else status = "completed";
        }

        await FeedingSchedule.update({
            actual_quantity: actual,
            feeding_status: status,
            fed_by: userId,
            fed_at: new Date(),
            ...(notes !== undefined ? { notes } : {}),
            updatedBy: userId,
        }, { where: { uuid: scheduleId, farmId } });

        const updated = await FeedingSchedule.findOne({ where: { uuid: scheduleId, farmId }, raw: true });
        return sendSuccessResponse(res, 200, true, "Feeding actuals recorded successfully.", "feedingSchedule", updated);
    } catch (error) {
        next(error);
    }
};

export default RecordFeedingActual;
