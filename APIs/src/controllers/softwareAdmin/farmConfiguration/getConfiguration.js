import Farms from "../../../models/farm.js";
import FarmConfiguration from "../../../models/farmConfiguration.js";
import { getUserById } from "../../../repo/user.js";
import { ApiError } from "../../../utils/ApiError.js";
import sendSuccessResponse from "../../../utils/responses/sendSuccessResponse.js";
import isValidUUID from "../../../utils/uuidValidator.js";

const getFarmConfiguration = async (req, res, next) => {
    try {
        const { userId, query: { farmId } } = req;
        const user = await getUserById(userId, true);
        if (!user) throw new ApiError("Unauthorized", 400, "Unauthorized access.", true);
        if (!isValidUUID(farmId)) throw new ApiError("Unauthorized", 400, "Please provide a valid farmId.", true);
        const where = { uuid: farmId };
        const farm = await Farms.findOne({ where, raw: true });
        if (!farm) throw new ApiError("Unauthorized", 400, "Farm not found.", true);
        const config = await FarmConfiguration.findOne({ where: { farmId }, raw: true });
        if (!config) throw new ApiError("Unauthorized", 400, "Farm configuration not found.", true);
        return sendSuccessResponse(res, 200, true, "Farm configuration fetched successfully.", "config", config);
    } catch (error) {
        next(error);
    }
    return getFarmConfiguration;
};
export default getFarmConfiguration;
