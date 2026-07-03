import { ApiError } from "../utils/ApiError.js";
import { RoleTypes as Roles } from "../constants/index.js";
import { getUserById } from "../repo/user.js";
import AdminRoles from "../models/systemAdminRoles.js";
import AdminRoleAndPermission from "../models/systmenAdminRoles&Permissions.js";

const systemAdminCheckPermission = (requiredPermission) => {
    const permission = async (req, res, next) => {
        try {
            const { userId, role } = req;

            if (role === Roles.ADMIN || role === Roles.SUPER_ADMIN) return next();

            const user = await getUserById(userId, true);
            if (!user || !user.roleId) {
                throw new ApiError("Unauthorized", 401, "Unauthorized access.", true);
            }

            const findRole = await AdminRoles.findOne({
                where: { uuid: user.roleId },
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
            });

            if (!findRole) throw new ApiError("Forbidden", 403, "Role not found.", true);

            const assignedPermissions = findRole.rolePermissions.map((rp) => rp.permissionId);
            if (!assignedPermissions.includes(requiredPermission)) {
                throw new ApiError("Forbidden", 403, "Insufficient permissions.", true);
            }
            next();
        } catch (error) {
            next(error);
        }
    };
    return permission;
};
export default systemAdminCheckPermission;
