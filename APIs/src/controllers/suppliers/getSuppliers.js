import Suppliers from "../../models/suppliers.js";
import { getUserById } from "../../repo/user.js";
import { ApiError } from "../../utils/ApiError.js";
import sendSuccessResponse from "../../utils/responses/sendSuccessResponse.js";
import isValidUUID from "../../utils/uuidValidator.js";

const GetSuppliers = async (req, res, next) => {
    try {
        const { query: { limit = 20, page = 1, supplierId }, userId } = req;
        const offset = (page - 1) * limit;
        const user = await getUserById(userId);
        if (!user) throw new ApiError("Unauthorized", 400, "Unauthorized access.", true);
        const { farmId } = user;
        if (!farmId) throw new ApiError("Unauthorized", 400, "Farm not found.", true);
        if (isValidUUID(supplierId)) {
            const supplier = await Suppliers.findOne({ where: { uuid: supplierId, farmId, isDeleted: false }, raw: true });
            if (!supplier) throw new ApiError("Invalid Details", 400, "Supplier not found with provided supplierId.", true);
            return sendSuccessResponse(res, 200, true, "Supplier fetched successfully.", "supplier", supplier);
        }
        const where = { isDeleted: false, farmId };
        const { count, rows: suppliers } = await Suppliers.findAndCountAll({
            where,
            offset,
            limit,
            order: [["createdAt", "DESC"]],
        });

        const totalPages = Math.ceil(count / limit);
        const responseData = {
            suppliers,
            page: Number(page),
            totalPages: Number(totalPages),
            limit: Number(limit),
            skip: offset,
            totalCount: Number(count),
        };
        return sendSuccessResponse(res, 200, true, "Suppliers fetched successfully.", "suppliers", responseData);
    } catch (error) {
        next(error);
    }
    return GetSuppliers;
};
export default GetSuppliers;
