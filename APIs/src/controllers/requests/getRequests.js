import Requests from "../../models/requests.js";
import User from "../../models/user.js";
import { getUserById } from "../../repo/user.js";
import { ApiError } from "../../utils/ApiError.js";
import sendSuccessResponse from "../../utils/responses/sendSuccessResponse.js";
import isValidUUID from "../../utils/uuidValidator.js";

const getRequests = async (req, res, next) => {
    try {
        const { query: { limit = 20, page = 1, status, requestId }, userId } = req;
        const offset = (page - 1) * limit;
        const user = await getUserById(userId);
        if (!user) throw new ApiError("Unauthorized", 400, "Unauthorized access.", true);
        const { farmId } = user;
        if (!farmId) throw new ApiError("Unauthorized", 400, "Farm not found.", true);
        if (isValidUUID(requestId)) {
            const task = await Requests.findOne({ where: { uuid: requestId, farmId, isDeleted: false }, raw: true });
            if (!task) throw new ApiError("Invalid Details", 400, "request not found with provided requestId", true);
            return sendSuccessResponse(res, 200, true, "request fetched successfully.", "request", task);
        }
        const where = { isDeleted: false, farmId };
        if (status) where.status = status?.toLowerCase();
        const { count, rows: tasks } = await Requests.findAndCountAll({
            where,
            offset,
            limit,
            include: [
                {
                    model: User,
                    as: "user",
                    attributes: ["uuid", "firstname", "lastname" ],
                    required: false,
                },
            ],
            order: [["createdAt", "DESC"]],
        });

        const totalPages = Math.ceil(count / limit);
        const responseData = {
            tasks,
            page: Number(page),
            totalPages: Number(totalPages),
            limit: Number(limit),
            skip: offset,
            totalCount: Number(count),
        };
        return sendSuccessResponse(res, 200, true, "Requests fetched successfully.", "request", responseData);
    } catch (error) {
        next(error);
    }
    return getRequests;
};
export default getRequests;
