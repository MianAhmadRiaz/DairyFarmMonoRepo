import Animal from "../../models/animal.js";
import Bull from "../../models/bull.js";
import BullBreedingEvent from "../../models/bullBreeding.js";
import { getUserById } from "../../repo/user.js";
import { ApiError } from "../../utils/ApiError.js";
import sendSuccessResponse from "../../utils/responses/sendSuccessResponse.js";
import isValidUUID from "../../utils/uuidValidator.js";

const GetBullBreedingEvents = async (req, res, next) => {
    try {
        const { query: { limit = 20, page = 1, animalId }, userId } = req;
        const offset = (page - 1) * limit;
        const user = await getUserById(userId);
        if (!user) throw new ApiError("Unauthorized", 400, "Unauthorized access.", true);
        const { farmId } = user;
        if (!farmId) throw new ApiError("Unauthorized", 400, "Farm not found.", true);
        const where = { farmId };
        if (isValidUUID(animalId)) {
            const checkAnimal = await Animal.findOne({ where: { uuid: animalId } });
            if (!checkAnimal) throw new ApiError("Invalid Details", 400, "Animal not found with provided animalId.", true);
            where.animalId = animalId;
        }
        const { count, rows: bullBreedingEventHistory } = await BullBreedingEvent.findAndCountAll({
            where,
            offset,
            limit,
            order: [["createdAt", "DESC"]],
            include: [
                {
                    model: Animal,
                    as: "animal",
                    attributes: ["uuid", "name", "tagId", "tagName"],
                },
                {
                    model: Bull,
                    as: "bull",
                    attributes: ["uuid", "name"],
                },
            ],
        });

        const totalPages = Math.ceil(count / limit);
        const responseData = {
            bullBreedingEventHistory,
            page: Number(page),
            totalPages: Number(totalPages),
            limit: Number(limit),
            skip: offset,
            totalCount: Number(count),
        };
        return sendSuccessResponse(res, 200, true, "Bull breeding Event hsitory fetched successfully.", "breeding-event", responseData);
    } catch (error) {
        next(error);
    }
    return GetBullBreedingEvents;
};
export default GetBullBreedingEvents;
