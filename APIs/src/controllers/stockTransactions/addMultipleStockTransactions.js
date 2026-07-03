import sequelize from "../../config/db.js";
import { TransactionTypes } from "../../constants/index.js";
import logger from "../../logger/index.js";
import StockLevel from "../../models/stockLevel.js";
import StockTransactions from "../../models/stockTransactions.js";
import { getUserById } from "../../repo/user.js";
import { ApiError } from "../../utils/ApiError.js";
import sendSuccessResponse from "../../utils/responses/sendSuccessResponse.js";

const AddMultipleStockTransactions = async (req, res, next) => {
    const transaction = await sequelize.transaction();
    try {
        const { body: { items, date = new Date().toISOString().split("T")[0] }, userId } = req;
        const user = await getUserById(userId);
        if (!user) throw new ApiError("Unauthorized", 400, "Unauthorized access.", true);
        const { farmId } = user;
        if (!farmId) throw new ApiError("Unauthorized", 400, "Farm not found.", true);
        const stockTransactions = [];
        await Promise.all(
            items.map(async (item) => {
                const { itemId, quantity } = item;
                const stockItem = await StockLevel.findOne({ where: { itemId, farmId, isDeleted: false }, raw: true });
                if (!stockItem) throw new ApiError("Invalid Details", 400, "Stock item not found that include in feed formulation.", true);
                const stockUsage = parseFloat(quantity);
                if (stockItem.quantity < stockUsage) throw new ApiError("Invalid Details", 400, `Insufficient quantity for ${stockItem.item_name}. Available: ${stockItem.quantity}, Required: ${stockUsage}.`, true);

                const transactionPayload = {
                    farmId,
                    itemId,
                    item_name: stockItem.item_name,
                    last_quantity: stockItem.quantity,
                    price: stockItem.price || 0,
                    quantity: stockUsage,
                    date,
                    transaction_type: TransactionTypes.USAGE,
                    createdBy: userId,
                    updatedBy: userId,
                }
                stockTransactions.push(transactionPayload);
                await StockLevel.decrement({ quantity: stockUsage }, { where: { itemId, farmId }, transaction });
            })
        );
        await StockTransactions.bulkCreate(stockTransactions, { transaction })
        await transaction.commit();
        return sendSuccessResponse(res, 200, true, "Stock transactions add successfully.", "Stock-transaction");
    } catch (error) {
        logger.error(`Error in add stockTransaction: ${error.message}`);
        await transaction.rollback();
        next(error);
    }
    return AddMultipleStockTransactions;
};
export default AddMultipleStockTransactions;
