import ProtocolSteps from "../../models/protocolSteps.js";
import { getUserById } from "../../repo/user.js";
import { ApiError } from "../../utils/ApiError.js";
import sendSuccessResponse from "../../utils/responses/sendSuccessResponse.js";
import isValidUUID from "../../utils/uuidValidator.js";

const GetProtocolSteps = async (req, res, next) => {
    try {
        const { query: { protocolId }, userId } = req;
        const user = await getUserById(userId);
        if (!user) throw new ApiError("Unauthorized", 400, "Unauthorized access.", true);
        if (!isValidUUID(protocolId)) throw new ApiError("Invalid Details", 400, "Please provide protocolId for Protocol steps.", true);
        const protocolSteps = await ProtocolSteps.findAll({ where: { protocolId }, raw: true });
        const response = {
            protocolSteps
        }
        return sendSuccessResponse(res, 200, true, "Protocol steps fetched successfully.", "breeding-event", response);
    } catch (error) {
        next(error);
    }
    return GetProtocolSteps;
};
export default GetProtocolSteps;
