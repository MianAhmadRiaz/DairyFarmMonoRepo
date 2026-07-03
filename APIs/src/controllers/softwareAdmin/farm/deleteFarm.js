import Farms from "../../../models/farm.js";
import { getUserById } from "../../../repo/user.js";
import { ApiError } from "../../../utils/ApiError.js";
import sendSuccessResponse from "../../../utils/responses/sendSuccessResponse.js";

const DeleteFarm = async (req, res, next) => {
    try {
        const { query: { farmId }, userId } = req;
        const user = await getUserById(userId, true);
        if (!user) throw new ApiError("Unauthorized", 400, "Unauthorized access.", true);
        if (!farmId) throw new ApiError("Invalid Details", 400, "FarmId is required.", true);
        const where = { uuid: farmId };
        const farm = await Farms.findOne({ where, raw: true });
        if (!farm) throw new ApiError("Unauthorized", 400, "Farm not found.", true);
        if (farm.isDeleted) throw new ApiError("Unauthorized", 400, "Farm already deleted.", true);
        const updateQuery = {
            isDeleted: true,
        };
        await Farms.update(updateQuery, { where: { uuid: farmId } });
        return sendSuccessResponse(res, 200, true, "Farm updated successfully.", "software-admin");
    } catch (error) {
        next(error);
    }
    return DeleteFarm;
};
export default DeleteFarm;
