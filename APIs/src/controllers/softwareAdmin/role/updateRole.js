import sequelize from "../../../config/db.js";
import AdminRoles from "../../../models/systemAdminRoles.js";
import AdminRoleAndPermission from "../../../models/systmenAdminRoles&Permissions.js";
import { getUserById } from "../../../repo/user.js";
import { ApiError } from "../../../utils/ApiError.js";
import sendSuccessResponse from "../../../utils/responses/sendSuccessResponse.js";
import isValidUUID from "../../../utils/uuidValidator.js";

const updateRole = async (req, res, next) => {
    const transaction = await sequelize.transaction();
    try {
        const { roleId, permissions } = req.body;
        const { userId } = req;
        const user = await getUserById(userId, true);
        if (!user) throw new ApiError("Unauthorized", 400, "Unauthorized access.", true);
        if (!Array.isArray(permissions)) throw new ApiError("Invalid Details", 400, "Permissions are missing", true)
        if (!isValidUUID(roleId)) throw new ApiError("Invalid Cradentials", 400, "Please provide a valid roleId.", true);
        const exist = await AdminRoles.findOne({
            where: { uuid: roleId },
            attributes: ["uuid"],
            include: [
                {
                    model: AdminRoleAndPermission,
                    as: "rolePermissions",
                    attributes: ["permissionId"],
                    where: {
                        isDeleted: false,
                    },
                    required: false,
                },
            ],
            transaction
        });
        if (!exist) throw new ApiError("Invalid Details", 400, "Role not found.", true);
        const existingPermissionIds = exist.rolePermissions?.map(row => row.permissionId);
        // 2. Calculate permissions to add and remove
        const toAdd = permissions.filter(p => !existingPermissionIds.includes(p));
        const toRemove = existingPermissionIds.filter(p => !permissions.includes(p));
        // 3. Remove old permissions
        if (toRemove.length > 0) {
            await AdminRoleAndPermission.update({ isDeleted: true }, {
                where: {
                    roleId,
                    permissionId: toRemove,
                },
                transaction,
            });
        }

        // 4. Add new permissions
        if (toAdd.length > 0) {
            const newLinks = toAdd.map(permissionId => ({ roleId, permissionId }));
            await AdminRoleAndPermission.bulkCreate(newLinks, { transaction });
        }

        await transaction.commit();
        return sendSuccessResponse(res, 201, true, "permissions updated successfully", "role");
    } catch (error) {
        await transaction.rollback();
        next(error);
    }
    return updateRole;
};
export default updateRole;
