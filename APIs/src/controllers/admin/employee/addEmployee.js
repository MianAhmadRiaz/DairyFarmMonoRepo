import { getUserById } from "../../../repo/user.js";
import { ApiError } from "../../../utils/ApiError.js";
import sendSuccessResponse from "../../../utils/responses/sendSuccessResponse.js";
import FarmConfiguration from "../../../models/farmConfiguration.js";
import Employee from "../../../models/employee.js";
import Event from "../../eventEmiiter/events.js";
import { EventTypes } from "../../../constants/index.js";

async function AddEmployee(req, res, next) {
    try {
        const { body: {
            name, father_name, phone, cnic, gender, dob, marital_status, designation,
            department, doj, leave_allow, salary, acc_no, opening_advance, address, city,
        }, userId } = req;

        if (!name) throw new ApiError("Invalid Credentials", 400, "name is required", true);
        if (!dob) throw new ApiError("Invalid Credentials", 400, "dob is required", true);
        if (!doj) throw new ApiError("Invalid Credentials", 400, "doj is required", true);
        if (!father_name) throw new ApiError("Invalid Credentials", 400, "father name is required", true);
        if (!designation) throw new ApiError("Invalid Credentials", 400, "designation is required", true);
        if (!phone) throw new ApiError("Invalid Credentials", 400, "phone is required", true);
        if (!city) throw new ApiError("Invalid Credentials", 400, "phone is required", true);
        if (marital_status && !["single", "married"].includes(marital_status?.toLowerCase())) throw new ApiError("Invalid Credentials", 400, "marital_status is required", true);
        if (!department) throw new ApiError("Invalid Credentials", 400, "department is required", true);
        if (!father_name) throw new ApiError("Invalid Credentials", 400, "father name is required", true);
        const user = await getUserById(userId);
        if (!user) throw new ApiError("Unauthorized", 400, "Unauthorized access.", true);
        const { farmId } = user;
        if (!farmId) throw new ApiError("Unauthorized", 400, "Farm not found.", true);
        const config = await FarmConfiguration.findOne({ where: { farmId }, raw: true });
        if (!config) throw new ApiError("Unauthorized", 400, "Farm configuration not found.", true);
        const { allowed_employees, current_employees } = config;
        if (current_employees >= allowed_employees) throw new ApiError("Limit exceed", 400, `You have reach the maximum allowed ${allowed_employees} employees limit.`, true);
        const userExists = await Employee.findOne({ where: { name: name.toLowerCase(), father_name: father_name.toLowerCase(), farmId, isDeleted: false } });
        if (userExists) throw new ApiError("Invalid Details", 400, "Employee with provided name and father name already exist", true);
        const userData = {
            createdBy: user.uuid,
            updatedBy: user.uuid, acc_no,
            name, phone, city,
            father_name,
            farmId, department, designation, address,
            dob, doj, leave_allow, opening_advance, salary,
            cnic, gender: gender?.toLowerCase(), marital_status: marital_status.toLowerCase(),
        };
        const newUser = await Employee.create(userData);
        if (!newUser) throw new ApiError("Db Error", 400, "Employee not added", true);
        await FarmConfiguration.increment({ current_employees: 1 }, { where: { farmId } });
        const eventPayload = {
            farmId,
            message: `${user.email} has added a new employee with name: ${name} to the farm.`
        }
        Event.emit(EventTypes.Logs, eventPayload);
        return sendSuccessResponse(res, 201, true, "Employee details added successfully", "admin");
    } catch (error) {
        next(error);
    }
    return false;
}

export default AddEmployee;
