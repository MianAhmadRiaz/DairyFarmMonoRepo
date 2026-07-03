import sequelize from "../../config/db.js";
import { AnimalEvents, PregnancyStatuses } from "../../constants/index.js";
import Animal from "../../models/animal.js";
import PregnancyEvent from "../../models/pregnancyEvent.js";
import PregnancyStatus from "../../models/pregnancyStatus.js";
import { getUserById } from "../../repo/user.js";
import { ApiError } from "../../utils/ApiError.js";
import sendSuccessResponse from "../../utils/responses/sendSuccessResponse.js";

const PregnancyTestEvent = async (req, res, next) => {
    let transaction;
    try {
        const { body: { tech, technique, cost, recheck, date, breed_date, prev_test_date, exp_dryoff_date, exp_calving_date, breed_with, result, pg_days, animalId }, userId } = req;
        const user = await getUserById(userId);
        if (!user) throw new ApiError("Unauthorized", 400, "Unauthorized access.", true);
        const { farmId } = user;
        if (!farmId) throw new ApiError("Unauthorized", 400, "Farm not found.", true);
        const animal = await Animal.findOne({ where: { uuid: animalId, farmId, isDeleted: false }, raw: true });
        if (!animal) throw new ApiError("Invalid Details", 400, "Animal with the provided animalId does not exist.", true);
        if (animal.gender !== "female") throw new ApiError("Invalid Details", 400, "Pregnancy tests can only be recorded for female animals.", true);

        const isPositive = result?.toLowerCase() === "positive";
        const eventPayload = {
            tech: tech?.toLowerCase(),
            technique, cost, recheck, farmId, date, breed_date, prev_test_date, exp_dryoff_date, exp_calving_date, breed_with, result: result?.toLowerCase(), pg_days, animalId
        };
        transaction = await sequelize.transaction();
        const event = await PregnancyEvent.create(eventPayload, { transaction });
        const status = isPositive ? PregnancyStatuses.PREGNANT : PregnancyStatuses.OPEN;
        const [pregStatus, created] = await PregnancyStatus.findOrCreate({
            where: { animalId },
            defaults: { status, animalId },
            raw: true,
            transaction,
        });
        const animalUpdateQuery = {
            last_event: AnimalEvents.PREGNANCY_CHECK,
            pregnancy_status: status,
            ispregnant: isPositive,
        }
        if (created) animalUpdateQuery.pregnancyStatusId = pregStatus.uuid
        else {
            await PregnancyStatus.update({ status }, { where: { animalId }, transaction });
        }
        await Animal.update(animalUpdateQuery, { where: { uuid: animalId, farmId }, transaction });
        await transaction.commit();
        return sendSuccessResponse(res, 200, true, "Pregnancy test event register successfully.", "breeding-event", event);
    } catch (error) {
        if (transaction) await transaction.rollback();
        next(error);
    }
};
export default PregnancyTestEvent;
