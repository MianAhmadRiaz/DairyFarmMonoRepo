import Admin from "../../../models/softwareAdmin.js";
import { getUserById } from "../../../repo/user.js";
import { ApiError } from "../../../utils/ApiError.js";
import sendSuccessResponse from "../../../utils/responses/sendSuccessResponse.js";
import isValidUUID from "../../../utils/uuidValidator.js";

const getUserList = async (req, res, next) => {
    try {
        const { query: { limit = 10, page = 1, userId: requestedUserId }, userId } = req;
        const offset = (page - 1) * limit;
        const user = await getUserById(userId, true);
        if (!user) throw new ApiError("Unauthorized", 400, "Unauthorized access.", true);
        if (isValidUUID(requestedUserId)) {
            const checkUser = await Admin.findOne({ where: { uuid: requestedUserId, isDeleted: false }, attributes: { exclude: ["password"] }, raw: true });
            if (!checkUser) throw new ApiError("Invalid Details", 400, "User not found with provided userId", true);
            return sendSuccessResponse(res, 200, true, "User fetched successfully.", "user", checkUser);
        }
        const where = { isDeleted: false };
        const { count, rows: Users } = await Admin.findAndCountAll({
            where,
            offset,
            limit,
            attributes: { exclude: ["password"] },
            order: [["createdAt", "DESC"]],
        });
        const totalPages = Math.ceil(count / limit);
        const responseData = {
            Users,
            page: Number(page),
            totalPages: Number(totalPages),
            limit: Number(limit),
            skip: offset,
            totalCount: Number(count),
        };
        return sendSuccessResponse(res, 200, true, "Users fetched successfully.", null, responseData);
    } catch (error) {
        next(error);
    }
    return getUserList;
};
export default getUserList;
