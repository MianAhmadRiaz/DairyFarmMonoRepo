import FarmConfiguration from "../../../models/farmConfiguration.js";
import { getUserById } from "../../../repo/user.js";
import { ApiError } from "../../../utils/ApiError.js";
import sendSuccessResponse from "../../../utils/responses/sendSuccessResponse.js";

const UpdateFarmConfiguration = async (req, res, next) => {
    try {
        const { body: { uuid, ...updateFields }, userId } = req;
        const user = await getUserById(userId, true);
        if (!user) throw new ApiError("Unauthorized", 400, "Unauthorized access.", true);
        const checkConfig = await FarmConfiguration.findOne({ where: { uuid } });
        if (!checkConfig) throw new ApiError("Invalid Details", 400, "Farm configuration not found.", true);
        await FarmConfiguration.update(updateFields, { where: { uuid } });
        const updateConfig = await FarmConfiguration.findOne({ where: { uuid } });
        return sendSuccessResponse(res, 200, true, "animal add successfully.", "animal", updateConfig);
    } catch (error) {
        next(error);
    }
    return UpdateFarmConfiguration;
};
export default UpdateFarmConfiguration;
