import Animal from "../../models/animal.js";
import HeatEvents from "../../models/heatEvent.js";
import AiBreedingEvent from "../../models/aiBreeding.js";
import BullBreedingEvent from "../../models/bullBreeding.js";
import PregnancyEvent from "../../models/pregnancyEvent.js";
import CalvingEvent from "../../models/calvingEvent.js";
import { getUserById } from "../../repo/user.js";
import { calvingInterval, daysOpen, servicesPerConception } from "../../repo/reproductionMetrics.js";
import { ApiError } from "../../utils/ApiError.js";
import sendSuccessResponse from "../../utils/responses/sendSuccessResponse.js";

// Herd-wide reproduction KPIs: averages the same per-animal calculations used
// by the cow-profile endpoint (src/repo/reproductionMetrics.js) across every
// female animal that has breeding history, plus the funnel counts.
const GetReproductionSummary = async (req, res, next) => {
    try {
        const { userId } = req;
        const user = await getUserById(userId);
        if (!user) throw new ApiError("Unauthorized", 400, "Unauthorized access.", true);
        const { farmId } = user;
        if (!farmId) throw new ApiError("Unauthorized", 400, "Farm not found.", true);

        const [animals, heatEvents, aiEvents, bullEvents, pregnancyEvents, calvingEvents] = await Promise.all([
            Animal.findAll({ where: { farmId, isDeleted: false, gender: "female" }, attributes: ["uuid", "ispregnant"], raw: true }),
            HeatEvents.findAll({ where: { farmId }, attributes: ["animalId", "date"], raw: true }),
            AiBreedingEvent.findAll({ where: { farmId }, attributes: ["animalId", "date"], raw: true }),
            BullBreedingEvent.findAll({ where: { farmId }, attributes: ["animalId", "date"], raw: true }),
            PregnancyEvent.findAll({ where: { farmId }, attributes: ["animalId", "date", "result"], raw: true }),
            CalvingEvent.findAll({ where: { farmId }, attributes: ["animalId", "date"], raw: true }),
        ]);

        const byAnimal = (rows) => rows.reduce((map, r) => {
            (map[r.animalId] ||= []).push(r);
            return map;
        }, {});
        const calvingsByAnimal = byAnimal(calvingEvents);
        const pregnanciesByAnimal = byAnimal(pregnancyEvents);
        const aiByAnimal = byAnimal(aiEvents);
        const bullByAnimal = byAnimal(bullEvents);

        const intervals = [];
        const opens = [];
        const services = [];
        animals.forEach(a => {
            const calvings = calvingsByAnimal[a.uuid] || [];
            const positives = (pregnanciesByAnimal[a.uuid] || []).filter(p => p.result === "positive");
            const attempts = [...(aiByAnimal[a.uuid] || []), ...(bullByAnimal[a.uuid] || [])];

            const interval = calvingInterval(calvings);
            if (interval !== null) intervals.push(interval);

            const { avgDaysOpen } = daysOpen(calvings, positives);
            if (avgDaysOpen !== null) opens.push(avgDaysOpen);

            const spc = servicesPerConception(attempts, positives);
            if (spc !== null) services.push(spc);
        });

        const avg = (arr) => (arr.length ? Number((arr.reduce((s, v) => s + v, 0) / arr.length).toFixed(1)) : null);

        const pregnantCount = animals.filter(a => a.ispregnant).length;
        const pregnancyRate = animals.length ? Number(((pregnantCount / animals.length) * 100).toFixed(1)) : 0;

        const data = {
            avgCalvingIntervalDays: avg(intervals),
            avgDaysOpen: avg(opens),
            avgServicesPerConception: avg(services),
            pregnancyRate,
            funnel: {
                heatEvents: heatEvents.length,
                aiEvents: aiEvents.length,
                bullEvents: bullEvents.length,
                pregnancyConfirmed: pregnancyEvents.filter(p => p.result === "positive").length,
                calvings: calvingEvents.length,
            },
        };

        return sendSuccessResponse(res, 200, true, "Reproduction summary fetched successfully.", "breeding-event", data);
    } catch (error) {
        next(error);
    }
};

export default GetReproductionSummary;
