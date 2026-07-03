import Animal from "../../models/animal.js";
import Pen from "../../models/pen.js";
import PenHistory from "../../models/penHistory.js";
import { getUserById } from "../../repo/user.js";
import { ApiError } from "../../utils/ApiError.js";
import sendSuccessResponse from "../../utils/responses/sendSuccessResponse.js";
import isValidUUID from "../../utils/uuidValidator.js";

const GetPenHistory = async (req, res, next) => {
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
        const { count, rows: penHistory } = await PenHistory.findAndCountAll({
            where,
            offset,
            limit,
            order: [["createdAt", "DESC"]],
            include: [
                {
                    model: Pen,
                    as: "oldPen",
                    attributes: ["uuid", "name"],
                },
                {
                    model: Pen,
                    as: "newPen",
                    attributes: ["uuid", "name"],
                },
                {
                    model: Animal,
                    as: "animal",
                    attributes: ["uuid", "name", "tagId", "tagName"],
                },
            ],
        });

        const totalPages = Math.ceil(count / limit);
        const responseData = {
            penHistory,
            page: Number(page),
            totalPages: Number(totalPages),
            limit: Number(limit),
            skip: offset,
            totalCount: Number(count),
        };
        return sendSuccessResponse(res, 200, true, "animal pens hsitory fetched successfully.", "animal", responseData);
    } catch (error) {
        next(error);
    }
    return GetPenHistory;
};
export default GetPenHistory;
