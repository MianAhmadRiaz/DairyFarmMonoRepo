import Departments from "../../models/departments.js";
import { getUserById } from "../../repo/user.js";
import { ApiError } from "../../utils/ApiError.js";
import sendSuccessResponse from "../../utils/responses/sendSuccessResponse.js";
import isValidUUID from "../../utils/uuidValidator.js";

const DeleteDepartment = async (req, res, next) => {
    try {
        const { query: { departmentId }, userId } = req;
        const user = await getUserById(userId);
        if (!user) throw new ApiError("Unauthorized", 400, "Unauthorized access.", true);
        const { farmId } = user;
        if (!farmId) throw new ApiError("Unauthorized", 400, "Farm not found.", true);
        if (!isValidUUID(departmentId)) throw new ApiError("Invalid Details", 400, "Please provide a valid departmentId.", true);
        const checkDepartment = await Departments.findOne({ where: { uuid: departmentId, farmId, isDeleted: false }, raw: true });
        if (!checkDepartment) throw new ApiError("Invalid Details", 400, "Department not found with provided departmentId", true);
        await Departments.update({ isDeleted: true }, { where: { uuid: departmentId } });
        return sendSuccessResponse(res, 200, true, "Department delete successfully.", "departments");
    } catch (error) {
        next(error);
    }
    return DeleteDepartment;
};
export default DeleteDepartment;
