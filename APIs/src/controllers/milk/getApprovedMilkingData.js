import Animal from "../../models/animal.js";
import Milk from "../../models/milk.js";
import Tag from "../../models/tag.js";
import { getUserById } from "../../repo/user.js";
import { ApiError } from "../../utils/ApiError.js";
import sendSuccessResponse from "../../utils/responses/sendSuccessResponse.js";
import isValidUUID from "../../utils/uuidValidator.js";

const GetApprovedMilkingData = async (req, res, next) => {
    try {
        const { query: { limit = 10, page = 1, date = new Date().toISOString().split("T")[0], animalId, penId }, userId } = req;
        const offset = (page - 1) * limit;
        const user = await getUserById(userId);
        if (!user) throw new ApiError("Unauthorized", 400, "Unauthorized access.", true);
        const { farmId } = user;
        if (!farmId) throw new ApiError("Unauthorized", 400, "Farm not found.", true);

        let where = { farmId, date };
        if (isValidUUID(animalId)) where = { farmId, animalId };
        if (isValidUUID(penId)) where = { farmId, date, penId };
        const { count, rows: data } = await Milk.findAndCountAll({
            where,
            offset,
            limit,
            order: [["createdAt", "DESC"]],
            include: [
                {
                    model: Animal,
                    as: "animal",
                    attributes: ["name", "tagId", "uuid", "calving_date", "animalType", "breedType"],
                    include: [
                        {
                            model: Tag,
                            as: "tag",
                            attributes: ["name", "uuid"]
                        }
                    ]
                }
            ]
        })

        const result = data.map(item => {
            const plainItem = item.toJSON();

            let DIM = 1;
            const calvingDateStr = plainItem.animal?.calving_date;
            if (calvingDateStr) {
                const calvingDate = new Date(calvingDateStr);
                const today = new Date();
                const diffTime = today - calvingDate;
                const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
                DIM = diffDays > 0 ? diffDays : 1;
            }

            return {
                ...plainItem,
                DIM
            };
        });

        const totalPages = Math.ceil(count / limit);
        const responseData = {
            approvedMilk: result,
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
    return GetApprovedMilkingData;
};
export default GetApprovedMilkingData;
