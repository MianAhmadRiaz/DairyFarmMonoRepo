import FeedFormulations from "../../models/feedFormulation.js";
import FeedFormulationsItems from "../../models/feedFormulationItems.js";
import { getUserById } from "../../repo/user.js";
import { ApiError } from "../../utils/ApiError.js";
import sendSuccessResponse from "../../utils/responses/sendSuccessResponse.js";
import isValidUUID from "../../utils/uuidValidator.js";

const GetFeedFormulations = async (req, res, next) => {
    try {
        const { query: { limit = 20, page = 1, formulationId }, userId } = req;
        const offset = (page - 1) * limit;
        const user = await getUserById(userId);
        if (!user) throw new ApiError("Unauthorized", 400, "Unauthorized access.", true);
        const { farmId } = user;
        if (!farmId) throw new ApiError("Unauthorized", 400, "Farm not found.", true);
        const includeItems = {
            model: FeedFormulationsItems,
            as: "items",
            where: { isDeleted: false },
            required: false,
        };
        if (isValidUUID(formulationId)) {
            const formulation = await FeedFormulations.findOne({ where: { uuid: formulationId, farmId, isDeleted: false }, include: [includeItems] });
            if (!formulation) throw new ApiError("Invalid Details", 400, "Stock formulation not found with provided formulationId", true);
            return sendSuccessResponse(res, 200, true, "Feed Formulations fetched successfully.", "feed-formulation", formulation);
        }
        const where = { isDeleted: false, farmId };
        const { count, rows: formulations } = await FeedFormulations.findAndCountAll({
            where,
            distinct: true,
            include: [includeItems],
            offset,
            limit,
            order: [["createdAt", "DESC"]],
        });

        const totalPages = Math.ceil(count / limit);
        const responseData = {
            formulations,
            page: Number(page),
            totalPages: Number(totalPages),
            limit: Number(limit),
            skip: offset,
            totalCount: Number(count),
        };
        return sendSuccessResponse(res, 200, true, "Feed Formulations fetched successfully.", "feed-formulation", responseData);
    } catch (error) {
        next(error);
    }
    return GetFeedFormulations;
};
export default GetFeedFormulations;
