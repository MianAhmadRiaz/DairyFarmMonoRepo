import { getUserById } from "../../../repo/user.js";
import { ApiError } from "../../../utils/ApiError.js";
import sendSuccessResponse from "../../../utils/responses/sendSuccessResponse.js";
import Employee from "../../../models/employee.js";
import SalaryAdvance from "../../../models/advanceSalary.js";
import { recordAdvanceGiven } from "../../../utils/finance/financeHooks.js";

async function AdvanceSalary(req, res, next) {
    try {
        const { body: { userId: employeeIdFromUserId, employee_id, date, amount, account, naration, remarks }, userId } = req;

        // Accept both userId and employee_id for flexibility
        const employeeId = employeeIdFromUserId || employee_id;

        if (!employeeId) throw new ApiError("Invalid Credentials", 400, "employee_id is required", true);
        if (!date) throw new ApiError("Invalid Credentials", 400, "date is required", true);
        if (!amount) throw new ApiError("Invalid Credentials", 400, "amount is required", true);
        const user = await getUserById(userId);
        if (!user) throw new ApiError("Unauthorized", 400, "Unauthorized access.", true);
        const { farmId } = user;
        if (!farmId) throw new ApiError("Unauthorized", 400, "Farm not found.", true);
        const employee = await Employee.findOne({ where: { uuid: employeeId, farmId, isDeleted: false } });
        if (!employee) throw new ApiError("Invalid Details", 400, "Employee with provided employee_id does not exist", true);
        const invoiceData = {
            createdBy: user.uuid,
            updatedBy: user.uuid,
            farmId,
            employee_id: employeeId,
            date,
            amount,
            account: account || "Cash",
            naration: naration || remarks || "",
        };
        const newAdvance = await SalaryAdvance.create(invoiceData);
        if (!newAdvance) throw new ApiError("Db Error", 400, "Salary advance not generated", true);
        // Finance automation: record the advance as an employee receivable (non-blocking)
        await recordAdvanceGiven({
            farmId,
            userId,
            amount,
            referenceId: newAdvance.uuid,
            description: `Advance to ${employee.name}`,
            date,
        });
        return sendSuccessResponse(res, 201, true, "Salary advance created successfully", "salary_advance", { advanceId: newAdvance.uuid });
    } catch (error) {
        next(error);
    }
    return false;
}

export default AdvanceSalary;
