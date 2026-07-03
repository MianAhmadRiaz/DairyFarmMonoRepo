import Farms from "../../../models/farm.js";
import { getUserById } from "../../../repo/user.js";
import { ApiError } from "../../../utils/ApiError.js";
import sendSuccessResponse from "../../../utils/responses/sendSuccessResponse.js";

const getFarmsList = async (req, res, next) => {
    try {
        const { query: { status, limit = 10, page = 1 }, userId } = req;
        const offset = (page - 1) * limit;
        const user = await getUserById(userId, true);
        if (!user) throw new ApiError("Unauthorized", 400, "Unauthorized access.", true);
        const where = {};
        if (status) where.status = status.toUpperCase();
        const { count, rows: farms } = await Farms.findAndCountAll({
            where,
            offset,
            limit,
            order: [["createdAt", "DESC"]]
        });
        const totalPages = Math.ceil(count / limit);
        const responseData = {
            farms,
            page: Number(page),
            totalPages: Number(totalPages),
            limit: Number(limit),
            skip: offset,
            totalCount: Number(count),
        };
        return sendSuccessResponse(res, 200, true, "Farms fetched successfully.", null, responseData);
    } catch (error) {
        next(error);
    }
    return getFarmsList;
};
export default getFarmsList;
