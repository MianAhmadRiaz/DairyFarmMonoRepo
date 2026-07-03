
import { getUserById } from "../../repo/user.js";
import { ApiError } from "../../utils/ApiError.js";
import sendSuccessResponse from "../../utils/responses/sendSuccessResponse.js";
import { getReportData } from "../../repo/summrayReports.js";

const SummaryReport = async (req, res, next) => {
    try {
        const { query: { categoryId, startDate, endDate = new Date() }, userId } = req;
        const user = await getUserById(userId);
        if (!user) throw new ApiError("Unauthorized", 400, "Unauthorized access.", true);
        const { farmId } = user;
        if (!farmId) throw new ApiError("Unauthorized", 400, "Farm not found.", true);
        if (!startDate) throw new ApiError("Unauthorized", 400, "Start date is required.", true);
        // Fetch Data
        const result = await getReportData({ farmId, startDate, endDate, categoryId });
        const responseData = {
            result
        };
        return sendSuccessResponse(res, 200, true, "Summary Report fetched successfully.", "stock-items", responseData);
    } catch (error) {
        next(error);
    }
    return SummaryReport;
};
export default SummaryReport;
