import CalvingOffSprints from "../../models/calvingOffSprings.js";
import { getUserById } from "../../repo/user.js";
import { ApiError } from "../../utils/ApiError.js";
import sendSuccessResponse from "../../utils/responses/sendSuccessResponse.js";
import isValidUUID from "../../utils/uuidValidator.js";

const GetCalvingSprints = async (req, res, next) => {
    try {
        const { query: { calvingId }, userId } = req;
        const user = await getUserById(userId);
        if (!user) throw new ApiError("Unauthorized", 400, "Unauthorized access.", true);
        if (!isValidUUID(calvingId)) throw new ApiError("Invalid Details", 400, "Please provide calvingId for Calving off sprints.", true);
        const calvingSprints = await CalvingOffSprints.findAll({ where: { calvingId }, raw: true });
        const response = {
            calvingSprints
        }
        return sendSuccessResponse(res, 200, true, "Calving offSprints register successfully.", "breeding-event", response);
    } catch (error) {
        next(error);
    }
    return GetCalvingSprints;
};
export default GetCalvingSprints;
