import Pen from "../../models/pen.js";
import { getUserById } from "../../repo/user.js";
import { ApiError } from "../../utils/ApiError.js";
import sendSuccessResponse from "../../utils/responses/sendSuccessResponse.js";
import isValidUUID from "../../utils/uuidValidator.js";

const GetAllPens = async (req, res, next) => {
    try {
        const { query: { limit = 20, page = 1, penId }, userId } = req;
        const offset = (page - 1) * limit;
        const user = await getUserById(userId);
        if (!user) throw new ApiError("Unauthorized", 400, "Unauthorized access.", true);
        const { farmId } = user;
        if (!farmId) throw new ApiError("Unauthorized", 400, "Farm not found.", true);
        if (isValidUUID(penId)) {
            const pen = await Pen.findOne({ where: { uuid: penId, farmId, isDeleted: false }, raw: true });
            if (!pen) throw new ApiError("Invalid Details", 400, "Pen not found with provided penId", true);
            return sendSuccessResponse(res, 200, true, "pen fetched successfully.", "pen", pen);
        }
        const where = { isDeleted: false, farmId };
        const { count, rows: pens } = await Pen.findAndCountAll({
            where,
            offset,
            limit,
            order: [["createdAt", "DESC"]],
        });

        const totalPages = Math.ceil(count / limit);
        const responseData = {
            pens,
            page: Number(page),
            totalPages: Number(totalPages),
            limit: Number(limit),
            skip: offset,
            totalCount: Number(count),
        };
        return sendSuccessResponse(res, 200, true, "pens fetched successfully.", "pens", responseData);
    } catch (error) {
        next(error);
    }
    return GetAllPens;
};
export default GetAllPens;
