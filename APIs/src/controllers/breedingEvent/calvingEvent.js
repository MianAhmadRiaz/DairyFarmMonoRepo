import { Op } from "sequelize";
import sequelize from "../../config/db.js";
import { AnimalEvents, EventTypes, LactationStatuses, PregnancyStatuses } from "../../constants/index.js";
import logger from "../../logger/index.js";
import Animal from "../../models/animal.js";
import CalvingEvent from "../../models/calvingEvent.js";
import CalvingOffSprints from "../../models/calvingOffSprings.js";
import LactationStatus from "../../models/lactationStatus.js";
import Pen from "../../models/pen.js";
import PenHistory from "../../models/penHistory.js";
import PregnancyStatus from "../../models/pregnancyStatus.js";
import Tag from "../../models/tag.js";
import { getUserById } from "../../repo/user.js";
import { ApiError } from "../../utils/ApiError.js";
import sendSuccessResponse from "../../utils/responses/sendSuccessResponse.js";
import isValidUUID from "../../utils/uuidValidator.js";
import Event from "../eventEmiiter/events.js";
import FarmConfiguration from "../../models/farmConfiguration.js";

const CalvingEvents = async (req, res, next) => {
    const transaction = await sequelize.transaction();
    try {
        const { body: { animalId, date, time, comments, penId, cost, calving_ease, lactation, problems, childs }, userId } = req;
        const user = await getUserById(userId);
        if (!user) throw new ApiError("Unauthorized", 400, "Unauthorized access.", true);
        const { farmId } = user;
        if (!farmId) throw new ApiError("Unauthorized", 400, "Farm not found.", true);
        const animal = await Animal.findOne({ where: { uuid: animalId, farmId, isDeleted: false }, raw: true });
        if (!animal) throw new ApiError("Invalid Details", 400, "Animal with the provided animalId does not exist.", true);

        const eventPayload = { comments, farmId, date, animalId, penId, cost, time, calving_ease, lactation, problems };
        // Calving brings the dam back into milk: fresh/lactating, no longer pregnant.
        const animalUpdateQuery = {
            last_event: AnimalEvents.CALVING,
            calving_date: date,
            pregnancy_status: PregnancyStatuses.OPEN,
            ispregnant: false,
            animalCategory: "milk",
            healthStatus: "milking",
            lactation: Number(animal.lactation + 1),
        }
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
        const event = await CalvingEvent.create(eventPayload, { raw: true, transaction });
        const [pregStatus, created] = await PregnancyStatus.findOrCreate({
            where: { animalId },
            defaults: { status: PregnancyStatuses.OPEN, animalId },
            raw: true,
            transaction
        });
        if (created) animalUpdateQuery.pregnancyStatusId = pregStatus.uuid;
        else {
            await PregnancyStatus.update({ status: PregnancyStatuses.OPEN }, { where: { animalId }, transaction });
        }
        const [lacStatus, lacCreated] = await LactationStatus.findOrCreate({
            where: { animalId },
            defaults: { status: LactationStatuses.MILKING, animalId },
            raw: true,
            transaction,
        });
        if (lacCreated) animalUpdateQuery.lactationStatusId = lacStatus.uuid;
        else {
            await LactationStatus.update({ status: LactationStatuses.MILKING }, { where: { animalId }, transaction });
        }
        const childsAnimalData = [];
        const calvingOffSprintsData = [];
        const tagToUpdate = [];

        await Promise.all((childs || []).map(async (child) => {
            const { penId, tagId, isAlive, weight, reason_if_dead, temp_id, gender, breedType, fatherId } = child;
            const eventPayload = { calvingId: event.uuid, isAlive, weight, reason_if_dead, temp_id, gender, breedType };
            if (isValidUUID(penId)) {
                const pen = await Pen.findOne({ where: { uuid: penId, farmId }, raw: true });
                if (!pen) throw new ApiError("Invalid Details", 400, "penId does not exist. Please provide a valid penId for child.", true);
                eventPayload.penId = penId;
            }
            if (isValidUUID(tagId)) {
                const tag = await Tag.findOne({ where: { uuid: tagId, farmId }, raw: true });
                if (!tag) throw new ApiError("Invalid Details", 400, "tagId does not exist. Please provide a valid tagId for child.", true);
                const checkAnimalWIthTagId = await Animal.findOne({ where: { tagId, isDeleted: false }, raw: true });
                if (checkAnimalWIthTagId) throw new ApiError("Invalid Details", 400, "Animal with provided TagId already exist.", true);
                eventPayload.tagId = tagId;
                tagToUpdate.push(tagId);
            }
            calvingOffSprintsData.push(eventPayload)

            if (!isAlive) return; // Skip if the child is not alive
            const isFemale = gender?.toLowerCase() === "female";
            const data = {
                weight, temp_id, breedType,
                gender: gender?.toLowerCase(),
                birthdate: date, fatherId, farmId,
                animalCategory: isFemale ? "heifers" : "calves", weightDate: date,
                is_calve: true, motherId: animalId, createdBy: userId, updatedBy: userId,
                pedigreeInfo: { damTagId: animal.tagName },
            };
            if (tagId) data.tagId = tagId;
            if (penId) data.penId = penId;
            childsAnimalData.push(data);
        }));

        // Bulk insert event
        if (calvingOffSprintsData.length > 0) {
            await CalvingOffSprints.bulkCreate(calvingOffSprintsData, { transaction });
        }
        // Bulk insert only if there are live animals
        if (childsAnimalData.length > 0) {
            const config = await FarmConfiguration.findOne({ where: { farmId }, raw: true, transaction });
            if (config && Number(config.current_animals) + childsAnimalData.length > Number(config.allowed_animals)) {
                throw new ApiError("Invalid Details", 400, `Registering ${childsAnimalData.length} calves exceeds the allowed ${config.allowed_animals} animals limit.`, true);
            }
            await Animal.bulkCreate(childsAnimalData, { transaction });
            const countToUpdate = childsAnimalData.length;
            await FarmConfiguration.increment({ current_animals: countToUpdate, calves_count: countToUpdate }, { where: { farmId }, transaction });
        }
        // Bulk insert only if there are live animals
        if (tagToUpdate.length > 0) {
            await Tag.update({ is_used: true }, { where: { uuid: { [Op.in]: tagToUpdate } }, transaction });
        }
        await Animal.update(animalUpdateQuery, { where: { uuid: animalId, farmId }, transaction });
        await transaction.commit();
        const data = { lactation: Number(animal.lactation || 1), pre_calving_date: animal.calving_date || new Date(), calving_date: date, animalId };
        Event.emit(EventTypes.AddLactationHistory, data);
        return sendSuccessResponse(res, 200, true, "Calving event register successfully.", "breeding-event", event);
    } catch (error) {
        logger.error(`Error in Calving: ${error.message}`);
        await transaction.rollback();
        next(error);
    }
};
export default CalvingEvents;
