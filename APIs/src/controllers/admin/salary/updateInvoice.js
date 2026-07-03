import { getUserById } from "../../../repo/user.js";
import { ApiError } from "../../../utils/ApiError.js";
import sendSuccessResponse from "../../../utils/responses/sendSuccessResponse.js";
import isValidUUID from "../../../utils/uuidValidator.js";
import SalaryInvoice from "../../../models/salaryInvoice.js";

async function updateInvoice(req, res, next) {
    try {
        const { body: { uuid }, userId } = req;
        if (!isValidUUID(uuid)) throw new ApiError("Invalid Credentials", 400, "Please provide a valid invoiceId", true);
        const user = await getUserById(userId);
        if (!user) throw new ApiError("Unauthorized", 400, "Unauthorized access.", true);
        const { farmId } = user;
        if (!farmId) throw new ApiError("Unauthorized", 400, "Farm not found.", true);
        const invoice = await SalaryInvoice.findOne({ where: { uuid, farmId, isDeleted: false } });
        if (!invoice) throw new ApiError("Invalid Details", 400, "Salary invoice with provided uuid is not found.", true);
        if (invoice.status === "paid") throw new ApiError("Invalid Details", 400, "Salary invoice is already paid so you can not update it.", true);
        // Whitelist: only payroll figures are editable — never status (use the
        // mark-paid endpoint), ownership, or audit fields.
        const allowed = ["base_salary", "total_days", "present_days", "absence_days", "leave_allowance", "salary_days", "deduction", "overtime", "bonus", "gross_salary", "expense_head"];
        const dataToUpdate = { updatedBy: userId };
        allowed.forEach((field) => {
            if (req.body[field] !== undefined) dataToUpdate[field] = req.body[field];
        });
        await SalaryInvoice.update(dataToUpdate, { where: { uuid, farmId } });
        return sendSuccessResponse(res, 201, true, "Salary invoice updated successfully", "salary");
    } catch (error) {
        next(error);
    }
    return false;
}

export default updateInvoice;
