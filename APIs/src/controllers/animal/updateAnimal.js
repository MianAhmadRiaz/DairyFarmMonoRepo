import { EventTypes } from "../../constants/index.js";
import Animal from "../../models/animal.js";
import { getUserById } from "../../repo/user.js";
import { ApiError } from "../../utils/ApiError.js";
import { stripProtectedAnimalFields } from "../../utils/herd/animalHelpers.js";
import sendSuccessResponse from "../../utils/responses/sendSuccessResponse.js";
import Event from "../eventEmiiter/events.js";

const UpdateAnimal = async (req, res, next) => {
    try {
        const { body: { uuid, ...updateFields }, userId } = req;
        const user = await getUserById(userId);
        if (!user) throw new ApiError("Unauthorized", 400, "Unauthorized access.", true);
        const { farmId } = user;
        if (!farmId) throw new ApiError("Unauthorized", 400, "Farm not found.", true);
        const checkAnimal = await Animal.findOne({ where: { uuid, farmId, isDeleted: false } });
        if (!checkAnimal) throw new ApiError("Invalid Details", 400, "Animal not found with provided uuid.", true);
        const safeFields = { ...stripProtectedAnimalFields(updateFields), updatedBy: userId };
        await Animal.update(safeFields, { where: { uuid, farmId } });
        const updatedAnimal = await Animal.findOne({ where: { uuid, farmId } });
        const eventPayload = {
            farmId,
            message: `${user.email} has updated the animal ${checkAnimal.tagName} details.`
        }
        Event.emit(EventTypes.Logs, eventPayload);
        return sendSuccessResponse(res, 200, true, "animal update successfully.", "animal", updatedAnimal);
    } catch (error) {
        next(error);
    }
};
export default UpdateAnimal;
