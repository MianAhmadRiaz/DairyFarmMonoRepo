import { ApiError } from "../utils/ApiError.js";
import validateToken from "../utils/validateToken.js";

const authMiddleware = (req, res, next) => {
    // get bearer token from header
    try {
        const token = req.headers.authorization;
        if (!token) {
            throw new ApiError("Access denied", 401, "no token provided");
        }

        const getToken = validateToken(token);
        if (!getToken.token && getToken?.message) {
            const errorKey = getToken?.message.split(" ")[0];
            if (errorKey === "invalid") throw new ApiError("Access denied", 401, "invalid token");
            if (errorKey === "jwt") throw new ApiError("Access denied", 401, "jwt expire");
            throw new ApiError("Access denied", 401, "something went wrong");
        }
        const getTheEndpointname = req.originalUrl.split("/").at(-1);
        if (getToken.user?.type && getTheEndpointname !== "verify-otp") throw new ApiError("Access denied.", 401, "Access denied. You can use this token only for 2F-authentication", true);
        req.userId = getToken.user.userId;
        req.role = getToken.user.role;

        next();
    } catch (error) {
        next(error);
    }
    return authMiddleware;
};

export default authMiddleware;
