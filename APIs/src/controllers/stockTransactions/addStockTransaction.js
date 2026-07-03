import sequelize from "../../config/db.js";
import { TransactionTypes } from "../../constants/index.js";
import logger from "../../logger/index.js";
import StockItems from "../../models/stockItem.js";
import StockLevel from "../../models/stockLevel.js";
import StockTransactions from "../../models/stockTransactions.js";
import { getUserById } from "../../repo/user.js";
import { ApiError } from "../../utils/ApiError.js";
import sendSuccessResponse from "../../utils/responses/sendSuccessResponse.js";

const AddStockTransaction = async (req, res, next) => {
    const transaction = await sequelize.transaction();
    try {
        const { body: { itemId, quantity, note, transaction_type = TransactionTypes.PURCHASE, date = new Date().toISOString().split("T")[0] }, userId } = req;
        const user = await getUserById(userId);
        if (!user) throw new ApiError("Unauthorized", 400, "Unauthorized access.", true);
        const { farmId } = user;
        if (!farmId) throw new ApiError("Unauthorized", 400, "Farm not found.", true);
        const include = [
            {
                model: StockLevel,
                as: "stockLevel",
                attributes: ["uuid", "quantity", "price"],
                required: false,
            },
        ];
        const item = await StockItems.findOne({ where: { uuid: itemId, farmId, isDeleted: false }, include, raw: true });
        if (!item) throw new ApiError("Invalid Details", 400, "Stock item not found with provided itemId", true);
        const { "stockLevel.quantity": stockQuantity, "stockLevel.price": price } = item;
        const qty = Number(quantity);
        if (!(qty > 0)) throw new ApiError("Invalid Details", 400, "quantity must be a number greater than 0.", true);
        const isOutgoing = transaction_type !== TransactionTypes.PURCHASE;
        if (isOutgoing && Number(stockQuantity) < qty) {
            throw new ApiError("Invalid Details", 400, `Insufficient stock for ${item.name}. Available: ${stockQuantity}, requested: ${qty}.`, true);
        }
        const transactionPayload = {
            farmId,
            itemId,
            item_name: item.name,
            quantity: qty,
            last_quantity: stockQuantity,
            price: price || 0,
            note,
            is_adjustment: true,
            date,
            transaction_type,
            createdBy: userId,
            updatedBy: userId,
        }
        const value = isOutgoing ? -qty : qty;
        const [newTransaction] = await Promise.all([
            StockTransactions.create(transactionPayload, { transaction, raw: true }),
            StockLevel.increment({ quantity: value }, { where: { itemId, farmId }, transaction }),
        ]);
        await transaction.commit();
        return sendSuccessResponse(res, 200, true, "Stock transaction add successfully.", "Stock-transaction", newTransaction);
    } catch (error) {
        logger.error(`Error in add stockTransaction: ${error.message}`);
        await transaction.rollback();
        next(error);
    }
    return AddStockTransaction;
};
export default AddStockTransaction;
