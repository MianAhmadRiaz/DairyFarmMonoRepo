import sequelize from "../../config/db.js";
import logger from "../../logger/index.js";
import PurchaseItems from "../../models/purchaseItem.js";
import StockLevel from "../../models/stockLevel.js";
import StockTransactions from "../../models/stockTransactions.js";
import { getUserById } from "../../repo/user.js";
import { ApiError } from "../../utils/ApiError.js";
import { recordStockPurchaseReversal } from "../../utils/finance/financeHooks.js";
import sendSuccessResponse from "../../utils/responses/sendSuccessResponse.js";
import isValidUUID from "../../utils/uuidValidator.js";

const DeletePurchaseItem = async (req, res, next) => {
    const transaction = await sequelize.transaction();
    try {
        const { query: { purchaseId }, userId } = req;
        const user = await getUserById(userId);
        if (!user) throw new ApiError("Unauthorized", 400, "Unauthorized access.", true);
        const { farmId } = user;
        if (!farmId) throw new ApiError("Unauthorized", 400, "Farm not found.", true);
        if (!isValidUUID(purchaseId)) throw new ApiError("Invalid Details", 400, "Please provide a valid Purchase purchaseId.", true);
        const checkItem = await PurchaseItems.findOne({ where: { uuid: purchaseId, farmId, isDeleted: false }, raw: true });
        if (!checkItem) throw new ApiError("Invalid Details", 400, "Purchase Item not found with provided purchaseId", true);

        // Lock the stock row: we must reverse both the quantity AND the
        // weighted-average price contribution of this purchase.
        const stockLevel = await StockLevel.findOne({
            where: { itemId: checkItem.itemId, farmId, isDeleted: false },
            lock: transaction.LOCK.UPDATE,
            transaction,
        });
        if (!stockLevel) throw new ApiError("Invalid Details", 400, "Stock level not found for the purchased item.", true);

        const currentQty = Number(stockLevel.quantity) || 0;
        const currentPrice = Number(stockLevel.price) || 0;
        const purchasedQty = Number(checkItem.quantity) || 0;
        const purchasedCost = Number(checkItem.cost_per_unit) || 0;
        if (currentQty < purchasedQty) {
            throw new ApiError("Invalid Details", 400, `Cannot delete this purchase: ${purchasedQty} units were received but only ${currentQty} remain in stock (some have been consumed).`, true);
        }
        const remainingQty = currentQty - purchasedQty;
        // Remove this purchase's cost layer from the weighted average.
        const remainingValue = (currentQty * currentPrice) - (purchasedQty * purchasedCost);
        const newPrice = remainingQty > 0 ? Math.max(remainingValue / remainingQty, 0) : 0;

        await Promise.all([
            PurchaseItems.update({ isDeleted: true, updatedBy: userId }, { where: { uuid: purchaseId, farmId }, transaction }),
            StockTransactions.update({ isDeleted: true }, { where: { reference: purchaseId, farmId }, transaction }),
            StockLevel.update({ quantity: remainingQty, price: newPrice }, { where: { itemId: checkItem.itemId, farmId }, transaction }),
        ]);
        await transaction.commit();

        // Finance automation: reverse the original purchase expense (non-blocking)
        if (Number(checkItem.total_cost) > 0) {
            await recordStockPurchaseReversal({
                farmId,
                userId,
                amount: Number(checkItem.total_cost),
                referenceId: purchaseId,
                description: `Purchase deleted - ${checkItem.item_name} x${purchasedQty}`,
            });
        }
        return sendSuccessResponse(res, 200, true, "Purchase Item delete successfully.", "Purchase-Item");
    } catch (error) {
        logger.error(`Error in Delete purchaseItem: ${error.message}`);
        await transaction.rollback();
        next(error);
    }
};
export default DeletePurchaseItem;
