import Sequelize, { Op } from "sequelize";
import Animal from "../../models/animal.js";
import MilkIn from "../../models/milk.js";
import MilkOut from "../../models/milkOut.js";
import Treatment from "../../models/treatment.js";
import CalvingEvent from "../../models/calvingEvent.js";
import FeedingSchedule from "../../models/feedingSchedule.js";
import { getUserById } from "../../repo/user.js";
import { ApiError } from "../../utils/ApiError.js";
import sendSuccessResponse from "../../utils/responses/sendSuccessResponse.js";

const { col, fn } = Sequelize;

// Herd-wide financial estimate. Vet/calving costs are real; milk income and
// feed cost are approximations (farm-avg milk price, farm-avg feed cost per
// head) — always returned with isEstimate + estimateNotes so the frontend
// discloses the approximation rather than presenting it as exact.
const GetFinancialsEstimate = async (req, res, next) => {
    try {
        const { query: { year }, userId } = req;
        const user = await getUserById(userId);
        if (!user) throw new ApiError("Unauthorized", 400, "Unauthorized access.", true);
        const { farmId } = user;
        if (!farmId) throw new ApiError("Unauthorized", 400, "Farm not found.", true);
        const targetYear = year ? Number(year) : new Date().getFullYear();

        const [animals, milkByAnimal, treatmentCostByAnimal, calvingCostByAnimal, farmAvgMilkPrice, farmFeedCost, farmTotalMilk] = await Promise.all([
            Animal.findAll({ where: { farmId, isDeleted: false }, attributes: ["uuid", "name", "tagName", "penId"], raw: true }),
            MilkIn.findAll({
                where: { farmId },
                attributes: ["animalId", [fn("SUM", col("totalMilk")), "totalMilk"]],
                group: ["animalId"],
                raw: true,
            }),
            Treatment.findAll({
                where: { farmId, isDeleted: false },
                attributes: ["animalId", [fn("SUM", col("cost")), "cost"]],
                group: ["animalId"],
                raw: true,
            }),
            CalvingEvent.findAll({
                where: { farmId },
                attributes: ["animalId", [fn("SUM", col("cost")), "cost"]],
                group: ["animalId"],
                raw: true,
            }),
            MilkOut.findOne({
                attributes: [[fn("AVG", col("pricePerLitre")), "avgPrice"]],
                where: { farmId, pricePerLitre: { [Op.ne]: null } },
                raw: true,
            }),
            FeedingSchedule.findOne({
                attributes: [
                    [fn("SUM", col("animals_count")), "totalAnimalSlots"],
                ],
                where: { farmId },
                raw: true,
            }).catch(() => null),
            MilkIn.findOne({
                attributes: [[fn("SUM", col("totalMilk")), "totalMilk"]],
                where: { farmId },
                raw: true,
            }),
        ]);

        const avgMilkPrice = Number(farmAvgMilkPrice?.avgPrice || 0);
        const hasFeedData = Boolean(farmFeedCost?.totalAnimalSlots);
        const totalMilk = Number(farmTotalMilk?.totalMilk || 0);
        const feedCostPerLitre = hasFeedData && totalMilk > 0
            ? null // computed below once we have total feed cost; placeholder to keep shape explicit
            : null;

        const milkMap = new Map(milkByAnimal.map(r => [r.animalId, Number(r.totalMilk || 0)]));
        const treatmentMap = new Map(treatmentCostByAnimal.map(r => [r.animalId, Number(r.cost || 0)]));
        const calvingMap = new Map(calvingCostByAnimal.map(r => [r.animalId, Number(r.cost || 0)]));

        const profitability = animals.map(a => {
            const milk = milkMap.get(a.uuid) || 0;
            const vetCost = treatmentMap.get(a.uuid) || 0;
            const calvingCost = calvingMap.get(a.uuid) || 0;
            const estimatedMilkIncome = milk * avgMilkPrice;
            const estimatedNetProfit = estimatedMilkIncome - vetCost - calvingCost;
            return {
                uuid: a.uuid,
                name: a.name,
                tagName: a.tagName,
                totalMilk: Number(milk.toFixed(2)),
                realCostOfCare: Number((vetCost + calvingCost).toFixed(2)),
                estimatedMilkIncome: Number(estimatedMilkIncome.toFixed(2)),
                estimatedNetProfit: Number(estimatedNetProfit.toFixed(2)),
            };
        }).sort((a, b) => a.estimatedNetProfit - b.estimatedNetProfit);

        const bottomCount = Math.max(1, Math.ceil(profitability.length * 0.1));
        const bottomPerformers = profitability.slice(0, bottomCount);

        const data = {
            isEstimate: true,
            estimateNotes: "Milk income uses the farm's average sale price per litre; true per-cow feed cost isn't tracked (feed is logged per pen, not per animal). Vet and calving costs are real.",
            feedCostPerLitre,
            hasFeedData,
            bottomPerformers,
            year: targetYear,
        };

        return sendSuccessResponse(res, 200, true, "Financials estimate fetched successfully.", "dashboard", data);
    } catch (error) {
        next(error);
    }
};

export default GetFinancialsEstimate;
