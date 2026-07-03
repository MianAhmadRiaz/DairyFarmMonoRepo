import { getUserById } from "../../../repo/user.js";
import { ApiError } from "../../../utils/ApiError.js";
import sendSuccessResponse from "../../../utils/responses/sendSuccessResponse.js";
import isValidUUID from "../../../utils/uuidValidator.js";
import Attendance from "../../../models/attendance.js";

async function updateAttendance(req, res, next) {
    try {
        const { body: { uuid, status, date }, userId } = req;

        if (!isValidUUID(uuid)) {
            throw new ApiError("Invalid Credentials", 400, "Please provide a valid attendance ID", true);
        }

        if (!status || !["absent", "present", "leave"].includes(status?.toLowerCase())) {
            throw new ApiError("Invalid Credentials", 400, "Please provide a valid status (present, absent, leave)", true);
        }

        const user = await getUserById(userId);
        if (!user) throw new ApiError("Unauthorized", 400, "Unauthorized access.", true);
        const { farmId } = user;
        if (!farmId) throw new ApiError("Unauthorized", 400, "Farm not found.", true);

        const attendance = await Attendance.findOne({ 
            where: { uuid, farmId } 
        });

        if (!attendance) {
            throw new ApiError("Not Found", 404, "Attendance record not found", true);
        }

        const updateData = {
            status: status.toLowerCase()
        };

        if (date) {
            updateData.date = date;
        }

        await Attendance.update(updateData, { where: { uuid } });

        return sendSuccessResponse(res, 200, true, "Attendance updated successfully", "attendance");
    } catch (error) {
        next(error);
    }
}

export default updateAttendance;
