import { TransactionTypes } from "../../constants/index.js";
import StockTransactions from "../../models/stockTransactions.js";
import { getUserById } from "../../repo/user.js";
import { ApiError } from "../../utils/ApiError.js";
import sendSuccessResponse from "../../utils/responses/sendSuccessResponse.js";
import isValidUUID from "../../utils/uuidValidator.js";

const GetStockTransactions = async (req, res, next) => {
    try {
        const { query: { limit = 20, page = 1, transactionId, is_adjustment, transaction_type }, userId } = req;
        const offset = (page - 1) * limit;
        const user = await getUserById(userId);
        if (!user) throw new ApiError("Unauthorized", 400, "Unauthorized access.", true);
        const { farmId } = user;
        if (!farmId) throw new ApiError("Unauthorized", 400, "Farm not found.", true);
        if (isValidUUID(transactionId)) {
            const item = await StockTransactions.findOne({ where: { uuid: transactionId, farmId, isDeleted: false }, raw: true });
            if (!item) throw new ApiError("Invalid Details", 400, "Stock transaction not found with provided transactionId", true);
            return sendSuccessResponse(res, 200, true, "Stock transaction fetched successfully.", "Stock-transactions", item);
        }
        const where = { isDeleted: false, farmId };
    if (transaction_type && Object.values(TransactionTypes).includes(transaction_type)) where.transaction_type = transaction_type; 
        const onlyAdjustment = is_adjustment === "true";
        if (onlyAdjustment) where.is_adjustment = true;
        const { count, rows: transactions } = await StockTransactions.findAndCountAll({
            where,
            offset,
            limit,
            order: [["createdAt", "DESC"]],
        });

        const totalPages = Math.ceil(count / limit);
        const responseData = {
            transactions,
            page: Number(page),
            totalPages: Number(totalPages),
            limit: Number(limit),
            skip: offset,
            totalCount: Number(count),
        };
        return sendSuccessResponse(res, 200, true, "Stock transactions fetched successfully.", "stock-transactions", responseData);
    } catch (error) {
        next(error);
    }
    return GetStockTransactions;
};
export default GetStockTransactions;
