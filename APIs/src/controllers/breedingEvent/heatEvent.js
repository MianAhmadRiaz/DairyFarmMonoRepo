import sequelize from "../../config/db.js";
import { AnimalEvents } from "../../constants/index.js";
import Animal from "../../models/animal.js";
import HeatEvents from "../../models/heatEvent.js";
import { getUserById } from "../../repo/user.js";
import { ApiError } from "../../utils/ApiError.js";
import sendSuccessResponse from "../../utils/responses/sendSuccessResponse.js";

const HeatEvent = async (req, res, next) => {
    let transaction;
    try {
        const { body: { animalId, date, comments, reason }, userId } = req;
        const user = await getUserById(userId);
        if (!user) throw new ApiError("Unauthorized", 400, "Unauthorized access.", true);
        const { farmId } = user;
        if (!farmId) throw new ApiError("Unauthorized", 400, "Farm not found.", true);
        const animal = await Animal.findOne({ where: { uuid: animalId, farmId, isDeleted: false }, raw: true });
        if (!animal) throw new ApiError("Invalid Details", 400, "Animal with the provided animalId does not exist.", true);
        if (animal.gender !== "female") throw new ApiError("Invalid Details", 400, "Heat events can only be recorded for female animals.", true);

        const eventPayload = {
            reason: reason?.toLowerCase(),
            comments,
            date,
            farmId,
            animalId,
        };
        transaction = await sequelize.transaction();
        const event = await HeatEvents.create(eventPayload, { transaction });
        const animalUpdateQuery = {
            last_event: AnimalEvents.HEAT_DETECTION,
        }
        await Animal.update(animalUpdateQuery, { where: { uuid: animalId, farmId }, transaction });
        await transaction.commit();
        return sendSuccessResponse(res, 200, true, "Heat event register successfully.", "breeding-event", event);
    } catch (error) {
        if (transaction) await transaction.rollback();
        next(error);
    }
};
export default HeatEvent;
