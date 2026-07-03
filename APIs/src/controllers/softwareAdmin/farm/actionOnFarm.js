import Farms from "../../../models/farm.js";
import { getUserById } from "../../../repo/user.js";
import { ApiError } from "../../../utils/ApiError.js";
import sendSuccessResponse from "../../../utils/responses/sendSuccessResponse.js";

const approveOrRejectFarm = async (req, res, next) => {
    try {
        const { query: { status, farmId }, userId } = req;
        const user = await getUserById(userId, true);
        if (!user) throw new ApiError("Unauthorized", 400, "Unauthorized access.", true);
        if (!farmId) throw new ApiError("Invalid Details", 400, "FarmId is required.", true);
        if (!["REJECTED", "APPROVED"].includes(status?.toUpperCase())) throw new ApiError("Invalid Details", 400, "Please provide a valid status.", true);
        const where = { uuid: farmId };
        const farm = await Farms.findOne({ where, raw: true });
        if (!farm) throw new ApiError("Unauthorized", 400, "Farm not found.", true);
        const updateQuery = {
            status_updated_at: new Date(),
            status: status?.toUpperCase(),
            is_active: status?.toUpperCase() === "APPROVED",
        };
        await Farms.update(updateQuery, { where: { uuid: farmId } });
        return sendSuccessResponse(res, 200, true, "Farm updated successfully.", "software-admin");
    } catch (error) {
        next(error);
    }
    return approveOrRejectFarm;
};
export default approveOrRejectFarm;
