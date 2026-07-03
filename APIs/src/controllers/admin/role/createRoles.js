import { Op } from "sequelize";
import Permissions from "../../../models/permissions.js";
import Role from "../../../models/role.js";
import { getUserById } from "../../../repo/user.js";
import { setRolePermissions } from "../../../repo/rbac.js";
import sendSuccessResponse from "../../../utils/responses/sendSuccessResponse.js";
import { ApiError } from "../../../utils/ApiError.js";

// Create a custom role. `permissions` is an array of permission NAMES
// (e.g. ["herd:view","milk:record"]).
const createRole = async (req, res, next) => {
    try {
        const { name, description, permissions } = req.body;
        const { userId } = req;
        const user = await getUserById(userId);
        if (!user) throw new ApiError("Unauthorized", 400, "Unauthorized access.", true);
        const { farmId } = user;
        if (!farmId) throw new ApiError("Unauthorized", 400, "Farm not found.", true);
        if (!name || !name.trim()) throw new ApiError("Invalid Details", 400, "Role name is required.", true);
        if (!Array.isArray(permissions) || permissions.length < 1) {
            throw new ApiError("Invalid Details", 400, "At least one permission is required.", true);
        }

        const exist = await Role.findOne({ where: { name: name.trim(), farmId, isDeleted: false } });
        if (exist) throw new ApiError("Invalid Details", 400, "A role with this name already exists.", true);

        // Validate the permission names against the catalog.
        const valid = await Permissions.findAll({
            where: { type: "farm", name: { [Op.in]: permissions } },
            attributes: ["name"],
            raw: true,
        });
        const validNames = valid.map((p) => p.name);
        if (validNames.length < 1) throw new ApiError("Invalid Details", 400, "Please provide valid permissions.", true);

        const newRole = await Role.create({
            name: name.trim(),
            description: description || "Custom role",
            isOwner: false,
            isSystem: false,
            farmId,
            createdBy: userId,
            updatedBy: userId,
        });
        await setRolePermissions(newRole.uuid, validNames);

        return sendSuccessResponse(res, 201, true, "Role created successfully.", "role", {
            uuid: newRole.uuid, name: newRole.name, description: newRole.description, permissions: validNames,
        });
    } catch (error) {
        next(error);
    }
};
export default createRole;
