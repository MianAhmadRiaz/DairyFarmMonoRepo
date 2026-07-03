import { Op } from "sequelize";
import HeatDetectionReasons from "../../models/heatDetectionReason.js";
import { getUserById } from "../../repo/user.js";
import { ApiError } from "../../utils/ApiError.js";
import sendSuccessResponse from "../../utils/responses/sendSuccessResponse.js";

const GetheatDetectionReasons = async (req, res, next) => {
    try {
        const { query: { limit = 20, page = 1 }, userId } = req;
        const offset = (page - 1) * limit;
        const user = await getUserById(userId);
        if (!user) throw new ApiError("Unauthorized", 400, "Unauthorized access.", true);
        const { farmId } = user;
        if (!farmId) throw new ApiError("Unauthorized", 400, "Farm not found.", true);
        const where = { [Op.or]: [{ farmId }, { default: true } ]};
        const { count, rows: heatDetectionReasons } = await HeatDetectionReasons.findAndCountAll({
            where,
            offset,
            limit,
            order: [["createdAt", "DESC"]],
        });

        const totalPages = Math.ceil(count / limit);
        const responseData = {
            heatDetectionReasons,
            page: Number(page),
            totalPages: Number(totalPages),
            limit: Number(limit),
            skip: offset,
            totalCount: Number(count),
        };
        return sendSuccessResponse(res, 200, true, "Heat detection reasons fetched successfully.", "breeding-event", responseData);
    } catch (error) {
        next(error);
    }
    return GetheatDetectionReasons;
};
export default GetheatDetectionReasons;
