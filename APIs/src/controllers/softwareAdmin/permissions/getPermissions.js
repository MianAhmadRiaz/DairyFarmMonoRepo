import Permissions from "../../../models/permissions.js";
import { getUserById } from "../../../repo/user.js";
import { ApiError } from "../../../utils/ApiError.js";
import sendSuccessResponse from "../../../utils/responses/sendSuccessResponse.js";

const getPermission = async (req, res, next) => {
    const { userId } = req;
    try {
        const user = await getUserById(userId, true);
        if (!user) throw new ApiError("Unauthorized", 400, "Unauthorized access.", true);
        const where = { type: "system_admin", isDeleted: false }
        const { count, rows: permissions } = await Permissions.findAndCountAll({ where });
        const response = {
            permissions,
            count,
        }
        return sendSuccessResponse(res, 200, true, "All Permission fetched successfully.", "Permission", response);
    } catch (error) {
        next(error);
    }
    return getPermission;
};
export default getPermission;
