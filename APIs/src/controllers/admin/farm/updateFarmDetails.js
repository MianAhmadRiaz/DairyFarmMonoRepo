import { getUserById } from "../../../repo/user.js";
import { ApiError } from "../../../utils/ApiError.js";
import sendSuccessResponse from "../../../utils/responses/sendSuccessResponse.js";
import Event from "../../eventEmiiter/events.js";
import { EventTypes } from "../../../constants/index.js";
import Farms from "../../../models/farm.js";

async function updateFarmDetails(req, res, next) {
    try {
        const { body: { name, time_zone, location }, userId } = req;
        const user = await getUserById(userId);
        if (!user) throw new ApiError("Unauthorized", 400, "Unauthorized access.", true);
        const { farmId } = user;
        if (!farmId) throw new ApiError("Unauthorized", 400, "Farm not found.", true);
        const dataToUpdate = {
            name,
            time_zone,
            location,
        };
        await Farms.update(dataToUpdate, { where: { uuid: farmId } });
        const eventPayload = {
            farmId,
            message: `${user.email} has updated the farm details.`
        }
        Event.emit(EventTypes.Logs, eventPayload);
        return sendSuccessResponse(res, 201, true, "Fram details updated successfully", "admin");
    } catch (error) {
        next(error);
    }
    return false;
}

export default updateFarmDetails;
