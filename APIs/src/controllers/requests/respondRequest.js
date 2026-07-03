import { RequestsStatus } from "../../constants/index.js";
import Requests from "../../models/requests.js";
import { getUserById } from "../../repo/user.js";
import { ApiError } from "../../utils/ApiError.js";
import sendSuccessResponse from "../../utils/responses/sendSuccessResponse.js";
import isValidUUID from "../../utils/uuidValidator.js";

// Approve/reject/hold a request — completes the leave/request workflow
// (previously requests could be filed but never answered).
const RespondRequest = async (req, res, next) => {
    try {
        const { body: { requestId, status, response }, userId } = req;
        const user = await getUserById(userId);
        if (!user) throw new ApiError("Unauthorized", 400, "Unauthorized access.", true);
        const { farmId } = user;
        if (!farmId) throw new ApiError("Unauthorized", 400, "Farm not found.", true);
        if (!isValidUUID(requestId)) throw new ApiError("Invalid Details", 400, "Please provide a valid requestId.", true);
        const validStatuses = Object.values(RequestsStatus);
        if (!validStatuses.includes(status)) {
            throw new ApiError("Invalid Details", 400, `status must be one of: ${validStatuses.join(", ")}.`, true);
        }
        const request = await Requests.findOne({ where: { uuid: requestId, farmId, isDeleted: false }, raw: true });
        if (!request) throw new ApiError("Invalid Details", 400, "Request not found with provided requestId.", true);

        await Requests.update(
            { status, response, respondBy: userId },
            { where: { uuid: requestId, farmId } }
        );
        const updated = await Requests.findOne({ where: { uuid: requestId, farmId }, raw: true });
        return sendSuccessResponse(res, 200, true, "request responded successfully.", "request", updated);
    } catch (error) {
        next(error);
    }
};

export default RespondRequest;
