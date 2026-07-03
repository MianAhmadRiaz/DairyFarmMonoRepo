import HeatDetectionReasons from "../../models/heatDetectionReason.js"
import { getUserById } from "../../repo/user.js";
import { ApiError } from "../../utils/ApiError.js";
import sendSuccessResponse from "../../utils/responses/sendSuccessResponse.js";

const HeatDetectionReason = async (req, res, next) => {
    try {
        const { body: { name }, userId } = req;
        const user = await getUserById(userId);
        if (!user) throw new ApiError("Unauthorized", 400, "Unauthorized access.", true);
        const { farmId } = user;
        if (!farmId) throw new ApiError("Unauthorized", 400, "Farm not found.", true);
        const heatReason = await HeatDetectionReasons.findOne({ where: { name: name.toLowerCase() }, raw: true });
        if (heatReason) throw new ApiError("Invalid Details", 400, "Reason with the provided name already exist.", true);

        const eventPayload = {
            name: name.toLowerCase(),
            farmId
        };
        const event = await HeatDetectionReasons.create(eventPayload, { raw: true });
        return sendSuccessResponse(res, 200, true, "Heat reason add successfully.", "breeding-event", event);
    } catch (error) {
        next(error);
    }
    return HeatDetectionReason;
};
export default HeatDetectionReason;
