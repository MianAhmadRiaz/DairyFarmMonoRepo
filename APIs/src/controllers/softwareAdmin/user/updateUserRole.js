import logger from "../../../logger/index.js";
import Admin from "../../../models/softwareAdmin.js";
import AdminRoles from "../../../models/systemAdminRoles.js";
import { getUserById } from "../../../repo/user.js";
import { ApiError } from "../../../utils/ApiError.js";
import sendSuccessResponse from "../../../utils/responses/sendSuccessResponse.js";
import isValidUUID from "../../../utils/uuidValidator.js";

const updateUserRole = async (req, res, next) => {
    try {
        const { userId, body: { roleId, userId: updatedUserId } } = req;
        const user = await getUserById(userId, true);
        if (!user) throw new ApiError("Unauthorized", 400, "Unauthorized access.", true);
        if (!isValidUUID(roleId)) throw new ApiError("Invalid Credentials", 400, "Please provide a valid roleId", true);
        if (!isValidUUID(updatedUserId)) throw new ApiError("Invalid Credentials", 400, "Please provide a valid userId", true);
        const userToUpdate = await getUserById(updatedUserId, true);
        if (!userToUpdate) throw new ApiError("Invalid Details", 400, "User not found with provided userId", true);
        if (userToUpdate.roleId === roleId) throw new ApiError("Invalid Details", 400, "This role already attached to this user.", true);
        const isRole = await AdminRoles.findOne({ where: { uuid: roleId } });
        if (!isRole) throw new ApiError("Invalid Details", 400, "Role not found.", true);

        await Admin.update({ roleId, role_name: isRole.name }, { where: { uuid: updatedUserId } });
        logger.info(`User ${userToUpdate.email} role has been updated successfully.`);
        return sendSuccessResponse(res, 200, true, "User role has been updated successfully", "admin");
    } catch (error) {
        next(error);
    }
    return false;
};

export default updateUserRole;
