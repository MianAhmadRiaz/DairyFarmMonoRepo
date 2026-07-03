import { getUserById } from "../../../repo/user.js";
import { ApiError } from "../../../utils/ApiError.js";
import sendSuccessResponse from "../../../utils/responses/sendSuccessResponse.js";
import Employee from "../../../models/employee.js";
import SalaryInvoice from "../../../models/salaryInvoice.js";

// Normalizes month input ("2026-07", "7", "July 2026", ISO date...) to YYYY-MM
// so duplicate checks and grid lookups always agree.
const normalizeMonth = (month) => {
    if (/^\d{4}-\d{2}$/.test(String(month))) return String(month);
    const parsed = new Date(month);
    if (!Number.isNaN(parsed.getTime())) {
        return `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, "0")}`;
    }
    return null;
};

async function generateSalary(req, res, next) {
    try {
        const { body: {
            userId: employeeIdFromUserId, employee_id, month, expense_head, base_salary,
            total_days, present_days, absence_days, leave_allowance, salary_days,
            deduction, overtime, bonus, gross_salary
        }, userId } = req;

        // Accept both userId and employee_id for flexibility
        const employeeId = employeeIdFromUserId || employee_id;

        if (!employeeId) throw new ApiError("Invalid Credentials", 400, "employee_id is required", true);
        if (!month) throw new ApiError("Invalid Credentials", 400, "salary month is required", true);
        if (!expense_head) throw new ApiError("Invalid Credentials", 400, "expense_head is required", true);
        const user = await getUserById(userId);
        if (!user) throw new ApiError("Unauthorized", 400, "Unauthorized access.", true);
        const { farmId } = user;
        if (!farmId) throw new ApiError("Unauthorized", 400, "Farm not found.", true);
        const employee = await Employee.findOne({ where: { uuid: employeeId, farmId, isDeleted: false } });
        if (!employee) throw new ApiError("Invalid Details", 400, "Employee with provided userId does not exist", true);
        const normalizedMonth = normalizeMonth(month);
        if (!normalizedMonth) throw new ApiError("Invalid Credentials", 400, "month must be in YYYY-MM format.", true);
        // Guard against double generation for the same employee & month.
        const existingInvoice = await SalaryInvoice.findOne({
            where: { farmId, employee_id: employeeId, month: normalizedMonth, isDeleted: false },
            raw: true,
        });
        if (existingInvoice) throw new ApiError("Invalid Details", 400, `Salary invoice already exists for ${employee.name} for ${normalizedMonth}.`, true);
        const invoiceData = {
            createdBy: user.uuid,
            updatedBy: user.uuid,
            farmId,
            employee_id: employeeId,
            name: employee.name,
            month: normalizedMonth,
            expense_head,
            base_salary: base_salary || employee.salary || 0,
            total_days: total_days || 30,
            present_days: present_days || 0,
            absence_days: absence_days || 0,
            leave_allowance: leave_allowance || 0,
            salary_days: salary_days || 0,
            deduction: deduction || 0,
            overtime: overtime || 0,
            bonus: bonus || 0,
            gross_salary: gross_salary || 0,
        };
        const newInvoice = await SalaryInvoice.create(invoiceData);
        if (!newInvoice) throw new ApiError("Db Error", 400, "Salary not generated", true);
        // NOTE: the labor expense is posted when the invoice is marked PAID
        // (markInvoicePaid), at the net amount — not here at generation.
        return sendSuccessResponse(res, 201, true, "Salary invoice generate successfully", "salary", { salaryInvoiceId: newInvoice.uuid });
    } catch (error) {
        next(error);
    }
    return false;
}

export default generateSalary;
