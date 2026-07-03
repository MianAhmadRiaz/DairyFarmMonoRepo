import Animal from "../../models/animal.js";
import Milk from "../../models/milk.js";
import { getUserById } from "../../repo/user.js";
import { ApiError } from "../../utils/ApiError.js";
import sendSuccessResponse from "../../utils/responses/sendSuccessResponse.js";

const GetAllAnimalMilk = async (req, res, next) => {
    try {
        const { query: { limit = 20, page = 1, animalId }, userId } = req;
        const offset = (page - 1) * limit;
        const user = await getUserById(userId);
        if (!user) throw new ApiError("Unauthorized", 400, "Unauthorized access.", true);
        const { farmId } = user;
        if (!farmId) throw new ApiError("Unauthorized", 400, "Farm not found.", true);
        const where = { farmId };
        if (animalId) {
            const checkAnimal = await Animal.findOne({ where: { uuid: animalId, farmId, isDeleted: false } });
            if (!checkAnimal) throw new ApiError("Invalid Details", 400, "Animal not found with provided uuid", true);
            where.animalId = animalId;
        }
        const { count, rows: milks } = await Milk.findAndCountAll({
            where,
            offset,
            limit,
            order: [["createdAt", "DESC"]],
        });

        const totalPages = Math.ceil(count / limit);
        const responseData = {
            milks,
            page: Number(page),
            totalPages: Number(totalPages),
            limit: Number(limit),
            skip: offset,
            totalCount: Number(count),
        };
        return sendSuccessResponse(res, 200, true, "animal milk fetched successfully.", "milk", responseData);
    } catch (error) {
        next(error);
    }
    return GetAllAnimalMilk;
};
export default GetAllAnimalMilk;
