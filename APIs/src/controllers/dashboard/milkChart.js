import { getMilkChartInfo, getMilkDetails } from "../../repo/admin.js";
import { getUserById } from "../../repo/user.js";
import { ApiError } from "../../utils/ApiError.js";
import sendSuccessResponse from "../../utils/responses/sendSuccessResponse.js";

const GetMilkInformation = async (req, res, next) => {
    try {
        const { query: { filter, startDate, endDate }, userId } = req;
        const user = await getUserById(userId);
        if (!user) throw new ApiError("Unauthorized", 400, "Unauthorized access.", true);
        const { farmId } = user;
        if (!farmId) throw new ApiError("Unauthorized", 400, "Farm not found.", true);
        const responseData = await getMilkChartInfo(filter, startDate, endDate, farmId);
        const daysMilk = await getMilkDetails(filter, farmId);
        const { current_week_total_milk, current_month_total_milk, current_year_total_milk } = daysMilk;
        const data = {
            milkData: responseData,
            ...daysMilk,
            currentFilterMilk : current_week_total_milk || current_month_total_milk || current_year_total_milk
        }
        return sendSuccessResponse(res, 200, true, "Milk information fetched successfully.", "dashboard", data);
    } catch (error) {
        next(error);
    }
};
export default GetMilkInformation;
