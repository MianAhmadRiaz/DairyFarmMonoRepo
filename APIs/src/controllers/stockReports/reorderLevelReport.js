
import { getUserById } from "../../repo/user.js";
import { ApiError } from "../../utils/ApiError.js";
import sendSuccessResponse from "../../utils/responses/sendSuccessResponse.js";
import { getReOrderReport } from "../../repo/summrayReports.js";

const reOrderReport = async (req, res, next) => {
    try {
        const { userId } = req;
        const user = await getUserById(userId);
        if (!user) throw new ApiError("Unauthorized", 400, "Unauthorized access.", true);
        const { farmId } = user;
        if (!farmId) throw new ApiError("Unauthorized", 400, "Farm not found.", true);
        // Fetch Data
        const items = await getReOrderReport(farmId);
        const responseData = {
            items,
        };
        return sendSuccessResponse(res, 200, true, "ReOrder Report fetched successfully.", "report", responseData);
    } catch (error) {
        next(error);
    }
    return reOrderReport;
};
export default reOrderReport;
