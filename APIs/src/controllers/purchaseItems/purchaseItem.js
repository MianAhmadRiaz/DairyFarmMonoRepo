import sequelize from "../../config/db.js";
import { TransactionTypes } from "../../constants/index.js";
import logger from "../../logger/index.js";
import PurchaseItems from "../../models/purchaseItem.js";
import StockLevel from "../../models/stockLevel.js";
import StockTransactions from "../../models/stockTransactions.js";
import Suppliers from "../../models/suppliers.js";
import { getUserById } from "../../repo/user.js";
import { ApiError } from "../../utils/ApiError.js";
import sendSuccessResponse from "../../utils/responses/sendSuccessResponse.js";
import { recordStockPurchase } from "../../utils/finance/financeHooks.js";

const AddPurchaseItem = async (req, res, next) => {
    const transaction = await sequelize.transaction();
    try {
        const { body: { cost_per_unit, supplierId, itemId, quantity, note, date = new Date().toISOString().split("T")[0], is_adjustment = false, batch_number, expiry_date }, userId } = req;
        const user = await getUserById(userId);
        if (!user) throw new ApiError("Unauthorized", 400, "Unauthorized access.", true);
        const { farmId } = user;
        if (!farmId) throw new ApiError("Unauthorized", 400, "Farm not found.", true);
        const qty = Number(quantity);
        const unitCost = Number(cost_per_unit);
        if (!(qty > 0)) throw new ApiError("Invalid Details", 400, "quantity must be a number greater than 0.", true);
        if (!(unitCost >= 0)) throw new ApiError("Invalid Details", 400, "cost_per_unit must be a number >= 0.", true);
        const supplier = await Suppliers.findOne({ where: { uuid: supplierId, farmId, isDeleted: false }, raw: true });
        if (!supplier) throw new ApiError("Invalid Details", 400, "Supplier not found with provided supplierId.", true);
        // Lock the stock-level row for the whole transaction so concurrent
        // purchases/usages can't interleave the read-modify-write below.
        const item = await StockLevel.findOne({
            where: { itemId, farmId, isDeleted: false },
            lock: transaction.LOCK.UPDATE,
            transaction,
        });
        if (!item) throw new ApiError("Invalid Details", 400, "Stock item not found with provided itemId", true);
        const paylaod = {
            farmId,
            quantity: qty,
            supplierId,
            itemId,
            item_name: item.item_name,
            supplier_name: supplier.name,
            cost_per_unit: unitCost,
            date,
            batch_number,
            expiry_date: expiry_date || null,
            total_cost: Number(unitCost * qty),
            createdBy: userId,
            updatedBy: userId,
        }
        const purchaseItem = await PurchaseItems.create(paylaod, { transaction, raw: true });
        const transactionPayload = {
            farmId,
            itemId,
            item_name: item.item_name,
            quantity: qty,
            last_quantity: item.quantity,
            note,
            is_adjustment,
            date,
            price: unitCost,
            reference: purchaseItem.uuid,
            transaction_type: TransactionTypes.PURCHASE,
            createdBy: userId,
            updatedBy: userId,
        }
        const price = Number(item.price) || 0;
        const CurrentQty = Number(item.quantity) || 0;
        const newQuanitity = CurrentQty + qty;
        const newPrice = newQuanitity > 0 ? ((CurrentQty * price) + (qty * unitCost)) / newQuanitity : unitCost;
        await Promise.all([
            StockTransactions.create(transactionPayload, { transaction }),
            StockLevel.update({ quantity: newQuanitity, price: newPrice }, { where: { itemId, farmId }, transaction }),
        ]);
        await transaction.commit();
        // Finance automation: record the purchase as an expense (non-blocking)
        await recordStockPurchase({
            farmId,
            userId,
            amount: paylaod.total_cost,
            referenceId: purchaseItem.uuid,
            description: `Purchase - ${item.item_name} x${quantity}`,
            date,
        });
        return sendSuccessResponse(res, 200, true, "Item purchase add successfully.", "Stock-purchase", purchaseItem);
    } catch (error) {
        logger.error(`Error in add purchaseItem: ${error.message}`);
        await transaction.rollback();
        next(error);
    }
    return AddPurchaseItem;
};
export default AddPurchaseItem;
