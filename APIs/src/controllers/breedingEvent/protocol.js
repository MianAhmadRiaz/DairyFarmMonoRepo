import { AnimalEvents } from "../../constants/index.js";
import Animal from "../../models/animal.js";
import Protocol from "../../models/protocolEvent.js";
import { getUserById } from "../../repo/user.js";
import { ApiError } from "../../utils/ApiError.js";
import sendSuccessResponse from "../../utils/responses/sendSuccessResponse.js";

const ProtocolEvent = async (req, res, next) => {
    try {
        const { body: { animalId, date, name, min_DIM, max_DIM, start_time }, userId } = req;
        const user = await getUserById(userId);
        if (!user) throw new ApiError("Unauthorized", 400, "Unauthorized access.", true);
        const { farmId } = user;
        if (!farmId) throw new ApiError("Unauthorized", 400, "Farm not found.", true);
        const animal = await Animal.findOne({ where: { uuid: animalId, farmId }, raw: true });
        if (!animal) throw new ApiError("Invalid Details", 400, "Animal with the provided animalId does not exist.", true);

        const eventPayload = {
            name: name?.toLowerCase(),
            min_DIM,
            max_DIM,
            farmId,
            start_time,
            date,
            animalId,
        };
        const event = await Protocol.create(eventPayload);
        const animalUpdateQuery = {
            last_event: AnimalEvents.PROTOCOL,
        }
        await Animal.update(animalUpdateQuery, { where: { uuid: animalId } });
        return sendSuccessResponse(res, 200, true, "Protocol event register successfully.", "breeding-event", event);
    } catch (error) {
        next(error);
    }
    return ProtocolEvent;
};
export default ProtocolEvent;
