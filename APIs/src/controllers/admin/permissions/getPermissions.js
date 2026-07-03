import Permissions from "../../../models/permissions.js";
import { getUserById } from "../../../repo/user.js";
import { ApiError } from "../../../utils/ApiError.js";
import { PERMISSION_META } from "../../../constants/rbac.js";
import sendSuccessResponse from "../../../utils/responses/sendSuccessResponse.js";

// Returns the farm permission catalog grouped by module, for the role-builder UI.
const getPermission = async (req, res, next) => {
    const { userId } = req;
    try {
        const user = await getUserById(userId);
        if (!user) throw new ApiError("Unauthorized", 400, "Unauthorized access.", true);
        const { farmId } = user;
        if (!farmId) throw new ApiError("Unauthorized", 400, "Farm not found.", true);

        const permissions = await Permissions.findAll({
            where: { type: "farm", isDeleted: false },
            attributes: ["uuid", "name", "description", "resource"],
            raw: true,
        });

        // Group by module (resource), attaching friendly descriptions.
        const grouped = {};
        for (const p of permissions) {
            const module = p.resource || p.name.split(":")[0];
            if (!grouped[module]) grouped[module] = [];
            grouped[module].push({
                uuid: p.uuid,
                name: p.name,
                description: PERMISSION_META[p.name]?.description || p.description,
            });
        }
        const modules = Object.entries(grouped).map(([module, perms]) => ({ module, permissions: perms }));

        return sendSuccessResponse(res, 200, true, "All Permission fetched successfully.", "Permission", {
            permissions,
            modules,
            count: permissions.length,
        });
    } catch (error) {
        next(error);
    }
};
export default getPermission;
