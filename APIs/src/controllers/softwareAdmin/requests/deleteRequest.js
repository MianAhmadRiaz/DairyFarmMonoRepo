import Requests from "../../../models/requests.js";
import { getUserById } from "../../../repo/user.js";
import { ApiError } from "../../../utils/ApiError.js";
import sendSuccessResponse from "../../../utils/responses/sendSuccessResponse.js";
import isValidUUID from "../../../utils/uuidValidator.js";

const DeleteRequest = async (req, res, next) => {
    try {
        const { query: { requestId }, userId } = req;
        const user = await getUserById(userId, true);
        if (!user) throw new ApiError("Unauthorized", 400, "Unauthorized access.", true);
        if (!isValidUUID(requestId)) throw new ApiError("Invalid Details", 400, "Please provide a valid requestId.", true);
        const request = await Requests.findOne({ where: { uuid: requestId, isDeleted: false }, raw: true });
        if (!request) throw new ApiError("Invalid Details", 400, "Request not found with provided requestId", true);
        await Requests.update({ isDeleted: true }, { where: { uuid: requestId } });
        return sendSuccessResponse(res, 200, true, "Request delete successfully.", "Request");
    } catch (error) {
        next(error);
    }
    return DeleteRequest;
};
export default DeleteRequest;
