import Departments from "../../models/departments.js";
import { getUserById } from "../../repo/user.js";
import { ApiError } from "../../utils/ApiError.js";
import sendSuccessResponse from "../../utils/responses/sendSuccessResponse.js";

const AddDepartment = async (req, res, next) => {
    try {
        const { body: { name, description }, userId } = req;
        const user = await getUserById(userId);
        if (!user) throw new ApiError("Unauthorized", 400, "Unauthorized access.", true);
        const { farmId } = user;
        if (!farmId) throw new ApiError("Unauthorized", 400, "Farm not found.", true);
        if (!name) throw new ApiError("Unauthorized", 400, "name is required.", true);
        const checkDepartment = await Departments.findOne({ where: { name: name.toLowerCase(), farmId, isDeleted: false }, raw: true });
        if (checkDepartment) throw new ApiError("Invalid Details", 400, "Department with provided name already exist in your list.", true);
        const paylaod = {
            farmId,
            name: name.toLowerCase(),
            description,
            createdBy: userId,
            updatedBy: userId,
        }
        const createDepartment = await Departments.create(paylaod);
        return sendSuccessResponse(res, 200, true, "Department add successfully.", "departments", createDepartment);
    } catch (error) {
        next(error);
    }
    return AddDepartment;
};
export default AddDepartment;
