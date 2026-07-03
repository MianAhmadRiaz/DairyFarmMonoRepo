import { ApiError } from "../utils/ApiError.js";
import { getUserById } from "../repo/user.js";
import { getUserPermissions } from "../repo/rbac.js";

// Module-level RBAC guard applied at router mount. Picks the required permission
// from the HTTP method: GET → viewPerm, any mutation → managePerm. Specific
// sensitive routes are overridden via `overrides` — an array of
// { method, test(path), permission } checked before the method default.
//
// The Owner role bypasses everything. `req.permissions` is populated for
// downstream handlers / response shaping.
const modulePermission = (viewPerm, managePerm, overrides = []) => {
    return async (req, res, next) => {
        try {
            const { userId } = req;
            const user = await getUserById(userId);
            if (!user) throw new ApiError("Unauthorized", 401, "Unauthorized access.", true);
            if (!user.roleId) throw new ApiError("Forbidden", 403, "No role assigned to your account.", true);

            const { permissions, isOwner } = await getUserPermissions(user.roleId);
            req.permissions = permissions;
            if (isOwner) return next();

            const method = req.method.toUpperCase();
            // req.path is relative to the mounted router (e.g. "/out", "/approved").
            const path = req.path || "/";

            let required = method === "GET" ? viewPerm : managePerm;
            for (const o of overrides) {
                if (o.method && o.method.toUpperCase() !== method) continue;
                if (o.test(path)) { required = o.permission; break; }
            }

            // A route may require no permission (e.g. viewPerm null for open reads).
            if (!required) return next();
            if (!permissions.includes(required)) {
                throw new ApiError("Forbidden", 403, `You do not have permission to perform this action (${required}).`, true);
            }
            next();
        } catch (error) {
            next(error);
        }
    };
};

export default modulePermission;
