import sequelize from "../../config/db.js";
import StockItems from "../../models/stockItem.js";
import StockLevel from "../../models/stockLevel.js";
import { getUserById } from "../../repo/user.js";
import { ApiError } from "../../utils/ApiError.js";
import sendSuccessResponse from "../../utils/responses/sendSuccessResponse.js";
import isValidUUID from "../../utils/uuidValidator.js";

const DeleteStockItem = async (req, res, next) => {
    let transaction;
    try {
        const { query: { itemId }, userId } = req;
        const user = await getUserById(userId);
        if (!user) throw new ApiError("Unauthorized", 400, "Unauthorized access.", true);
        const { farmId } = user;
        if (!farmId) throw new ApiError("Unauthorized", 400, "Farm not found.", true);
        if (!isValidUUID(itemId)) throw new ApiError("Invalid Details", 400, "Please provide a valid stock itemId.", true);
        const checkItem = await StockItems.findOne({ where: { uuid: itemId, farmId, isDeleted: false }, raw: true });
        if (!checkItem) throw new ApiError("Invalid Details", 400, "Stock Item not found with provided itemId", true);

        // Refuse to delete an item that still has stock on hand — force an
        // explicit adjustment first so inventory value never silently vanishes.
        const stockLevel = await StockLevel.findOne({ where: { itemId, farmId, isDeleted: false }, raw: true });
        if (stockLevel && Number(stockLevel.quantity) > 0) {
            throw new ApiError("Invalid Details", 400, `Cannot delete ${checkItem.name}: ${stockLevel.quantity} units still in stock. Record a usage/adjustment to zero the stock first.`, true);
        }

        transaction = await sequelize.transaction();
        await StockItems.update({ isDeleted: true, updatedBy: userId }, { where: { uuid: itemId, farmId }, transaction });
        if (stockLevel) {
            await StockLevel.update({ isDeleted: true }, { where: { itemId, farmId }, transaction });
        }
        await transaction.commit();
        return sendSuccessResponse(res, 200, true, "Stock Item delete successfully.", "stock-Item");
    } catch (error) {
        if (transaction) await transaction.rollback();
        next(error);
    }
};
export default DeleteStockItem;
