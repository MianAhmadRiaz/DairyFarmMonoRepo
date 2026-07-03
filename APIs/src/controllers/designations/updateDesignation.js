import Designation from "../../models/designation.js";
import { getUserById } from "../../repo/user.js";
import { ApiError } from "../../utils/ApiError.js";
import sendSuccessResponse from "../../utils/responses/sendSuccessResponse.js";
import isValidUUID from "../../utils/uuidValidator.js";

const updateDesignation = async (req, res, next) => {
    try {
        const { body: { designationId, name, description }, userId } = req;
        const user = await getUserById(userId);
        if (!user) throw new ApiError("Unauthorized", 400, "Unauthorized access.", true);
        const { farmId } = user;
        if (!farmId) throw new ApiError("Unauthorized", 400, "Farm not found.", true);
        if (!isValidUUID(designationId)) throw new ApiError("Invalid Details", 400, "Please provide a valid designationId.", true);
        const designation = await Designation.findOne({ where: { uuid: designationId, farmId, isDeleted: false } });
        if (!designation) throw new ApiError("Invalid Details", 400, "Designation not found with provided designationId", true);
        const updateData = { updatedBy: userId };
        if (name) updateData.name = name.toLowerCase();
        if (description !== undefined) updateData.description = description;
        await Designation.update(updateData, { where: { uuid: designationId } });
        return sendSuccessResponse(res, 200, true, "Designation updated successfully.", "designation");
    } catch (error) {
        next(error);
    }
    return false;
};

export default updateDesignation;
