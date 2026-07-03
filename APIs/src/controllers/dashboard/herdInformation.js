import { getHerdInfo } from "../../repo/admin.js";
import { getUserById } from "../../repo/user.js";
import { ApiError } from "../../utils/ApiError.js";
import sendSuccessResponse from "../../utils/responses/sendSuccessResponse.js";

const GetHerdInformation = async (req, res, next) => {
    try {
        const { userId } = req;
        const user = await getUserById(userId);
        if (!user) throw new ApiError("Unauthorized", 400, "Unauthorized access.", true);
        const { farmId } = user;
        if (!farmId) throw new ApiError("Unauthorized", 400, "Farm not found.", true);
        const responseData = await getHerdInfo(farmId);
        return sendSuccessResponse(res, 200, true, "herd information fetched successfully.", "dashboard", responseData);
    } catch (error) {
        next(error);
    }
    return GetHerdInformation;
};
export default GetHerdInformation;
