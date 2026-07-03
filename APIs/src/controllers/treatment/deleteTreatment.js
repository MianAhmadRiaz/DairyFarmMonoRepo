import Treatment from "../../models/treatment.js";
import { getUserById } from "../../repo/user.js";
import { ApiError } from "../../utils/ApiError.js";
import sendSuccessResponse from "../../utils/responses/sendSuccessResponse.js";
import isValidUUID from "../../utils/uuidValidator.js";

const DeleteTreatment = async (req, res, next) => {
    try {
        const { query: { treatmentId }, userId } = req;
        const user = await getUserById(userId);
        if (!user) throw new ApiError("Unauthorized", 400, "Unauthorized access.", true);
        const { farmId } = user;
        if (!farmId) throw new ApiError("Unauthorized", 400, "Farm not found.", true);
        if (!isValidUUID(treatmentId)) throw new ApiError("Invalid Details", 400, "Please provide a valid treatmentId.", true);
        const treatment = await Treatment.findOne({ where: { uuid: treatmentId, farmId, isDeleted: false }, raw: true });
        if (!treatment) throw new ApiError("Invalid Details", 400, "Treatment not found with provided treatmentId.", true);
        await Treatment.update({ isDeleted: true }, { where: { uuid: treatmentId, farmId } });
        return sendSuccessResponse(res, 200, true, "treatment deleted successfully.", "treatment");
    } catch (error) {
        next(error);
    }
};
export default DeleteTreatment;
