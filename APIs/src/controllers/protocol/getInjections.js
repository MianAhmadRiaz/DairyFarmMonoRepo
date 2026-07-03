import Injection from "../../models/injections.js";
import { getUserById } from "../../repo/user.js";
import { ApiError } from "../../utils/ApiError.js";
import sendSuccessResponse from "../../utils/responses/sendSuccessResponse.js";
import isValidUUID from "../../utils/uuidValidator.js";

const GetInjections = async (req, res, next) => {
    try {
        const { query: { limit = 20, page = 1, injectionId }, userId } = req;
        const offset = (page - 1) * limit;
        const user = await getUserById(userId);
        if (!user) throw new ApiError("Unauthorized", 400, "Unauthorized access.", true);
        const { farmId } = user;
        if (!farmId) throw new ApiError("Unauthorized", 400, "Farm not found.", true);
        if (isValidUUID(injectionId)) {
            const protocol = await Injection.findOne({ where: { uuid: injectionId, isDeleted: false }, raw: true });
            if (!protocol) throw new ApiError("Invalid Details", 400, "Injection not found with provided injectionId.", true);
            return sendSuccessResponse(res, 200, true, "Injection fetched successfully.", "Injection", protocol);
        }
        const where = { isDeleted: false, farmId };
        const { count, rows: injections } = await Injection.findAndCountAll({
            where,
            offset,
            limit,
            order: [["createdAt", "DESC"]],
        });

        const totalPages = Math.ceil(count / limit);
        const responseData = {
            injections,
            page: Number(page),
            totalPages: Number(totalPages),
            limit: Number(limit),
            skip: offset,
            totalCount: Number(count),
        };
        return sendSuccessResponse(res, 200, true, "injections fetched successfully.", "injection", responseData);
    } catch (error) {
        next(error);
    }
    return GetInjections;
};
export default GetInjections;
