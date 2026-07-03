import Farms from "../../../models/farm.js";
import { getUserById } from "../../../repo/user.js";
import { ApiError } from "../../../utils/ApiError.js";
import { invalidateFarmAccessCache } from "../../../middlewares/farmAccessGuard.js";
import sendSuccessResponse from "../../../utils/responses/sendSuccessResponse.js";

const blockUnblockFarm = async (req, res, next) => {
    try {
        const { query: { farmId }, userId } = req;
        const user = await getUserById(userId, true);
        if (!user) throw new ApiError("Unauthorized", 400, "Unauthorized access.", true);
        if (!farmId) throw new ApiError("Invalid Details", 400, "FarmId is required.", true);
        const where = { uuid: farmId };
        const farm = await Farms.findOne({ where, raw: true });
        if (!farm) throw new ApiError("Unauthorized", 400, "Farm not found.", true);
        const updateQuery = {
            isBlocked: !farm.isBlocked,
        };
        await Farms.update(updateQuery, { where: { uuid: farmId } });
        invalidateFarmAccessCache(farmId);
        return sendSuccessResponse(res, 200, true, "Farm updated successfully.", "software-admin");
    } catch (error) {
        next(error);
    }
};
export default blockUnblockFarm;
