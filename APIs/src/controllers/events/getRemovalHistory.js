import Animal from "../../models/animal.js";
import AnimalRemovalHistory from "../../models/removalAnimalHistory.js";
import Tag from "../../models/tag.js";
import { getUserById } from "../../repo/user.js";
import { ApiError } from "../../utils/ApiError.js";
import sendSuccessResponse from "../../utils/responses/sendSuccessResponse.js";

const GetRemovalHistory = async (req, res, next) => {
    try {
        const { query: { limit = 20, page = 1 }, userId } = req;
        const offset = (page - 1) * limit;
        const user = await getUserById(userId);
        if (!user) throw new ApiError("Unauthorized", 400, "Unauthorized access.", true);
        const { farmId } = user;
        if (!farmId) throw new ApiError("Unauthorized", 400, "Farm not found.", true);
        const where = { farmId };
        const { count, rows: animalRemovalHistory } = await AnimalRemovalHistory.findAndCountAll({
            where,
            offset,
            limit,
            order: [["createdAt", "DESC"]],
            include: [
                {
                    model: Animal,
                    as: "animal",
                    attributes: ["uuid", "tagId", "name"],
                },
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
            animalRemovalHistory,
            page: Number(page),
            totalPages: Number(totalPages),
            limit: Number(limit),
            skip: offset,
            totalCount: Number(count),
        };
        return sendSuccessResponse(res, 200, true, "animal removal hsitory fetched successfully.", "animal", responseData);
    } catch (error) {
        next(error);
    }
    return GetRemovalHistory;
};
export default GetRemovalHistory;
