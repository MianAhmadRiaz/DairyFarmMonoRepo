import { EventTypes } from "../../constants/index.js";
import sequelize from "../../config/db.js";
import Animal from "../../models/animal.js";
import FarmConfiguration from "../../models/farmConfiguration.js";
import Tag from "../../models/tag.js";
import { getUserById } from "../../repo/user.js";
import { ApiError } from "../../utils/ApiError.js";
import { resolveCategoryCounterField } from "../../utils/herd/animalHelpers.js";
import sendSuccessResponse from "../../utils/responses/sendSuccessResponse.js";
import isValidUUID from "../../utils/uuidValidator.js";
import Event from "../eventEmiiter/events.js";

const DeleteAnimal = async (req, res, next) => {
    let transaction;
    try {
        const { query: { uuid }, userId } = req;
        const user = await getUserById(userId);
        if (!user) throw new ApiError("Unauthorized", 400, "Unauthorized access.", true);
        const { farmId } = user;
        if (!farmId) throw new ApiError("Unauthorized", 400, "Farm not found.", true);
        if (!isValidUUID(uuid)) throw new ApiError("Invalid Details", 400, "Please provide uuid.", true);
        const checkAnimal = await Animal.findOne({ where: { uuid, farmId, isDeleted: false }, raw: true });
        if (!checkAnimal) throw new ApiError("Invalid Details", 400, "Animal not found with provided uuid", true);

        transaction = await sequelize.transaction();
        await Animal.update({ isDeleted: true, tagId: null }, { where: { uuid, farmId }, transaction });
        if (checkAnimal.tagId) {
            await Tag.update({ is_used: false }, { where: { uuid: checkAnimal.tagId, farmId }, transaction });
        }
        const fieldToUpdate = resolveCategoryCounterField(checkAnimal);
        await FarmConfiguration.decrement({ current_animals: 1, [fieldToUpdate]: 1 }, { where: { farmId }, transaction });
        await transaction.commit();

        const eventPayload = {
            farmId,
            message: `${user.email} has deleted a animal with tag name: ${checkAnimal.tagName} from the farm.`
        }
        Event.emit(EventTypes.Logs, eventPayload);
        return sendSuccessResponse(res, 200, true, "animal delete successfully.", "animal");
    } catch (error) {
        if (transaction) await transaction.rollback();
        next(error);
    }
};
export default DeleteAnimal;
