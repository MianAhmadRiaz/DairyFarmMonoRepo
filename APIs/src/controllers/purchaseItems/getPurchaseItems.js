import PurchaseItems from "../../models/purchaseItem.js";
import { getUserById } from "../../repo/user.js";
import { ApiError } from "../../utils/ApiError.js";
import sendSuccessResponse from "../../utils/responses/sendSuccessResponse.js";
import isValidUUID from "../../utils/uuidValidator.js";

const GetPurchaseItems = async (req, res, next) => {
    try {
        const { query: { limit = 20, page = 1, purchaseId, supplierId }, userId } = req;
        const offset = (page - 1) * limit;
        const user = await getUserById(userId);
        if (!user) throw new ApiError("Unauthorized", 400, "Unauthorized access.", true);
        const { farmId } = user;
        if (!farmId) throw new ApiError("Unauthorized", 400, "Farm not found.", true);
        if (isValidUUID(purchaseId)) {
            const item = await PurchaseItems.findOne({ where: { uuid: purchaseId, farmId, isDeleted: false }, raw: true });
            if (!item) throw new ApiError("Invalid Details", 400, "Purchase item not found with provided purchaseId", true);
            return sendSuccessResponse(res, 200, true, "Purchase item fetched successfully.", "Purchase-item", item);
        }
        const where = { isDeleted: false, farmId };
        if (isValidUUID(supplierId)) where.supplierId = supplierId;
        const { count, rows: items } = await PurchaseItems.findAndCountAll({
            where,
            offset,
            limit,
            order: [["createdAt", "DESC"]],
        });

        const totalPages = Math.ceil(count / limit);
        const responseData = {
            items,
            page: Number(page),
            totalPages: Number(totalPages),
            limit: Number(limit),
            skip: offset,
            totalCount: Number(count),
        };
        return sendSuccessResponse(res, 200, true, "Purchase items fetched successfully.", "purchase-item", responseData);
    } catch (error) {
        next(error);
    }
    return GetPurchaseItems;
};
export default GetPurchaseItems;
