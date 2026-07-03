import AnimalTypes from "../../models/animalTypes.js";
import { getUserById } from "../../repo/user.js";
import { ApiError } from "../../utils/ApiError.js";
import sendSuccessResponse from "../../utils/responses/sendSuccessResponse.js";

const GetAllAnimalTypes = async (req, res, next) => {
    try {
        const { query: { limit = 20, page = 1 }, userId } = req;
        const offset = (page - 1) * limit;
        const user = await getUserById(userId);
        if (!user) throw new ApiError("Unauthorized", 400, "Unauthorized access.", true);
        const { farmId } = user;
        if (!farmId) throw new ApiError("Unauthorized", 400, "Farm not found.", true);
        
        const where = { isDeleted: false, farmId };
        const { count, rows: animalTypes } = await AnimalTypes.findAndCountAll({
            where,
            offset,
            limit,
            order: [["createdAt", "DESC"]],
        });

        const totalPages = Math.ceil(count / limit);
        const responseData = {
            animalTypes,
            page: Number(page),
            totalPages: Number(totalPages),
            limit: Number(limit),
            skip: offset,
            totalCount: Number(count),
        };
        return sendSuccessResponse(res, 200, true, "animalTypes fetched successfully.", "animalTypes", responseData);
    } catch (error) {
        next(error);
    }
    return GetAllAnimalTypes;
};
export default GetAllAnimalTypes;
