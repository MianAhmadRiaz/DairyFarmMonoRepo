import { getUserById } from "../../../repo/user.js";
import Role from "../../../models/role.js";
import RoleAndPermission from "../../../models/role&Permission.js";
import Permissions from "../../../models/permissions.js";
import sendSuccessResponse from "../../../utils/responses/sendSuccessResponse.js";
import { ApiError } from "../../../utils/ApiError.js";
import isValidUUID from "../../../utils/uuidValidator.js";

// Shapes a role row + its permission NAMES.
const withPermissionNames = (role) => {
    const permissions = (role.rolePermissions || [])
        .map((rp) => rp.permission?.name)
        .filter(Boolean);
    return {
        uuid: role.uuid,
        name: role.name,
        description: role.description,
        isOwner: role.isOwner,
        isSystem: role.isSystem,
        createdAt: role.createdAt,
        permissions,
    };
};

const roleInclude = [{
    model: RoleAndPermission,
    as: "rolePermissions",
    attributes: ["permissionId"],
    where: { isDeleted: false },
    required: false,
    include: [{ model: Permissions, as: "permission", attributes: ["name"] }],
}];

const getRoles = async (req, res, next) => {
    try {
        const { userId, query: { roleId, limit = 20, page = 1 } } = req;
        const offset = (page - 1) * limit;
        const user = await getUserById(userId);
        if (!user) throw new ApiError("Unauthorized", 400, "Unauthorized access.", true);
        const { farmId } = user;
        if (!farmId) throw new ApiError("Unauthorized", 400, "Farm not found.", true);
        if (isValidUUID(roleId)) {
            const role = await Role.findOne({ where: { uuid: roleId, farmId, isDeleted: false }, include: roleInclude });
            if (!role) throw new ApiError("Invalid Details", 400, "Role not found.", true);
            return sendSuccessResponse(res, 200, true, "Role fetched successfully.", "role", withPermissionNames(role));
        }
        const { count, rows: roles } = await Role.findAndCountAll({
            where: { farmId, isDeleted: false },
            offset,
            limit: Number(limit),
            attributes: ["uuid", "name", "description", "isOwner", "isSystem", "createdAt"],
            order: [["isOwner", "DESC"], ["isSystem", "DESC"], ["createdAt", "ASC"]],
            include: roleInclude,
            distinct: true,
        });
        return sendSuccessResponse(res, 200, true, "all roles fetched successfully.", "roles", {
            roles: roles.map(withPermissionNames),
            page: Number(page),
            totalPages: Math.ceil(count / limit),
            limit: Number(limit),
            skip: offset,
            totalCount: Number(count),
        });
    } catch (error) {
        next(error);
    }
};
export default getRoles;
