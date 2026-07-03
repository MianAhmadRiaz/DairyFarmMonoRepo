import Protocol from "../../models/protocolEvent.js";
import ProtocolSteps from "../../models/protocolSteps.js";
import { getUserById } from "../../repo/user.js";
import { ApiError } from "../../utils/ApiError.js";
import sendSuccessResponse from "../../utils/responses/sendSuccessResponse.js";

const ProtocolStep = async (req, res, next) => {
    try {
        const { body: { hours_offset, protocolId, injectionType }, userId } = req;
        const user = await getUserById(userId);
        if (!user) throw new ApiError("Unauthorized", 400, "Unauthorized access.", true);
        const { farmId } = user;
        if (!farmId) throw new ApiError("Unauthorized", 400, "Farm not found.", true);
        const protocolEvent = await Protocol.findOne({ where: { uuid: protocolId, farmId }, raw: true });
        if (!protocolEvent) throw new ApiError("Invalid Details", 400, "Protocol event with the provided protocolId does not exist.", true);
        const eventPayload = { hours_offset, protocolId, injectionType };
        const event = await ProtocolSteps.create(eventPayload);
        return sendSuccessResponse(res, 200, true, "Protocol step register successfully.", "breeding-event", event);
    } catch (error) {
        next(error);
    }
    return ProtocolStep;
};
export default ProtocolStep;
