import { PregnancyStatuses } from "../../constants/index.js";
import Animal from "../../models/animal.js";
import Bull from "../../models/bull.js";
import Pen from "../../models/pen.js";
import PregnancyStatus from "../../models/pregnancyStatus.js";
import Tag from "../../models/tag.js";
import { getUserById } from "../../repo/user.js";
import { ApiError } from "../../utils/ApiError.js";
import sendSuccessResponse from "../../utils/responses/sendSuccessResponse.js";

const GetAllAnimals = async (req, res, next) => {
    try {
        const { query: { limit = 20, page = 1, gender, animalCategory, is_inseminated, is_pregnant = false }, userId } = req;
        const offset = (page - 1) * limit;
        const user = await getUserById(userId);
        if (!user) throw new ApiError("Unauthorized", 400, "Unauthorized access.", true);
        const { farmId } = user;
        if (!farmId) throw new ApiError("Unauthorized", 400, "Farm not found.", true);
        const where = { isDeleted: false, farmId };
        if (gender) where.gender = gender.toLowerCase();
        if (is_inseminated) where.pregnancy_status = PregnancyStatuses.INSAMINATED;
        if (animalCategory) where.animalCategory = animalCategory?.trim()?.toLowerCase();
        const ispregnant = is_pregnant === "true";
        if (ispregnant) where.ispregnant = true;
        const { count, rows: animals } = await Animal.findAndCountAll({
            where,
            offset,
            limit,
            order: [["createdAt", "DESC"]],
            include: [
                {
                    model: Tag,
                    as: "tag",
                    attributes: ["uuid", "name"],
                },
                {
                    model: Pen,
                    as: "pen",
                    attributes: ["uuid", "name"],
                },
                {
                    model: Animal,
                    as: "mother",
                    attributes: ["uuid", "name", "tagId", "tagName"],
                    include: [
                        {
                            model: PregnancyStatus,
                            as: "pregnancyStatus",
                            attributes: ["status"]
                        }
                    ]
                },
                {
                    model: Bull,
                    as: "father",
                    attributes: ["uuid", "name"],
                },
            ]
        });

        const totalPages = Math.ceil(count / limit);
        const responseData = {
            animals,
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
    return GetAllAnimals;
};
export default GetAllAnimals;
