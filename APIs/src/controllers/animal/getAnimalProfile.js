import Sequelize, { Op } from "sequelize";
import sequelize from "../../config/db.js";
import Animal from "../../models/animal.js";
import Pen from "../../models/pen.js";
import LactationHistory from "../../models/animalLactationHistory.js";
import MilkIn from "../../models/milk.js";
import MilkOut from "../../models/milkOut.js";
import Treatment from "../../models/treatment.js";
import HealthStatusHistory from "../../models/healthStatusHistory.js";
import WeightHistory from "../../models/weightHistory.js";
import HeatEvents from "../../models/heatEvent.js";
import AiBreedingEvent from "../../models/aiBreeding.js";
import BullBreedingEvent from "../../models/bullBreeding.js";
import PregnancyEvent from "../../models/pregnancyEvent.js";
import CalvingEvent from "../../models/calvingEvent.js";
import AbortionEvent from "../../models/abortionEvent.js";
import DryOffEvent from "../../models/dryOffEvent.js";
import FeedingSchedule from "../../models/feedingSchedule.js";
import { getUserById } from "../../repo/user.js";
import { calvingInterval, daysOpen, servicesPerConception, lactationYieldStats } from "../../repo/reproductionMetrics.js";
import { ApiError } from "../../utils/ApiError.js";
import getDaysBetweenDates from "../../utils/getDaysBetweenDates.js";
import sendSuccessResponse from "../../utils/responses/sendSuccessResponse.js";
import isValidUUID from "../../utils/uuidValidator.js";

const { col, fn, literal } = Sequelize;

const GetAnimalProfile = async (req, res, next) => {
    try {
        const { params: { animalId }, userId } = req;
        const user = await getUserById(userId);
        if (!user) throw new ApiError("Unauthorized", 400, "Unauthorized access.", true);
        const { farmId } = user;
        if (!farmId) throw new ApiError("Unauthorized", 400, "Farm not found.", true);
        if (!isValidUUID(animalId)) throw new ApiError("Invalid Details", 400, "Please provide a valid animalId.", true);

        const animal = await Animal.findOne({
            where: { uuid: animalId, farmId, isDeleted: false },
            include: [{ model: Pen, as: "pen", attributes: ["uuid", "name"] }],
        });
        if (!animal) throw new ApiError("Not Found", 404, "Animal not found with the provided uuid.", true);
        const checkAnimal = animal.get({ plain: true });

        const [
            totalMilkRow,
            monthlyMilk,
            lactationTotals,
            lactationHistory,
            allMilkRows,
            recentTreatments,
            treatmentAggregate,
            healthStatusHistory,
            weightHistory,
            heatEvents,
            aiEvents,
            bullEvents,
            pregnancyEvents,
            calvingEvents,
            abortionEvents,
            dryOffEvents,
            offspring,
            farmAvgMilkPrice,
            penFeedCost,
        ] = await Promise.all([
            MilkIn.findOne({
                attributes: [[fn("SUM", col("totalMilk")), "totalMilk"]],
                where: { farmId, animalId },
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
                order: [["animal_curr_lactation", "ASC"]],
                raw: true,
            }),
            LactationHistory.findAll({ where: { animalId }, raw: true, order: [["lactation", "ASC"]] }),
            MilkIn.findAll({
                where: { animalId, farmId },
                attributes: ["date", "totalMilk", "animal_curr_lactation"],
                order: [["date", "ASC"]],
                raw: true,
            }),
            Treatment.findAll({
                where: { animalId, farmId, isDeleted: false },
                order: [["date", "DESC"], ["createdAt", "DESC"]],
                limit: 20,
                raw: true,
            }),
            Treatment.findAll({
                where: { animalId, farmId, isDeleted: false },
                attributes: [
                    "treatmentType",
                    [fn("COUNT", col("uuid")), "count"],
                    [fn("SUM", col("cost")), "totalCost"],
                    [fn("MAX", col("date")), "lastDate"],
                ],
                group: ["treatmentType"],
                raw: true,
            }),
            HealthStatusHistory.findAll({ where: { animalId }, order: [["date", "DESC"]], raw: true }),
            WeightHistory.findAll({ where: { animalId }, order: [["date", "ASC"]], raw: true }),
            HeatEvents.findAll({ where: { animalId, farmId }, order: [["date", "ASC"]], raw: true }),
            AiBreedingEvent.findAll({ where: { animalId, farmId }, order: [["date", "ASC"]], raw: true }),
            BullBreedingEvent.findAll({ where: { animalId, farmId }, order: [["date", "ASC"]], raw: true }),
            PregnancyEvent.findAll({ where: { animalId, farmId }, order: [["date", "ASC"]], raw: true }),
            CalvingEvent.findAll({ where: { animalId, farmId }, order: [["date", "ASC"]], raw: true }),
            AbortionEvent.findAll({ where: { animalId, farmId }, order: [["date", "ASC"]], raw: true }),
            DryOffEvent.findAll({ where: { animalId, farmId }, order: [["date", "ASC"]], raw: true }),
            Animal.findAll({
                where: { motherId: animalId, farmId },
                attributes: ["uuid", "name", "tagName", "calving_date", "healthStatus", "gender"],
                raw: true,
            }),
            MilkOut.findOne({
                attributes: [[fn("AVG", col("pricePerLitre")), "avgPrice"]],
                where: { farmId, pricePerLitre: { [Op.ne]: null } },
                raw: true,
            }),
            checkAnimal.penId
                ? FeedingSchedule.findOne({
                    attributes: [
                        [literal(`SUM(scheduled_quantity * "feedFormulation"."cost_per_kg") / NULLIF(SUM(animals_count), 0)`), "avgFeedCostPerAnimal"],
                    ],
                    where: { farmId, penId: checkAnimal.penId },
                    include: [{ association: "feedFormulation", attributes: [] }],
                    raw: true,
                }).catch(() => null)
                : null,
        ]);

        // Reproduction KPIs — computed from real dates, not stored fields.
        const positivePregnancyChecks = pregnancyEvents.filter(p => p.result === "positive");
        const breedingAttempts = [...aiEvents, ...bullEvents];
        const { avgDaysOpen, openCycles } = daysOpen(calvingEvents, positivePregnancyChecks);

        // Per-lactation yield stats (peak/days-to-peak/305-day), keyed by lactation number.
        const lactationYields = {};
        const lactationNumbers = [...new Set(allMilkRows.map(r => r.animal_curr_lactation))];
        lactationNumbers.forEach(lacNum => {
            const rowsForLactation = allMilkRows.filter(r => r.animal_curr_lactation === lacNum);
            const historyEntry = lactationHistory.find(h => h.lactation === lacNum);
            lactationYields[lacNum] = lactationYieldStats(rowsForLactation, historyEntry?.calving_date || null);
        });

        const formattedLactationHistory = lactationHistory.map(entry => ({
            lactation: entry.lactation,
            preCalvingDate: entry.pre_calving_date,
            calvingDate: entry.calving_date,
            daysInMilk: Math.floor((new Date(entry.calving_date) - new Date(entry.pre_calving_date)) / (1000 * 60 * 60 * 24)),
            totalMilk: Number(lactationTotals.find(l => l.animal_curr_lactation === entry.lactation)?.totalMilk || 0),
            ...lactationYields[entry.lactation],
        }));

        const DIM = checkAnimal.calving_date ? getDaysBetweenDates(checkAnimal.calving_date) : null;

        // Vet + calving cost is real; milk income and feed cost are estimates —
        // both explicitly flagged so the frontend never mixes real and estimated
        // numbers without disclosure.
        const vetCost = treatmentAggregate.reduce((s, t) => s + Number(t.totalCost || 0), 0);
        const calvingCost = calvingEvents.reduce((s, c) => s + Number(c.cost || 0), 0);
        const realCostOfCare = Number((vetCost + calvingCost).toFixed(2));
        const totalMilkProduced = Number(totalMilkRow?.totalMilk || 0);
        const avgMilkPrice = Number(farmAvgMilkPrice?.avgPrice || 0);
        const estimatedMilkIncome = Number((totalMilkProduced * avgMilkPrice).toFixed(2));
        const estimatedFeedCost = Number(penFeedCost?.avgFeedCostPerAnimal || 0) || null;
        const estimatedNetProfit = estimatedFeedCost !== null
            ? Number((estimatedMilkIncome - realCostOfCare - estimatedFeedCost).toFixed(2))
            : Number((estimatedMilkIncome - realCostOfCare).toFixed(2));

        const lastVaccination = treatmentAggregate.find(t => t.treatmentType === "vaccination");
        const lastDeworming = treatmentAggregate.find(t => t.treatmentType === "deworming");

        const finalResponse = {
            identity: {
                uuid: checkAnimal.uuid,
                name: checkAnimal.name,
                tagName: checkAnimal.tagName,
                electronicId: checkAnimal.electronicId,
                breedType: checkAnimal.breedType,
                animalType: checkAnimal.animalType,
                gender: checkAnimal.gender,
                birthdate: checkAnimal.birthdate,
                arrivalDate: checkAnimal.arrivalDate,
                purchasePrice: checkAnimal.price,
                pen: checkAnimal.pen || null,
                healthStatus: checkAnimal.healthStatus,
                animalCategory: checkAnimal.animalCategory,
                lactation: checkAnimal.lactation,
                ispregnant: checkAnimal.ispregnant,
                pregnancyStatus: checkAnimal.pregnancy_status,
                motherId: checkAnimal.motherId,
                fatherId: checkAnimal.fatherId,
            },
            status: {
                DIM,
                inseminatedDate: checkAnimal.inseminated_date,
                calvingDate: checkAnimal.calving_date,
                lastWeight: weightHistory.length ? weightHistory[weightHistory.length - 1] : null,
            },
            production: {
                totalMilk: totalMilkProduced,
                currentLactation: checkAnimal.lactation,
                DIM: DIM || 0,
                milkData: monthlyMilk,
                lactationData: lactationTotals,
                lactationHistory: formattedLactationHistory,
            },
            reproduction: {
                calvingIntervalDays: calvingInterval(calvingEvents),
                avgDaysOpen,
                openCycles,
                servicesPerConception: servicesPerConception(breedingAttempts, positivePregnancyChecks),
                heatEvents,
                aiEvents,
                bullEvents,
                pregnancyEvents,
                calvingEvents,
                abortionEvents,
                dryOffEvents,
            },
            health: {
                recentTreatments,
                treatmentTypeBreakdown: treatmentAggregate,
                healthStatusHistory,
                totalTreatments: treatmentAggregate.reduce((s, t) => s + Number(t.count || 0), 0),
                totalCost: Number(vetCost.toFixed(2)),
                daysSinceLastVaccination: lastVaccination ? getDaysBetweenDates(lastVaccination.lastDate) : null,
                daysSinceLastDeworming: lastDeworming ? getDaysBetweenDates(lastDeworming.lastDate) : null,
            },
            weight: {
                history: weightHistory,
            },
            financials: {
                isEstimate: true,
                estimateNotes: "Milk income uses the farm's average milk sale price (not a per-cow price, which isn't tracked). Feed cost is this cow's pen-average allocation, not an exact per-animal figure. Vet and calving costs are real.",
                realCostOfCare,
                vetCost: Number(vetCost.toFixed(2)),
                calvingCost: Number(calvingCost.toFixed(2)),
                estimatedMilkIncome,
                estimatedFeedCost,
                estimatedNetProfit,
            },
            offspring,
        };

        return sendSuccessResponse(res, 200, true, "Animal profile fetched successfully.", "animal-profile", finalResponse);
    } catch (error) {
        next(error);
    }
};

export default GetAnimalProfile;
