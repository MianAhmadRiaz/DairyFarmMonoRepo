import { RoleTypes } from "../constants/index.js";
import { ApiError } from "../utils/ApiError.js";

// Gate for farm administration endpoints (user management, farm settings).
// Runs after authMiddleware, which sets req.role from the JWT.
const requireAdminRole = (req, res, next) => {
    try {
        const role = (req.role || "").toLowerCase();
        if (role !== RoleTypes.ADMIN && role !== RoleTypes.SUPER_ADMIN) {
            throw new ApiError("Forbidden", 403, "Only farm admins can perform this action.", true);
        }
        next();
    } catch (error) {
        next(error);
    }
};

export default requireAdminRole;
