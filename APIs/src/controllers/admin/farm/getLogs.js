import { Op } from "sequelize";
import Logs from "../../../models/farmLogs.js";
import { getUserById } from "../../../repo/user.js";
import { ApiError } from "../../../utils/ApiError.js";
import sendSuccessResponse from "../../../utils/responses/sendSuccessResponse.js";

const getLogs = async (req, res, next) => {
    try {
        const { query: { limit = 10, page = 1, search }, userId } = req;
        const offset = (page - 1) * limit;
        const user = await getUserById(userId);
        if (!user) throw new ApiError("Unauthorized", 400, "Unauthorized access.", true);
        const { farmId } = user;
        if (!farmId) throw new ApiError("Unauthorized", 400, "Farm not found.", true);
        const where = { farmId };
        if (search) where.message = { [Op.iLike]: `%${search}%` }
        const { count, rows: logs } = await Logs.findAndCountAll({
            where,
            offset,
            limit,
            order: [["createdAt", "DESC"]],
        });
        const totalPages = Math.ceil(count / limit);
        const responseData = {
            logs,
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
    return getLogs;
};
export default getLogs;
