
import { col, fn, Op } from "sequelize";
import Animal from "../../models/animal.js";
import MilkIn from "../../models/milk.js";
import { getUserById } from "../../repo/user.js";
import { ApiError } from "../../utils/ApiError.js";
import sendSuccessResponse from "../../utils/responses/sendSuccessResponse.js";
import Pen from "../../models/pen.js";

const GetMilkGraph = async (req, res, next) => {
    try {
        const { query: { animalId, penId, startDate, endDate = new Date() }, userId } = req;
        const user = await getUserById(userId);
        if (!user) throw new ApiError("Unauthorized", 400, "Unauthorized access.", true);
        const { farmId } = user;
        if (!farmId) throw new ApiError("Unauthorized", 400, "Farm not found.", true);
        if (!startDate) throw new ApiError("Unauthorized", 400, "Start date is required.", true);
        let where = {
            farmId, date: {
                [Op.gte]: startDate,
                [Op.lte]: endDate,
            },
        };
        if (animalId) {
            const checkAnimal = await Animal.findOne({ where: { uuid: animalId, farmId, isDeleted: false } });
            if (!checkAnimal) throw new ApiError("Invalid Details", 400, "Animal not found with provided uuid", true);
            where.animalId = animalId;
        } else if (penId) {
            const checkPen = await Pen.findOne({ where: { uuid: penId, farmId: user.farmId, isDeleted: false } });
            if (!checkPen) throw new ApiError("Invalid Details", 400, "Pen not found with provided uuid", true);
            where.penId = penId;
        }

        // Fetch Data
        const milks = await MilkIn.findAll({
            where,
            attributes: [
                [fn("DATE", col("date")), "milkDate"],
                [fn("SUM", col("totalMilk")), "totalMilk"],
            ],
            group: [fn("DATE", col("date"))],
            order: [[fn("DATE", col("date")), "ASC"]],
            raw: true,
        });
        const totalAnimals = await MilkIn.count({ where });
        const responseData = {
            milks,
            totalAnimals,
        };
        return sendSuccessResponse(res, 200, true, "milk graph data fetched successfully.", "milk", responseData);
    } catch (error) {
        next(error);
    }
    return GetMilkGraph;
};
export default GetMilkGraph;
