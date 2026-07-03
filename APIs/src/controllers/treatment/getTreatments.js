import Animal from "../../models/animal.js";
import Treatment from "../../models/treatment.js";
import { getUserById } from "../../repo/user.js";
import { ApiError } from "../../utils/ApiError.js";
import sendSuccessResponse from "../../utils/responses/sendSuccessResponse.js";
import isValidUUID from "../../utils/uuidValidator.js";

const GetTreatments = async (req, res, next) => {
    try {
        const { query: { limit = 20, page = 1, animalId, treatmentType }, userId } = req;
        const offset = (page - 1) * limit;
        const user = await getUserById(userId);
        if (!user) throw new ApiError("Unauthorized", 400, "Unauthorized access.", true);
        const { farmId } = user;
        if (!farmId) throw new ApiError("Unauthorized", 400, "Farm not found.", true);

        const where = { farmId, isDeleted: false };
        if (isValidUUID(animalId)) where.animalId = animalId;
        if (treatmentType) where.treatmentType = treatmentType;

        const { count, rows: treatments } = await Treatment.findAndCountAll({
            where,
            include: [{ model: Animal, as: "animal", attributes: ["uuid", "tagName", "name", "animalCategory"] }],
            offset,
            limit: Number(limit),
            order: [["date", "DESC"], ["createdAt", "DESC"]],
        });

        const totalPages = Math.ceil(count / limit);
        const responseData = {
            treatments,
            page: Number(page),
            totalPages: Number(totalPages),
            limit: Number(limit),
            skip: offset,
            totalCount: Number(count),
        };
        return sendSuccessResponse(res, 200, true, "treatments fetched successfully.", "treatments", responseData);
    } catch (error) {
        next(error);
    }
};
export default GetTreatments;
