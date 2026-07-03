import { getHerdComparison } from "../../repo/admin.js";
import { getUserById } from "../../repo/user.js";
import { ApiError } from "../../utils/ApiError.js";
import sendSuccessResponse from "../../utils/responses/sendSuccessResponse.js";

const GetHerdComparison = async (req, res, next) => {
    try {
        const { query: { year }, userId } = req;
        const user = await getUserById(userId);
        if (!user) throw new ApiError("Unauthorized", 400, "Unauthorized access.", true);
        const { farmId } = user;
        if (!farmId) throw new ApiError("Unauthorized", 400, "Farm not found.", true);

        const targetYear = year ? Number(year) : new Date().getFullYear();
        if (!Number.isInteger(targetYear) || targetYear < 2000 || targetYear > 2100) {
            throw new ApiError("Invalid Details", 400, "Please provide a valid year.", true);
        }

        const data = await getHerdComparison(farmId, targetYear);
        return sendSuccessResponse(res, 200, true, "Herd comparison fetched successfully.", "dashboard", data);
    } catch (error) {
        next(error);
    }
};

export default GetHerdComparison;
