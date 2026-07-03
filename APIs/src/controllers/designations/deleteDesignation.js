import Designation from "../../models/designation.js";
import { getUserById } from "../../repo/user.js";
import { ApiError } from "../../utils/ApiError.js";
import sendSuccessResponse from "../../utils/responses/sendSuccessResponse.js";
import isValidUUID from "../../utils/uuidValidator.js";

const deleteDesignation = async (req, res, next) => {
    try {
        const { query: { designationId }, userId } = req;
        const user = await getUserById(userId);
        if (!user) throw new ApiError("Unauthorized", 400, "Unauthorized access.", true);
        const { farmId } = user;
        if (!farmId) throw new ApiError("Unauthorized", 400, "Farm not found.", true);
        if (!isValidUUID(designationId)) throw new ApiError("Invalid Details", 400, "Please provide a valid designationId.", true);
        const designation = await Designation.findOne({ where: { uuid: designationId, farmId, isDeleted: false }, raw: true });
        if (!designation) throw new ApiError("Invalid Details", 400, "Designation not found with provided designationId", true);
        await Designation.update({ isDeleted: true, updatedBy: userId }, { where: { uuid: designationId } });
        return sendSuccessResponse(res, 200, true, "Designation deleted successfully.", "designation");
    } catch (error) {
        next(error);
    }
    return false;
};

export default deleteDesignation;
