import Designation from "../../models/designation.js";
import { getUserById } from "../../repo/user.js";
import { ApiError } from "../../utils/ApiError.js";
import sendSuccessResponse from "../../utils/responses/sendSuccessResponse.js";
import isValidUUID from "../../utils/uuidValidator.js";

const getDesignations = async (req, res, next) => {
    try {
        const { query: { limit = 50, page = 1, designationId }, userId } = req;
        const offset = (page - 1) * limit;
        const user = await getUserById(userId);
        if (!user) throw new ApiError("Unauthorized", 400, "Unauthorized access.", true);
        const { farmId } = user;
        if (!farmId) throw new ApiError("Unauthorized", 400, "Farm not found.", true);
        if (isValidUUID(designationId)) {
            const designation = await Designation.findOne({ where: { uuid: designationId, farmId, isDeleted: false }, raw: true });
            if (!designation) throw new ApiError("Invalid Details", 400, "Designation not found with provided designationId", true);
            return sendSuccessResponse(res, 200, true, "Designation fetched successfully.", "designation", designation);
        }
        const { count, rows: designations } = await Designation.findAndCountAll({
            where: { isDeleted: false, farmId },
            offset,
            limit,
            order: [["createdAt", "DESC"]],
        });
        const totalPages = Math.ceil(count / limit);
        const responseData = {
            designations,
            page: Number(page),
            totalPages: Number(totalPages),
            limit: Number(limit),
            skip: offset,
            totalCount: Number(count),
        };
        return sendSuccessResponse(res, 200, true, "Designations fetched successfully.", "designation", responseData);
    } catch (error) {
        next(error);
    }
    return false;
};

export default getDesignations;
