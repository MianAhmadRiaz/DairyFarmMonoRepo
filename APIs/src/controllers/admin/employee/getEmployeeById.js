import Employee from "../../../models/employee.js";
import { getUserById } from "../../../repo/user.js";
import { ApiError } from "../../../utils/ApiError.js";
import sendSuccessResponse from "../../../utils/responses/sendSuccessResponse.js";
import isValidUUID from "../../../utils/uuidValidator.js";

const getEmployeeById = async (req, res, next) => {
    try {
        const { params: { id }, userId } = req;
        
        if (!isValidUUID(id)) {
            throw new ApiError("Invalid Credentials", 400, "Please provide a valid employee ID", true);
        }

        const user = await getUserById(userId);
        if (!user) throw new ApiError("Unauthorized", 400, "Unauthorized access.", true);
        const { farmId } = user;
        if (!farmId) throw new ApiError("Unauthorized", 400, "Farm not found.", true);

        const employee = await Employee.findOne({ 
            where: { uuid: id, farmId, isDeleted: false },
            attributes: { exclude: ["isDeleted"] }
        });

        if (!employee) {
            throw new ApiError("Not Found", 404, "Employee not found with provided ID", true);
        }

        return sendSuccessResponse(res, 200, true, "Employee fetched successfully.", "employee", employee);
    } catch (error) {
        next(error);
    }
};

export default getEmployeeById;
