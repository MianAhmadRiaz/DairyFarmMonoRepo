import sequelize from "../../config/db.js";
import { AnimalEvents, LactationStatuses } from "../../constants/index.js";
import Animal from "../../models/animal.js";
import DryOffEvent from "../../models/dryOffEvent.js";
import LactationStatus from "../../models/lactationStatus.js";
import Pen from "../../models/pen.js";
import PenHistory from "../../models/penHistory.js";
import { getUserById } from "../../repo/user.js";
import { ApiError } from "../../utils/ApiError.js";
import sendSuccessResponse from "../../utils/responses/sendSuccessResponse.js";

const DryoffEvents = async (req, res, next) => {
    let transaction;
    try {
        const { body: { animalId, date, reason, penId, category }, userId } = req;
        const user = await getUserById(userId);
        if (!user) throw new ApiError("Unauthorized", 400, "Unauthorized access.", true);
        const { farmId } = user;
        if (!farmId) throw new ApiError("Unauthorized", 400, "Farm not found.", true);
        const animal = await Animal.findOne({ where: { uuid: animalId, farmId, isDeleted: false }, raw: true });
        if (!animal) throw new ApiError("Invalid Details", 400, "Animal with the provided animalId does not exist.", true);
        if (animal.animalCategory === "dry") throw new ApiError("Invalid Details", 400, "Animal is already dry.", true);

        const eventPayload = { animalId, date, reason, penId, category, farmId };
        const animalUpdateQuery = {
            last_event: AnimalEvents.DRY_OFF,
            animalCategory: "dry",
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
        const event = await DryOffEvent.create(eventPayload, { transaction });
        const [lacStatus, created] = await LactationStatus.findOrCreate({
            where: { animalId },
            defaults: { status: LactationStatuses.DRY, animalId },
            raw: true,
            transaction,
        });
        if (created) animalUpdateQuery.lactationStatusId = lacStatus.uuid;
        else {
            await LactationStatus.update({ status: LactationStatuses.DRY }, { where: { animalId }, transaction });
        }
        await Animal.update(animalUpdateQuery, { where: { uuid: animalId, farmId }, transaction });
        await transaction.commit();
        return sendSuccessResponse(res, 200, true, "Dry Off event register successfully.", "breeding-event", event);
    } catch (error) {
        if (transaction) await transaction.rollback();
        next(error);
    }
};
export default DryoffEvents;
