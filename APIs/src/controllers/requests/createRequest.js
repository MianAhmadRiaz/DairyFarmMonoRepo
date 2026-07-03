import Requests from "../../models/requests.js";
import { getUserById } from "../../repo/user.js";
import { ApiError } from "../../utils/ApiError.js";
import sendSuccessResponse from "../../utils/responses/sendSuccessResponse.js";

const CreateRequest = async (req, res, next) => {
    try {
        const { body: { title, description }, userId } = req;
        const user = await getUserById(userId);
        if (!user) throw new ApiError("Unauthorized", 400, "Unauthorized access.", true);
        const { farmId } = user;
        if (!farmId) throw new ApiError("Unauthorized", 400, "Farm not found.", true);
        const paylaod = {
            farmId,
            title,
            description,
            createdBy: userId,
        }
        const newRequest = await Requests.create(paylaod);
        return sendSuccessResponse(res, 200, true, "Request created successfully.", "request", newRequest);
    } catch (error) {
        next(error);
    }
    return CreateRequest;
};
export default CreateRequest;
