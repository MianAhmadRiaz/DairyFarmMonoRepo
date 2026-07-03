import Role from "../../../models/role.js";
import { getUserById } from "../../../repo/user.js";
import { setRolePermissions } from "../../../repo/rbac.js";
import { ApiError } from "../../../utils/ApiError.js";
import sendSuccessResponse from "../../../utils/responses/sendSuccessResponse.js";
import isValidUUID from "../../../utils/uuidValidator.js";

// Update a role's name/description/permissions. `permissions` is an array of
// permission NAMES. The Owner role cannot be edited (it always has everything).
const updateRole = async (req, res, next) => {
    try {
        const { roleId, name, description, permissions } = req.body;
        const { userId } = req;
        const user = await getUserById(userId);
        if (!user) throw new ApiError("Unauthorized", 400, "Unauthorized access.", true);
        const { farmId } = user;
        if (!farmId) throw new ApiError("Unauthorized", 400, "Farm not found.", true);
        if (!isValidUUID(roleId)) throw new ApiError("Invalid Credentials", 400, "Please provide a valid roleId.", true);

        const role = await Role.findOne({ where: { uuid: roleId, farmId, isDeleted: false } });
        if (!role) throw new ApiError("Invalid Details", 400, "Role not found.", true);
        if (role.isOwner) throw new ApiError("Forbidden", 403, "The Owner role cannot be edited.", true);

        const patch = { updatedBy: userId };
        if (name && name.trim()) patch.name = name.trim();
        if (description !== undefined) patch.description = description;
        await role.update(patch);

        // Replace the permission set if provided.
        if (Array.isArray(permissions)) {
            await setRolePermissions(roleId, permissions);
        }

        return sendSuccessResponse(res, 200, true, "Role updated successfully.", "role", { uuid: roleId });
    } catch (error) {
        next(error);
    }
};
export default updateRole;
