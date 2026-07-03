import FeedFormulationsHistory from "../../models/feedFormulationHistory.js";
import { getUserById } from "../../repo/user.js";
import { ApiError } from "../../utils/ApiError.js";
import sendSuccessResponse from "../../utils/responses/sendSuccessResponse.js";
import isValidUUID from "../../utils/uuidValidator.js";

const GetFeedUsage = async (req, res, next) => {
    try {
        const { query: { limit = 20, page = 1, usageId }, userId } = req;
        const offset = (page - 1) * limit;
        const user = await getUserById(userId);
        if (!user) throw new ApiError("Unauthorized", 400, "Unauthorized access.", true);
        const { farmId } = user;
        if (!farmId) throw new ApiError("Unauthorized", 400, "Farm not found.", true);
        if (isValidUUID(usageId)) {
            const item = await FeedFormulationsHistory.findOne({ where: { uuid: usageId, farmId, isDeleted: false }, raw: true });
            if (!item) throw new ApiError("Invalid Details", 400, "Feed usage not found with provided usageId", true);
            return sendSuccessResponse(res, 200, true, "Feed usage fetched successfully.", "feed=formulation", item);
        }
        const where = { isDeleted: false, farmId };
        const { count, rows: usageHistory } = await FeedFormulationsHistory.findAndCountAll({
            where,
            offset,
            limit,
            order: [["createdAt", "DESC"]],
        });

        const totalPages = Math.ceil(count / limit);
        const responseData = {
            usageHistory,
            page: Number(page),
            totalPages: Number(totalPages),
            limit: Number(limit),
            skip: offset,
            totalCount: Number(count),
        };
        return sendSuccessResponse(res, 200, true, "Feed Usage history fetched successfully.", "feed-formulation", responseData);
    } catch (error) {
        next(error);
    }
    return GetFeedUsage;
};
export default GetFeedUsage;
