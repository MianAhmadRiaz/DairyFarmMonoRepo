import Departments from "../../models/departments.js";
import { getUserById } from "../../repo/user.js";
import { ApiError } from "../../utils/ApiError.js";
import sendSuccessResponse from "../../utils/responses/sendSuccessResponse.js";
import isValidUUID from "../../utils/uuidValidator.js";

const UpdateDepartment = async (req, res, next) => {
    try {
        const { body: { departmentId, name, description }, userId } = req;
        const user = await getUserById(userId);
        if (!user) throw new ApiError("Unauthorized", 400, "Unauthorized access.", true);
        const { farmId } = user;
        if (!farmId) throw new ApiError("Unauthorized", 400, "Farm not found.", true);
        if (!isValidUUID(departmentId)) throw new ApiError("Invalid Details", 400, "Please provide a valid departmentId.", true);
        const department = await Departments.findOne({ where: { uuid: departmentId, farmId, isDeleted: false } });
        if (!department) throw new ApiError("Invalid Details", 400, "Department not found with provided departmentId", true);
        const updateData = { updatedBy: userId };
        if (name) updateData.name = name.toLowerCase();
        if (description !== undefined) updateData.description = description;
        await Departments.update(updateData, { where: { uuid: departmentId } });
        return sendSuccessResponse(res, 200, true, "Department updated successfully.", "departments");
    } catch (error) {
        next(error);
    }
    return false;
};
export default UpdateDepartment;
