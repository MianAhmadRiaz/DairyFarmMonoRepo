import { getUserById } from "../../../repo/user.js";
import { ApiError } from "../../../utils/ApiError.js";
import { recordSalaryPayment } from "../../../utils/finance/financeHooks.js";
import sendSuccessResponse from "../../../utils/responses/sendSuccessResponse.js";
import isValidUUID from "../../../utils/uuidValidator.js";
import SalaryInvoice from "../../../models/salaryInvoice.js";

async function markInvoicePaid(req, res, next) {
    try {
        const { query: { invoiceId: uuid }, userId } = req;
        if (!isValidUUID(uuid)) throw new ApiError("Invalid Credentials", 400, "Please provide a valid invoiceId", true);
        const user = await getUserById(userId);
        if (!user) throw new ApiError("Unauthorized", 400, "Unauthorized access.", true);
        const { farmId } = user;
        if (!farmId) throw new ApiError("Unauthorized", 400, "Farm not found.", true);
        const invoice = await SalaryInvoice.findOne({ where: { uuid, farmId, isDeleted: false } });
        if (!invoice) throw new ApiError("Invalid Details", 400, "Salary invoice with provided uuid is not found.", true);
        if (invoice.status === "paid") throw new ApiError("Invalid Details", 400, "Salary invoice is already paid.", true);
        const dataToUpdate = {
            status: "paid",
            updatedBy: userId,
            paid_at: new Date()
        };
        await SalaryInvoice.update(dataToUpdate, { where: { uuid, farmId } });
        // Finance: post the labor expense at PAYMENT time, at the NET amount
        // actually paid out (gross minus deductions/advance recovery).
        const netPaid = Math.max((Number(invoice.gross_salary) || 0) - (Number(invoice.deduction) || 0), 0);
        if (netPaid > 0) {
            await recordSalaryPayment({
                farmId,
                userId,
                amount: netPaid,
                referenceId: invoice.uuid,
                description: `Salary paid - ${invoice.name} (${invoice.month})`,
            });
        }
        return sendSuccessResponse(res, 201, true, "Salary invoice updated successfully", "salary");
    } catch (error) {
        next(error);
    }
    return false;
}

export default markInvoicePaid;
