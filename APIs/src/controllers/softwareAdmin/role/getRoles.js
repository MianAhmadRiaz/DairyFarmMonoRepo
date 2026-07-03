import { getUserById } from "../../../repo/user.js";
import sendSuccessResponse from "../../../utils/responses/sendSuccessResponse.js";
import { ApiError } from "../../../utils/ApiError.js";
import isValidUUID from "../../../utils/uuidValidator.js";
import AdminRoles from "../../../models/systemAdminRoles.js";
import AdminRoleAndPermission from "../../../models/systmenAdminRoles&Permissions.js";

const getRoles = async (req, res, next) => {
    try {
        const { userId, query: { roleId, limit = 20, page = 1 } } = req;
        const offset = (page - 1) * limit;
        const user = await getUserById(userId, true);
        if (!user) throw new ApiError("Unauthorized", 400, "Unauthorized access.", true);
        if (isValidUUID(roleId)) {
            const exist = await AdminRoles.findOne({ where: { uuid: roleId, isDeleted: false }, raw: true });
            if (!exist) throw new ApiError("Invalid Details", 400, "Role not found.", true);
            return sendSuccessResponse(res, 200, true, "Role fetched successfully.", "Roles ", exist);
        }
        const where = { isDeleted: false };
        const { count, rows: roles } = await AdminRoles.findAndCountAll({
            where,
            offset,
            limit,
            attributes: ["uuid", "name", "description", "createdAt"],
            order: [["createdAt", "DESC"]],
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
        const totalPages = Math.ceil(count / limit);
        const finalResponse = {
            roles,
            page: Number(page),
            totalPages: Number(totalPages),
            limit: Number(limit),
            skip: offset,
            totalCount: Number(count),
        };
        return sendSuccessResponse(res, 200, true, "all roles fetched successfully.", "Roles ", finalResponse);
    } catch (error) {
        next(error);
    }
    return getRoles;
};
export default getRoles;
