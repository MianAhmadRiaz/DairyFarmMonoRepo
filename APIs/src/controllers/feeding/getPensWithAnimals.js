import Animal from "../../models/animal.js";
import Pen from "../../models/pen.js";
import Shed from "../../models/shed.js";
import { getUserById } from "../../repo/user.js";
import { ApiError } from "../../utils/ApiError.js";
import sendSuccessResponse from "../../utils/responses/sendSuccessResponse.js";
import isValidUUID from "../../utils/uuidValidator.js";

const GetPensWithAnimals = async (req, res, next) => {
    try {
        const { query: { limit = 20, page = 1, shedId }, userId } = req;
        const offset = (page - 1) * limit;
        const user = await getUserById(userId);
        if (!user) throw new ApiError("Unauthorized", 400, "Unauthorized access.", true);
        const { farmId } = user;
        if (!farmId) throw new ApiError("Unauthorized", 400, "Farm not found.", true);

        const where = { isDeleted: false, farmId };
        if (isValidUUID(shedId)) {
            where.shedId = shedId;
        }

        const { count, rows: pens } = await Pen.findAndCountAll({
            where,
            offset,
            limit,
            order: [["createdAt", "DESC"]],
            include: [
                {
                    model: Shed,
                    as: "shed",
                    attributes: ["uuid", "name", "shed_type"],
                    required: false,
                }
            ]
        });

        // Get animal counts for each pen
        const pensWithAnimals = await Promise.all(
            pens.map(async (pen) => {
                const animalCount = await Animal.count({
                    where: {
                        penId: pen.uuid,
                        isDeleted: false,
                        farmId
                    }
                });

                // Get animals in the pen for detailed view
                const animals = await Animal.findAll({
                    where: {
                        penId: pen.uuid,
                        isDeleted: false,
                        farmId
                    },
                    attributes: ['uuid', 'name', 'tagName', 'animalType', 'gender', 'healthStatus'],
                    limit: 10 // Limit to first 10 animals for performance
                });

                return {
                    ...pen.toJSON(),
                    animalCount,
                    animals,
                    hasMoreAnimals: animalCount > 10
                };
            })
        );

        const totalPages = Math.ceil(count / limit);
        const responseData = {
            pens: pensWithAnimals,
            page: Number(page),
            totalPages: Number(totalPages),
            limit: Number(limit),
            skip: offset,
            totalCount: Number(count),
        };
        
        return sendSuccessResponse(res, 200, true, "Pens with animal details fetched successfully.", "pens", responseData);
    } catch (error) {
        next(error);
    }
};

export default GetPensWithAnimals;