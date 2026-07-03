import { EventTypes } from "../../constants/index.js";
import sequelize from "../../config/db.js";
import Animal from "../../models/animal.js";
import Bull from "../../models/bull.js";
import FarmConfiguration from "../../models/farmConfiguration.js";
import Tag from "../../models/tag.js";
import { getUserById } from "../../repo/user.js";
import { ApiError } from "../../utils/ApiError.js";
import { resolveCategoryCounterField, stripProtectedAnimalFields } from "../../utils/herd/animalHelpers.js";
import sendSuccessResponse from "../../utils/responses/sendSuccessResponse.js";
import Event from "../eventEmiiter/events.js";

const AddAnimal = async (req, res, next) => {
    let transaction;
    try {
        const { body: { tagId, gender, motherId, fatherId }, userId } = req;
        const { body } = req;
        const user = await getUserById(userId);
        if (!user) throw new ApiError("Unauthorized", 400, "Unauthorized access.", true);
        const { farmId } = user;
        if (!farmId) throw new ApiError("Unauthorized", 400, "Farm not found.", true);
        const config = await FarmConfiguration.findOne({ where: { farmId }, raw: true });
        if (!config) throw new ApiError("Unauthorized", 400, "Farm configuration not found.", true);
        const { allowed_animals, current_animals } = config;
        if (current_animals >= allowed_animals) throw new ApiError("Unauthorized", 400, `You have reach the maximum allowed ${allowed_animals} animals limit.`, true);
        const checkTagId = await Tag.findOne({ where: { uuid: tagId, farmId }, raw: true });
        if (!checkTagId) throw new ApiError("Invalid Details", 400, "Tag does not exist with provided TagId. Please provide a valid tagId", true);
        const checkAnimalWIthTagId = await Animal.findOne({ where: { tagId, isDeleted: false }, raw: true });
        if (checkAnimalWIthTagId) throw new ApiError("Invalid Details", 400, "Animal with provided TagId already exist.", true);

        // Pedigree: resolve dam/sire display info so the profile pedigree panel has data.
        const pedigreeInfo = {};
        if (motherId) {
            const mother = await Animal.findOne({ where: { uuid: motherId, farmId, isDeleted: false }, raw: true });
            if (!mother) throw new ApiError("Invalid Details", 400, "Mother (dam) with the provided motherId does not exist on this farm.", true);
            pedigreeInfo.damTagId = mother.tagName;
        }
        if (fatherId) {
            const father = await Bull.findOne({ where: { uuid: fatherId, farmId }, raw: true });
            if (!father) throw new ApiError("Invalid Details", 400, "Bull (sire) with the provided fatherId does not exist on this farm.", true);
            pedigreeInfo.sireTagId = father.name;
        }

        const newAnimal = {
            ...stripProtectedAnimalFields(body),
            farmId,
            gender: gender.toLowerCase(),
            createdBy: userId,
            updatedBy: userId,
            tagName: checkTagId.name,
        };
        if (Object.keys(pedigreeInfo).length > 0) newAnimal.pedigreeInfo = pedigreeInfo;

        transaction = await sequelize.transaction();
        const animal = await Animal.create(newAnimal, { transaction });
        await Tag.update({ is_used: true }, { where: { uuid: tagId, farmId }, transaction });
        const fieldToUpdate = resolveCategoryCounterField(animal);
        await FarmConfiguration.increment({ current_animals: 1, [fieldToUpdate]: 1 }, { where: { farmId }, transaction });
        await transaction.commit();

        const eventPayload = {
            farmId,
            message: `${user.email} has added a new animal to the farm.`
        }
        Event.emit(EventTypes.Logs, eventPayload);
        return sendSuccessResponse(res, 200, true, "animal add successfully.", "animal", animal);
    } catch (error) {
        if (transaction) await transaction.rollback();
        next(error);
    }
};
export default AddAnimal;
