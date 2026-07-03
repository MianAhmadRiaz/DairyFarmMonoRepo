import Sequelize from "../../config/db.js";
import Animal from "../../models/animal.js";
import LactationHistory from "../../models/animalLactationHistory.js";
import MilkIn from "../../models/milk.js";
import { getUserById } from "../../repo/user.js";
import { ApiError } from "../../utils/ApiError.js";
import getDaysBetweenDates from "../../utils/getDaysBetweenDates.js";
import sendSuccessResponse from "../../utils/responses/sendSuccessResponse.js";
import isValidUUID from "../../utils/uuidValidator.js";

const GetMilkPerLactation = async (req, res, next) => {
    const { col, fn, literal } = Sequelize;
    try {
        const { query: { lactation, animalId }, userId } = req;
        const user = await getUserById(userId);
        if (!user) throw new ApiError("Unauthorized", 400, "Unauthorized access.", true);
        const { farmId } = user;
        if (!farmId) throw new ApiError("Unauthorized", 400, "Farm not found.", true);
        if (!isValidUUID(animalId)) throw new ApiError("Invalid Details", 400, "Please provide animalId for AI Breeding events history.", true);
        const checkAnimal = await Animal.findOne({ where: { uuid: animalId, farmId, isDeleted: false }, raw: true });
        if (!checkAnimal) throw new ApiError("Invalid Details", 400, "Animal not found with provided uuid", true);
        const where = { farmId, animalId };
        if (lactation) where.animal_curr_lactation = lactation;
        const [totalMilk, milkData, lactationData, lactationHistory] = await Promise.all([
            MilkIn.findOne({
                attributes: [
                    [fn("SUM", col("totalMilk")), "totalMilk"]
                ],
                where,
                raw: true,
            }),
            MilkIn.findAll({
                where: { animalId, farmId },
                attributes: [
                    [fn("TO_CHAR", col("date"), "Month"), "month"],
                    [fn("EXTRACT", literal("MONTH FROM date")), "monthNumber"],
                    [fn("SUM", col("milk1")), "milk1"],
                    [fn("SUM", col("milk2")), "milk2"],
                    [fn("SUM", col("milk3")), "milk3"],
                    [literal("SUM(milk1 + milk2 + milk3)"), "milk"],
                ],
                group: [literal("EXTRACT(MONTH FROM date), TO_CHAR(date, 'Month')")],
                order: [[literal("EXTRACT(MONTH FROM date)"), "ASC"]],
                raw: true,
            }),
            MilkIn.findAll({
                attributes: ["animal_curr_lactation", [fn("SUM", col("totalMilk")), "totalMilk"]],
                where: { animalId, farmId },
                group: ["animal_curr_lactation"],
                order: [["animal_curr_lactation", "ASC"]]
            }),
            LactationHistory.findAll({ where: { animalId }, raw: true }),
        ]);
        const formattedData = lactationHistory.map(entry => ({
            lactation: entry.lactation,
            daysInMilk: Math.floor((new Date(entry.calving_date) - new Date(entry.pre_calving_date)) / (1000 * 60 * 60 * 24))
        }));
        const DIM = getDaysBetweenDates(checkAnimal.calving_date);
        const finalResponse = {
            ...totalMilk,
            currentLactation: checkAnimal.lactation,
            DIM: DIM || 0,
            milkData,
            lactationData,
            lactationHistory: formattedData
        }
        return sendSuccessResponse(res, 200, true, "milk analytics fetched successfully.", "milk", finalResponse);
    } catch (error) {
        next(error);
    }
    return GetMilkPerLactation;
};
export default GetMilkPerLactation;
