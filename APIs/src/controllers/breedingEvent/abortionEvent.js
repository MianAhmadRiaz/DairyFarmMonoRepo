import sequelize from "../../config/db.js";
import { AnimalEvents, PregnancyStatuses } from "../../constants/index.js";
import AbortionEvent from "../../models/abortionEvent.js";
import Animal from "../../models/animal.js";
import Pen from "../../models/pen.js";
import PenHistory from "../../models/penHistory.js";
import PregnancyStatus from "../../models/pregnancyStatus.js";
import { getUserById } from "../../repo/user.js";
import { ApiError } from "../../utils/ApiError.js";
import sendSuccessResponse from "../../utils/responses/sendSuccessResponse.js";

const AbortionsEvent = async (req, res, next) => {
    let transaction;
    try {
        const { body: { animalId, date, comments, penId, cost, milkable }, userId } = req;
        const user = await getUserById(userId);
        if (!user) throw new ApiError("Unauthorized", 400, "Unauthorized access.", true);
        const { farmId } = user;
        if (!farmId) throw new ApiError("Unauthorized", 400, "Farm not found.", true);
        const animal = await Animal.findOne({ where: { uuid: animalId, farmId, isDeleted: false }, raw: true });
        if (!animal) throw new ApiError("Invalid Details", 400, "Animal with the provided animalId does not exist.", true);

        const eventPayload = {
            comments,
            date,
            farmId,
            animalId,
            penId,
            cost,
            milkable,
        };
        const animalUpdateQuery = {
            last_event: AnimalEvents.ABORTION,
            pregnancy_status: PregnancyStatuses.OPEN,
            ispregnant: false,
        }
        transaction = await sequelize.transaction();
        if (penId) {
            if (penId === animal.penId) throw new ApiError("Invalid Details", 400, "Animal already in same provided pen.", true);
            const pen = await Pen.findOne({ where: { uuid: penId, farmId }, raw: true });
            if (!pen) throw new ApiError("Invalid Details", 400, "penId does not exist. Please provide a valid penId.", true);
            const tagHistory = {
                createdBy: userId,
                oldPenId: animal.penId,
                newPenId: penId,
                animalId,
                date,
            };
            await PenHistory.create(tagHistory, { transaction });
            animalUpdateQuery.penId = penId;
        }
        const event = await AbortionEvent.create(eventPayload, { transaction });
        const [pregStatus, created] = await PregnancyStatus.findOrCreate({
            where: { animalId },
            defaults: { status: PregnancyStatuses.OPEN, animalId },
            raw: true,
            transaction,
        });
        if (created) animalUpdateQuery.pregnancyStatusId = pregStatus.uuid;
        else {
            await PregnancyStatus.update({ status: PregnancyStatuses.OPEN }, { where: { animalId }, transaction });
        }
        await Animal.update(animalUpdateQuery, { where: { uuid: animalId, farmId }, transaction });
        await transaction.commit();
        return sendSuccessResponse(res, 200, true, "Abortion event register successfully.", "breeding-event", event);
    } catch (error) {
        if (transaction) await transaction.rollback();
        next(error);
    }
};
export default AbortionsEvent;
