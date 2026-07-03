import { getUserById } from "../../../repo/user.js";
import { ApiError } from "../../../utils/ApiError.js";
import sendSuccessResponse from "../../../utils/responses/sendSuccessResponse.js";
import isValidUUID from "../../../utils/uuidValidator.js";
import SalaryInvoice from "../../../models/salaryInvoice.js";

async function deleteInvoice(req, res, next) {
    try {
        const { query: { invoiceId: uuid }, userId } = req;
        if (!isValidUUID(uuid)) throw new ApiError("Invalid Credentials", 400, "Please provide a valid invoiceId", true);
        const user = await getUserById(userId);
        if (!user) throw new ApiError("Unauthorized", 400, "Unauthorized access.", true);
        const { farmId } = user;
        if (!farmId) throw new ApiError("Unauthorized", 400, "Farm not found.", true);
        const invoice = await SalaryInvoice.findOne({ where: { uuid, farmId, isDeleted: false } });
        if (!invoice) throw new ApiError("Invalid Details", 400, "Salary invoice with provided uuid is not found.", true);
        const dataToUpdate = {
            isDeleted: true
        };
        await SalaryInvoice.update(dataToUpdate, { where: { uuid } });
        return sendSuccessResponse(res, 201, true, "Salary invoice deleted successfully", "salary");
    } catch (error) {
        next(error);
    }
    return false;
}

export default deleteInvoice;
