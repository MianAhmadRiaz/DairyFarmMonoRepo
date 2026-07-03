import { getUserById } from "../../../repo/user.js";
import { ApiError } from "../../../utils/ApiError.js";
import sendSuccessResponse from "../../../utils/responses/sendSuccessResponse.js";
import isValidUUID from "../../../utils/uuidValidator.js";
import Employee from "../../../models/employee.js";
import Event from "../../eventEmiiter/events.js";
import { EventTypes } from "../../../constants/index.js";

async function updateEmployee(req, res, next) {
    try {
        const { body: { uuid, marital_status, gender }, userId } = req;
        if (!isValidUUID(uuid)) throw new ApiError("Invalid Credentials", 400, "Please provide a valid userId", true);
        const user = await getUserById(userId);
        if (!user) throw new ApiError("Unauthorized", 400, "Unauthorized access.", true);
        const { farmId } = user;
        if (!farmId) throw new ApiError("Unauthorized", 400, "Farm not found.", true);
        if (marital_status && !["single", "married"].includes(marital_status)) throw new ApiError("Invalid Credentials", 400, "Please provide valid value for marital status.", true);
        if (gender && !["female", "male", "other"].includes(gender)) throw new ApiError("Invalid Credentials", 400, "Please provide valid value for gender.", true);
        const userExists = await Employee.findOne({ where: { uuid, farmId, isDeleted: false } });
        if (!userExists) throw new ApiError("Invalid Details", 400, "Employee with provided uuid is not found.", true);
        // Whitelist: clients must not set ownership/audit/counter fields.
        const { uuid: _uuid, farmId: _farmId, createdBy: _cb, updatedBy: _ub, isDeleted: _del, ...safeFields } = req.body;
        const dataToUpdate = {
            ...safeFields,
            updatedBy: userId,
        };
        await Employee.update(dataToUpdate, { where: { uuid, farmId } });
        const eventPayload = {
            farmId,
            message: `${user.email} has updated the employee ${userExists.name} details.`
        }
        Event.emit(EventTypes.Logs, eventPayload);
        return sendSuccessResponse(res, 201, true, "user updated successfully", "admin");
    } catch (error) {
        next(error);
    }
    return false;
}

export default updateEmployee;
