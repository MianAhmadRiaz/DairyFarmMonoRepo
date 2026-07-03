import Role from "../../../models/role.js";
import User from "../../../models/user.js";
import { getUserById } from "../../../repo/user.js";
import { ApiError } from "../../../utils/ApiError.js";
import sendSuccessResponse from "../../../utils/responses/sendSuccessResponse.js";
import isValidUUID from "../../../utils/uuidValidator.js";

const getUserList = async (req, res, next) => {
    try {
        const { query: { limit = 10, page = 1, userId: requestedUserId }, userId } = req;
        const offset = (page - 1) * limit;
        const user = await getUserById(userId);
        if (!user) throw new ApiError("Unauthorized", 400, "Unauthorized access.", true);
        const { farmId } = user;
        if (!farmId) throw new ApiError("Unauthorized", 400, "Farm not found.", true);
        if (isValidUUID(requestedUserId)) {
            const user = await User.findOne({ where: { uuid: requestedUserId, farmId, isDeleted: false }, attributes: { exclude: ["password"] }, raw: true });
            if (!user) throw new ApiError("Invalid Details", 400, "Tag not found with provided userId", true);
            return sendSuccessResponse(res, 200, true, "User fetched successfully.", "user", user);
        }
        const where = { farmId, isDeleted: false };
        const { count, rows: Users } = await User.findAndCountAll({
            where,
            offset,
            limit,
            attributes: { exclude: ["password"] },
            order: [["createdAt", "DESC"]],
            include: [
                {
                    model: Role,
                    as: "role",
                    attributes: ["uuid", "name"],
                },
            ],
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
