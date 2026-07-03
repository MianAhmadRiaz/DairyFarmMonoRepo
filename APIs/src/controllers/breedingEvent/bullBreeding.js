import sequelize from "../../config/db.js";
import { AnimalEvents, PregnancyStatuses } from "../../constants/index.js";
import BullBreeding from "../../models/bullBreeding.js";
import Animal from "../../models/animal.js";
import PregnancyStatus from "../../models/pregnancyStatus.js";
import { getUserById } from "../../repo/user.js";
import { ApiError } from "../../utils/ApiError.js";
import { assertBreedingEligible } from "../../utils/herd/animalHelpers.js";
import sendSuccessResponse from "../../utils/responses/sendSuccessResponse.js";
import Bull from "../../models/bull.js";

const BullBreedingEvent = async (req, res, next) => {
    let transaction;
    try {
        const { body: { comments, double_dose, date, animalId, bullId }, userId } = req;
        const user = await getUserById(userId);
        if (!user) throw new ApiError("Unauthorized", 400, "Unauthorized access.", true);
        const { farmId } = user;
        if (!farmId) throw new ApiError("Unauthorized", 400, "Farm not found.", true);
        const animal = await Animal.findOne({ where: { uuid: animalId, farmId, isDeleted: false }, raw: true });
        if (!animal) throw new ApiError("Invalid Details", 400, "Animal with the provided animalId does not exist.", true);
        assertBreedingEligible(animal, ApiError);
        const bull = await Bull.findOne({ where: { uuid: bullId, farmId }, raw: true });
        if (!bull) throw new ApiError("Invalid Details", 400, "Bull with the provided bullId does not exist.", true);
        const eventPayload = {
            comments,
            farmId,
            double_dose,
            date,
            animalId,
            bullId,
        };
        transaction = await sequelize.transaction();
        const event = await BullBreeding.create(eventPayload, { transaction });
        const [pregStatus, created] = await PregnancyStatus.findOrCreate({
            where: { animalId },
            defaults: { status: PregnancyStatuses.INSAMINATED, animalId },
            raw: true,
            transaction,
        });
        const animalUpdateQuery = {
            inseminated_date: date,
            pregnancy_status: PregnancyStatuses.INSAMINATED,
            last_event: AnimalEvents.BULL_BREEDING,
        }
        if (created) animalUpdateQuery.pregnancyStatusId = pregStatus.uuid;
        else {
            await PregnancyStatus.update({ status: PregnancyStatuses.INSAMINATED }, { where: { animalId }, transaction });
        }
        await Animal.update(animalUpdateQuery, { where: { uuid: animalId, farmId }, transaction });
        await transaction.commit();
        return sendSuccessResponse(res, 200, true, "Bull Breeding event register successfully.", "breeding-event", event);
    } catch (error) {
        if (transaction) await transaction.rollback();
        next(error);
    }
};
export default BullBreedingEvent;
