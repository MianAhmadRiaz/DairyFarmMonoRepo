import { EventTypes } from "../../../constants/index.js";
import logger from "../../../logger/index.js";
import Role from "../../../models/role.js";
import User from "../../../models/user.js";
import { getUserById } from "../../../repo/user.js";
import { ApiError } from "../../../utils/ApiError.js";
import sendSuccessResponse from "../../../utils/responses/sendSuccessResponse.js";
import isValidUUID from "../../../utils/uuidValidator.js";
import Event from "../../eventEmiiter/events.js";

const updateUserRole = async (req, res, next) => {
    try {
        const { userId, body: { roleId, userId: updatedUserId } } = req;
        const user = await getUserById(userId);
        if (!user) throw new ApiError("Unauthorized", 400, "Unauthorized access.", true);
        const { farmId } = user;
        if (!farmId) throw new ApiError("Unauthorized", 400, "Farm not found.", true);
        if (!isValidUUID(roleId)) throw new ApiError("Invalid Credentials", 400, "Please provide a valid roleId", true);
        if (!isValidUUID(updatedUserId)) throw new ApiError("Invalid Credentials", 400, "Please provide a valid userId", true);
        const userToUpdate = await getUserById(updatedUserId);
        if (!userToUpdate) throw new ApiError("Invalid Details", 400, "User not found with provided userId", true);
        if (userToUpdate.farmId !== farmId) throw new ApiError("Invalid Details", 400, "User not found with provided userId", true);
        if (userToUpdate.roleId === roleId) throw new ApiError("Invalid Details", 400, "This role already attached to this user.", true);
        const isRole = await Role.findOne({ where: { uuid: roleId, farmId, isDeleted: false } });
        if (!isRole) throw new ApiError("Invalid Details", 400, "Role not found.", true);
        if (isRole.isOwner) throw new ApiError("Invalid Details", 400, "The Owner role cannot be assigned to another user.", true);

        await User.update({ roleId, role_name: isRole.name }, { where: { uuid: updatedUserId, farmId } });
        const eventPayload = {
            farmId,
            message: `${user.email} has updated the user role from ${userToUpdate.role_name} to ${isRole.name}.`
        }
        Event.emit(EventTypes.Logs, eventPayload);
        logger.info(`User ${userToUpdate.email} role has been updated successfully.`);
        return sendSuccessResponse(res, 200, true, "User role has been updated successfully", "admin");
    } catch (error) {
        next(error);
    }
    return false;
};

export default updateUserRole;
