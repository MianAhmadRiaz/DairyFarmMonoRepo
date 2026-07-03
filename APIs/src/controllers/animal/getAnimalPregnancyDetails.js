import { AnimalEvents } from "../../constants/index.js";
import AiBreedingEvent from "../../models/aiBreeding.js";
import Animal from "../../models/animal.js";
import BullBreedingEvent from "../../models/bullBreeding.js";
import { getUserById } from "../../repo/user.js";
import { ApiError } from "../../utils/ApiError.js";
import sendSuccessResponse from "../../utils/responses/sendSuccessResponse.js";
import isValidUUID from "../../utils/uuidValidator.js";

const GetAnimalPregnancyDetails = async (req, res, next) => {
    try {
        const { query: { animalId }, userId } = req;
        const user = await getUserById(userId);
        if (!user) throw new ApiError("Unauthorized", 400, "Unauthorized access.", true);
        const { farmId } = user;
        if (!farmId) throw new ApiError("Unauthorized", 400, "Farm not found.", true);
        if (!isValidUUID(animalId)) throw new ApiError("Invalid Details", 400, "Please provide animalId.", true);
        const checkAnimal = await Animal.findOne({ where: { uuid: animalId, isDeleted: false }, raw: true });
        if (!checkAnimal) throw new ApiError("Invalid Details", 400, "Animal not found with provided animalId.", true);
        const { last_event } = checkAnimal;
        let eventData;
        if (last_event === AnimalEvents.AI_BREEDING) {
            eventData = await AiBreedingEvent.findOne({ where: { animalId }, order: [["date", "DESC"]], raw: true });
        } else if (last_event === AnimalEvents.BULL_BREEDING) {
            eventData = await BullBreedingEvent.findOne({ where: { animalId }, order: [["date", "DESC"]], raw: true });
        }
        let data = {
            breedDate: null,
            breedWith: null,
            pre_p_test_date: null,
            pg_days: null,
            exp_dry_off_date: null,
            exp_calving_date: null,
        };

        if (eventData?.date) {
            const breedDate = new Date(eventData.date);
            const today = new Date();

            // Calculate pregnancy days
            const pg_days = Math.floor((today - breedDate) / (1000 * 60 * 60 * 24));

            // Expected calving date = breedDate + 283 days
            const expCalvingDate = new Date(breedDate);
            expCalvingDate.setDate(expCalvingDate.getDate() + 283);

            // Expected dry-off date = expCalvingDate - 50 days
            const expDryOffDate = new Date(expCalvingDate);
            expDryOffDate.setDate(expDryOffDate.getDate() - 50);

            // Optional: pre_p_test_date (30 days after breeding)
            const prePregTestDate = new Date(breedDate);
            prePregTestDate.setDate(prePregTestDate.getDate() + 30);

            data = {
                breedDate,
                breedWith: eventData.semen || "bull breeding",
                pre_p_test_date: prePregTestDate,
                pg_days,
                exp_dry_off_date: expDryOffDate,
                exp_calving_date: expCalvingDate,
            };
        }

        return sendSuccessResponse(res, 200, true, "Animal pregnancy details fetched successfully.", "animal", { data });
    } catch (error) {
        next(error);
    }
    return GetAnimalPregnancyDetails;
};
export default GetAnimalPregnancyDetails;
