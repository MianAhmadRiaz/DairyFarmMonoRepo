import CalvingEvent from "../../models/calvingEvent.js";
import CalvingOffSprints from "../../models/calvingOffSprings.js";
import { getUserById } from "../../repo/user.js";
import { ApiError } from "../../utils/ApiError.js";
import sendSuccessResponse from "../../utils/responses/sendSuccessResponse.js";

const CalvingSprints = async (req, res, next) => {
    try {
        const { body: { penId, calvingId, tagId, isAlive, weight, reason_if_dead, temp_id, gender, breedType }, userId } = req;
        const user = await getUserById(userId);
        if (!user) throw new ApiError("Unauthorized", 400, "Unauthorized access.", true);
        const { farmId } = user;
        if (!farmId) throw new ApiError("Unauthorized", 400, "Farm not found.", true);
        const calvingEvent = await CalvingEvent.findOne({ where: { uuid: calvingId, farmId }, raw: true });
        if (!calvingEvent) throw new ApiError("Invalid Details", 400, "Calving event with the provided calvingId does not exist.", true);

        const eventPayload = { penId, calvingId, tagId, isAlive, weight, reason_if_dead, temp_id, gender, breedType };
        const event = await CalvingOffSprints.create(eventPayload);
        return sendSuccessResponse(res, 200, true, "Calving offSprints register successfully.", "breeding-event", event);
    } catch (error) {
        next(error);
    }
    return CalvingSprints;
};
export default CalvingSprints;
