import { ApiError } from "../utils/ApiError.js";
import { getUserById } from "../repo/user.js";
import { getUserPermissions } from "../repo/rbac.js";

// Route guard requiring a specific permission NAME (e.g. "milk:approve").
// The account Owner role bypasses all checks. Runs after authMiddleware.
//
// Usage: router.post("/", checkPermission(PERMISSIONS.MILK_APPROVE), handler)
const checkPermission = (requiredPermission) => {
    return async (req, res, next) => {
        try {
            const { userId } = req;
            const user = await getUserById(userId);
            if (!user) throw new ApiError("Unauthorized", 401, "Unauthorized access.", true);
            if (!user.roleId) throw new ApiError("Forbidden", 403, "No role assigned to your account.", true);

            const { permissions, isOwner } = await getUserPermissions(user.roleId);
            if (isOwner) { req.permissions = permissions; return next(); }
            if (!permissions.includes(requiredPermission)) {
                throw new ApiError("Forbidden", 403, `You do not have permission to perform this action (${requiredPermission}).`, true);
            }
            req.permissions = permissions;
            next();
        } catch (error) {
            next(error);
        }
    };
};
export default checkPermission;
