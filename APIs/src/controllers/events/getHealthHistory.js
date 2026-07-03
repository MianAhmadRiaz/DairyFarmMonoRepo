import Animal from "../../models/animal.js";
import HealthStatusHistory from "../../models/healthStatusHistory.js";
import User from "../../models/user.js";
import { getUserById } from "../../repo/user.js";
import { ApiError } from "../../utils/ApiError.js";
import sendSuccessResponse from "../../utils/responses/sendSuccessResponse.js";
import isValidUUID from "../../utils/uuidValidator.js";

const GethealthStatusHistory = async (req, res, next) => {
    try {
        const { query: { limit = 20, page = 1, animalId }, userId } = req;
        const offset = (page - 1) * limit;
        const user = await getUserById(userId);
        if (!user) throw new ApiError("Unauthorized", 400, "Unauthorized access.", true);
        const where = {};
        if (isValidUUID(animalId)) {
            const checkAnimal = await Animal.findOne({ where: { uuid: animalId } });
            if (!checkAnimal) throw new ApiError("Invalid Details", 400, "Animal not found with provided animalId.", true);
            where.animalId = animalId;
        }
        const { count, rows: healthHistory } = await HealthStatusHistory.findAndCountAll({
            where,
            offset,
            limit,
            order: [["createdAt", "DESC"]],
            include: [
                {
                    model: Animal,
                    as: "animal",
                    attributes: ["uuid", "name", "tagId"],
                },
                {
                    model: User,
                    as: "created",
                    attributes: ["uuid", "firstname", "lastname"],
                },
            ],
        });

        const totalPages = Math.ceil(count / limit);
        const responseData = {
            healthHistory,
            page: Number(page),
            totalPages: Number(totalPages),
            limit: Number(limit),
            skip: offset,
            totalCount: Number(count),
        };
        return sendSuccessResponse(res, 200, true, "animal health hsitory fetched successfully.", "animal", responseData);
    } catch (error) {
        next(error);
    }
    return GethealthStatusHistory;
};
export default GethealthStatusHistory;
