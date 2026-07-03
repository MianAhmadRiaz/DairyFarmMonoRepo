import Sequelize from "sequelize";
import Animal from "../../models/animal.js";
import Treatment from "../../models/treatment.js";
import { getUserById } from "../../repo/user.js";
import { ApiError } from "../../utils/ApiError.js";
import getDaysBetweenDates from "../../utils/getDaysBetweenDates.js";
import sendSuccessResponse from "../../utils/responses/sendSuccessResponse.js";

const { col, fn } = Sequelize;

// Herd-wide disease/treatment summary: counts by type, top diagnoses, currently
// sick animals, cost trend, and days-since-last-vaccination/deworming per animal
// (the honest substitute for a due-date schedule the system doesn't track).
const GetTreatmentSummary = async (req, res, next) => {
    try {
        const { query: { year }, userId } = req;
        const user = await getUserById(userId);
        if (!user) throw new ApiError("Unauthorized", 400, "Unauthorized access.", true);
        const { farmId } = user;
        if (!farmId) throw new ApiError("Unauthorized", 400, "Farm not found.", true);
        const targetYear = year ? Number(year) : new Date().getFullYear();

        const [byType, topDiagnoses, sickAnimals, totalCostRow, monthlyCost, lastByTypePerAnimal] = await Promise.all([
            Treatment.findAll({
                where: { farmId, isDeleted: false },
                attributes: ["treatmentType", [fn("COUNT", col("uuid")), "count"]],
                group: ["treatmentType"],
                raw: true,
            }),
            Treatment.findAll({
                where: { farmId, isDeleted: false, diagnosis: { [Sequelize.Op.ne]: null } },
                attributes: ["diagnosis", [fn("COUNT", col("uuid")), "count"]],
                group: ["diagnosis"],
                order: [[fn("COUNT", col("uuid")), "DESC"]],
                limit: 10,
                raw: true,
            }),
            Animal.findAll({
                where: { farmId, isDeleted: false, healthStatus: "sick" },
                attributes: ["uuid", "name", "tagName", "animalCategory"],
                raw: true,
            }),
            Treatment.findOne({
                where: { farmId, isDeleted: false },
                attributes: [[fn("SUM", col("cost")), "totalCost"]],
                raw: true,
            }),
            Treatment.findAll({
                where: { farmId, isDeleted: false },
                attributes: [
                    [fn("TO_CHAR", col("date"), "Month"), "month"],
                    [fn("EXTRACT", Sequelize.literal("MONTH FROM date")), "monthNumber"],
                    [fn("SUM", col("cost")), "cost"],
                ],
                group: [Sequelize.literal("EXTRACT(MONTH FROM date), TO_CHAR(date, 'Month')")],
                order: [[Sequelize.literal("EXTRACT(MONTH FROM date)"), "ASC"]],
                raw: true,
            }),
            Treatment.findAll({
                where: { farmId, isDeleted: false, treatmentType: ["vaccination", "deworming"] },
                attributes: ["animalId", "treatmentType", [fn("MAX", col("date")), "lastDate"]],
                include: [{ model: Animal, as: "animal", attributes: ["uuid", "name", "tagName"] }],
                group: ["animalId", "treatmentType", "animal.uuid", "animal.name", "animal.tagName"],
                raw: true,
                nest: true,
            }),
        ]);

        const daysSinceList = lastByTypePerAnimal
            .map(r => ({
                animal: r.animal,
                treatmentType: r.treatmentType,
                lastDate: r.lastDate,
                daysSince: getDaysBetweenDates(r.lastDate),
            }))
            .sort((a, b) => b.daysSince - a.daysSince);

        const data = {
            byType,
            topDiagnoses,
            sickAnimals,
            totalCost: Number(totalCostRow?.totalCost || 0),
            monthlyCostTrend: monthlyCost,
            daysSinceLastVaccinationOrDeworming: daysSinceList,
            year: targetYear,
        };

        return sendSuccessResponse(res, 200, true, "Treatment summary fetched successfully.", "treatments", data);
    } catch (error) {
        next(error);
    }
};

export default GetTreatmentSummary;
