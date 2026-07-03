import SalaryAdvance from "../../../models/advanceSalary.js";
import { getUserById } from "../../../repo/user.js";
import { ApiError } from "../../../utils/ApiError.js";
import sendSuccessResponse from "../../../utils/responses/sendSuccessResponse.js";
import isValidUUID from "../../../utils/uuidValidator.js";

const getSalaryAdvance = async (req, res, next) => {
    try {
        const { query: { limit = 10, page = 1, invoiceId, employeeId }, userId } = req;
        const offset = (page - 1) * limit;
        const user = await getUserById(userId);
        if (!user) throw new ApiError("Unauthorized", 400, "Unauthorized access.", true);
        const { farmId } = user;
        if (!farmId) throw new ApiError("Unauthorized", 400, "Farm not found.", true);
        if (isValidUUID(invoiceId)) {
            const salary = await SalaryAdvance.findOne({ where: { uuid: invoiceId, farmId, isDeleted: false }, raw: true });
            if (!salary) throw new ApiError("Invalid Details", 400, "Invoice not found with provided invoiceId", true);
            return sendSuccessResponse(res, 200, true, "Salary invoice fetched successfully.", "salary", salary);
        }
        const where = { farmId, isDeleted: false };
        if (isValidUUID(employeeId)) where.employee_id = employeeId;
        const { count, rows: invoices } = await SalaryAdvance.findAndCountAll({
            where,
            offset,
            limit,
            order: [["createdAt", "DESC"]]
        });
        const totalPages = Math.ceil(count / limit);
        const responseData = {
            invoices,
            page: Number(page),
            totalPages: Number(totalPages),
            limit: Number(limit),
            skip: offset,
            totalCount: Number(count),
        };
        return sendSuccessResponse(res, 200, true, "Salary Advance invoices fetched successfully.", null, responseData);
    } catch (error) {
        next(error);
    }
    return getSalaryAdvance;
};
export default getSalaryAdvance;
