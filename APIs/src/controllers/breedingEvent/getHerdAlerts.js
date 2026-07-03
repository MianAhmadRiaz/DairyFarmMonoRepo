import { Op } from "sequelize";
import Animal from "../../models/animal.js";
import HeatEvents from "../../models/heatEvent.js";
import Treatment from "../../models/treatment.js";
import { PregnancyStatuses } from "../../constants/index.js";
import { getUserById } from "../../repo/user.js";
import { ApiError } from "../../utils/ApiError.js";
import sendSuccessResponse from "../../utils/responses/sendSuccessResponse.js";

// Reproduction-cycle constants (days)
const GESTATION_DAYS = 283;
const PREG_CHECK_AFTER_DAYS = 30;
const DRY_OFF_BEFORE_CALVING_DAYS = 60;
const CALVING_ALERT_WINDOW_DAYS = 14;
const HEAT_CYCLE_MIN = 18;
const HEAT_CYCLE_MAX = 24;

const daysAgo = (days) => {
    const d = new Date();
    d.setDate(d.getDate() - days);
    return d;
};

const addDaysTo = (date, days) => {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
};

const animalSummary = (a) => ({
    uuid: a.uuid,
    tagName: a.tagName,
    name: a.name,
    animalCategory: a.animalCategory,
    inseminated_date: a.inseminated_date,
});

// GET /breeding-events/alerts — everything the farm needs to act on today:
// pregnancy checks due, dry-offs due, calvings expected, heats to watch,
// and animals under active milk withdrawal.
const GetHerdAlerts = async (req, res, next) => {
    try {
        const { userId } = req;
        const user = await getUserById(userId);
        if (!user) throw new ApiError("Unauthorized", 400, "Unauthorized access.", true);
        const { farmId } = user;
        if (!farmId) throw new ApiError("Unauthorized", 400, "Farm not found.", true);

        const baseWhere = { farmId, isDeleted: false, gender: "female" };
        const today = new Date();
        const todayStr = today.toISOString().split("T")[0];

        // 1. Pregnancy check due: inseminated ≥ 30 days ago, still no positive result.
        const pregCheckDue = await Animal.findAll({
            where: {
                ...baseWhere,
                pregnancy_status: PregnancyStatuses.INSAMINATED,
                inseminated_date: { [Op.lte]: daysAgo(PREG_CHECK_AFTER_DAYS) },
            },
            raw: true,
        });

        // 2 & 3. Pregnant animals: due to dry off (within 60d of expected calving)
        // and expected to calve within the alert window.
        const pregnantAnimals = await Animal.findAll({
            where: {
                ...baseWhere,
                ispregnant: true,
                inseminated_date: { [Op.ne]: null },
            },
            raw: true,
        });
        const dryOffDue = [];
        const calvingExpected = [];
        pregnantAnimals.forEach((a) => {
            const expectedCalving = addDaysTo(a.inseminated_date, GESTATION_DAYS);
            const dryOffDate = addDaysTo(expectedCalving, -DRY_OFF_BEFORE_CALVING_DAYS);
            const summary = { ...animalSummary(a), expectedCalvingDate: expectedCalving.toISOString().split("T")[0], dryOffDueDate: dryOffDate.toISOString().split("T")[0] };
            if (a.animalCategory !== "dry" && dryOffDate <= today) dryOffDue.push(summary);
            if (expectedCalving <= addDaysTo(today, CALVING_ALERT_WINDOW_DAYS)) calvingExpected.push(summary);
        });

        // 4. Heat watch: open/inseminated animals whose last heat or insemination
        // was 18–24 days ago — the expected return-to-heat window.
        const windowStart = daysAgo(HEAT_CYCLE_MAX);
        const windowEnd = daysAgo(HEAT_CYCLE_MIN);
        const inseminatedInWindow = await Animal.findAll({
            where: {
                ...baseWhere,
                pregnancy_status: PregnancyStatuses.INSAMINATED,
                inseminated_date: { [Op.between]: [windowStart, windowEnd] },
            },
            raw: true,
        });
        const recentHeats = await HeatEvents.findAll({
            where: { farmId, date: { [Op.between]: [windowStart, windowEnd] } },
            attributes: ["animalId", "date"],
            raw: true,
        });
        const openHeatAnimals = recentHeats.length
            ? await Animal.findAll({
                where: {
                    ...baseWhere,
                    pregnancy_status: PregnancyStatuses.OPEN,
                    uuid: { [Op.in]: [...new Set(recentHeats.map((h) => h.animalId))] },
                },
                raw: true,
            })
            : [];
        const heatWatch = [
            ...inseminatedInWindow.map((a) => ({ ...animalSummary(a), reason: "inseminated 18-24 days ago — watch for return to heat" })),
            ...openHeatAnimals.map((a) => ({ ...animalSummary(a), reason: "last heat 18-24 days ago — next heat expected" })),
        ];

        // 5. Active milk withdrawals (treated animals whose milk must not be sold).
        const activeWithdrawals = await Treatment.findAll({
            where: {
                farmId,
                isDeleted: false,
                milkWithdrawalUntil: { [Op.gte]: todayStr },
            },
            include: [{ model: Animal, as: "animal", attributes: ["uuid", "tagName", "name"] }],
        });

        const alerts = {
            pregnancyCheckDue: pregCheckDue.map(animalSummary),
            dryOffDue,
            calvingExpected,
            heatWatch,
            activeMilkWithdrawals: activeWithdrawals,
            counts: {
                pregnancyCheckDue: pregCheckDue.length,
                dryOffDue: dryOffDue.length,
                calvingExpected: calvingExpected.length,
                heatWatch: heatWatch.length,
                activeMilkWithdrawals: activeWithdrawals.length,
            },
        };
        return sendSuccessResponse(res, 200, true, "herd alerts fetched successfully.", "alerts", alerts);
    } catch (error) {
        next(error);
    }
};
export default GetHerdAlerts;
