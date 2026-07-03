import Role from "../../../models/role.js";
import User from "../../../models/user.js";
import { getUserById } from "../../../repo/user.js";
import { ApiError } from "../../../utils/ApiError.js";
import sendSuccessResponse from "../../../utils/responses/sendSuccessResponse.js";
import isValidUUID from "../../../utils/uuidValidator.js";

const deleteRole = async (req, res, next) => {
    try {
        const { userId, query: { roleId } } = req;
        const user = await getUserById(userId);
        if (!user) throw new ApiError("Unauthorized", 400, "Unauthorized access.", true);
        const { farmId } = user;
        if (!farmId) throw new ApiError("Unauthorized", 400, "Farm not found.", true);
        if (!isValidUUID(roleId)) throw new ApiError("Invalid Credentials", 400, "Please provide a valid roleId.", true);

        const role = await Role.findOne({ where: { uuid: roleId, farmId, isDeleted: false } });
        if (!role) throw new ApiError("Invalid Details", 400, "Role not found.", true);
        if (role.isOwner) throw new ApiError("Forbidden", 403, "The Owner role cannot be deleted.", true);
        if (role.isSystem) throw new ApiError("Forbidden", 403, "Default dairy roles cannot be deleted. Create a custom role instead.", true);

        // Block deletion while users are still assigned to this role.
        const assigned = await User.count({ where: { roleId, farmId, isDeleted: false } });
        if (assigned > 0) {
            throw new ApiError("Invalid Details", 400, `${assigned} user(s) are still assigned to this role. Reassign them first.`, true);
        }

        await Role.update({ isDeleted: true, updatedBy: userId }, { where: { uuid: roleId, farmId } });
        return sendSuccessResponse(res, 200, true, "Role deleted successfully.", "role");
    } catch (error) {
        next(error);
    }
};
export default deleteRole;
