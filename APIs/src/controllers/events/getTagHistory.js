import Animal from "../../models/animal.js";
import Tag from "../../models/tag.js";
import TagHistory from "../../models/tagHistory.js";
import { getUserById } from "../../repo/user.js";
import { ApiError } from "../../utils/ApiError.js";
import sendSuccessResponse from "../../utils/responses/sendSuccessResponse.js";
import isValidUUID from "../../utils/uuidValidator.js";

const GetTagHistory = async (req, res, next) => {
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
        const { count, rows: tagHistory } = await TagHistory.findAndCountAll({
            where,
            offset,
            limit,
            order: [["createdAt", "DESC"]],
            include: [
                {
                    model: Tag,
                    as: "oldTag",
                    attributes: ["uuid", "name"],
                },
                {
                    model: Tag,
                    as: "newTag",
                    attributes: ["uuid", "name"],
                },
            ],
        });

        const totalPages = Math.ceil(count / limit);
        const responseData = {
            tagHistory,
            page: Number(page),
            totalPages: Number(totalPages),
            limit: Number(limit),
            skip: offset,
            totalCount: Number(count),
        };
        return sendSuccessResponse(res, 200, true, "animals fetched successfully.", "animal", responseData);
    } catch (error) {
        next(error);
    }
    return GetTagHistory;
};
export default GetTagHistory;
