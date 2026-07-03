import { Op } from "sequelize";
import Permissions from "../../../models/permissions.js";
import AdminRoleAndPermission from "../../../models/systmenAdminRoles&Permissions.js";
import { getUserById } from "../../../repo/user.js";
import sendSuccessResponse from "../../../utils/responses/sendSuccessResponse.js";
import { ApiError } from "../../../utils/ApiError.js";
import AdminRoles from "../../../models/systemAdminRoles.js";

const createRole = async (req, res, next) => {
    try {
        const { name, description, permissions } = req.body;
        const { userId } = req;
        const user = await getUserById(userId, true);
        if (!user) throw new ApiError("Unauthorized", 400, "Unauthorized access.", true);
        if (!name) throw new ApiError("Invalid Details", 400, "Role name is missing", true);
        const exist = await AdminRoles.findOne({ where: { name: name.toLowerCase(), isDeleted: false } });
        if (exist) throw new ApiError("Invalid Details", 400, "Role with provided name already exist.", true);
        if (permissions?.length < 1) throw new ApiError("Invalid Details", 400, "Permissions are missing", true);
        const { count, rows: existsIds } = await Permissions.findAndCountAll({
            where: {
                type: "system_admin",
                uuid: {
                    [Op.in]: permissions,
                },
            },
            attributes: ["uuid"],
        });
        if (count < 1) throw new ApiError("Invalid Details", 400, "Please provide valid permissions.", true);
        const roleData = {
            name: name.toLowerCase(),
            description,
            createdBy: userId,
            updatedBy: userId,
        };
        const { dataValues: newRole } = await AdminRoles.create(roleData);
        if (!newRole) throw new ApiError("Db Error", 400, "role not created", true);
        const { uuid: roleId } = newRole;

        // Prepare role-permission associations
        const rolePermissionsData = existsIds.map(({ uuid }) => ({
            permissionId: uuid,
            roleId,
        }));
        await AdminRoleAndPermission.bulkCreate(rolePermissionsData);
        return sendSuccessResponse(res, 201, true, "role created successfully", null, newRole);
    } catch (error) {
        next(error);
    }
    return createRole;
};
export default createRole;
