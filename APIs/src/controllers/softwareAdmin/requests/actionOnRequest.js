import { RequestsStatus } from "../../../constants/index.js";
import Requests from "../../../models/requests.js";
import { getUserById } from "../../../repo/user.js";
import { ApiError } from "../../../utils/ApiError.js";
import sendSuccessResponse from "../../../utils/responses/sendSuccessResponse.js";
import isValidUUID from "../../../utils/uuidValidator.js";

const actionOnRequest = async (req, res, next) => {
    try {
        const { body: { status, requestId, response }, userId } = req;
        const user = await getUserById(userId, true);
        if (!user) throw new ApiError("Unauthorized", 400, "Unauthorized access.", true);
        if (!isValidUUID(requestId)) throw new ApiError("Invalid Details", 400, "Please provide a valid requestId", true);
        if (!Object.values(RequestsStatus).includes(status?.toLowerCase())) throw new ApiError("Invalid Details", 400, "Please provide a valid status", true);
        const request = await Requests.findOne({ where: { uuid: requestId, isDeleted: false }, raw: true });
        if (!request) throw new ApiError("Invalid Details", 400, "request not found with provided requestId", true);
        const updateQuery = {
            response,
            status: status.toLowerCase(),
            respondBy: userId,
        }
        await Requests.update(updateQuery, { where: { uuid: requestId } });
        return sendSuccessResponse(res, 200, true, "Requests update successfully.", "request");
    } catch (error) {
        next(error);
    }
    return actionOnRequest;
};
export default actionOnRequest;
