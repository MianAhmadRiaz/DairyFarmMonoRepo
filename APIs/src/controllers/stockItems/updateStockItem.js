import sequelize from "../../config/db.js";
import StockCategories from "../../models/stockCategories.js";
import StockItems from "../../models/stockItem.js";
import StockLevel from "../../models/stockLevel.js";
import UnitsOfMeasure from "../../models/unitsOfMeasures.js";
import { getUserById } from "../../repo/user.js";
import { ApiError } from "../../utils/ApiError.js";
import sendSuccessResponse from "../../utils/responses/sendSuccessResponse.js";

const UpdateStockItem = async (req, res, next) => {
    const transaction = await sequelize.transaction();
    try {
        const { body: { itemId, name, price, categoryId, reorder_level, unitId }, userId } = req;
        const user = await getUserById(userId);
        if (!user) throw new ApiError("Unauthorized", 400, "Unauthorized access.", true);
        const { farmId } = user;
        if (!farmId) throw new ApiError("Unauthorized", 400, "Farm not found.", true);
        const checkItem = await StockItems.findOne({ where: { uuid: itemId, farmId, isDeleted: false }, raw: true });
        if (!checkItem) throw new ApiError("Invalid Details", 400, "Stock Item not found with provided itemId", true);
        const checkItemWithNewName = await StockItems.findOne({ where: { name: name.toLowerCase(), farmId, isDeleted: false }, raw: true });
        if (checkItemWithNewName && checkItemWithNewName.uuid !== itemId) throw new ApiError("Invalid Details", 400, "Stock item with provided name already exist in your list.", true);
        const category = await StockCategories.findOne({ where: { uuid: categoryId, farmId, isDeleted: false }, raw: true });
        if (!category) throw new ApiError("Invalid Details", 400, "Stock category not found with provided categoryId", true);
        const unitOfMeasure = await UnitsOfMeasure.findOne({ where: { uuid: unitId, farmId, isDeleted: false }, raw: true });
        if (!unitOfMeasure) throw new ApiError("Invalid Details", 400, "Unit of measure not found with provided unitId", true);
        const paylaod = {
            name: name.toLowerCase(),
            categoryId,
            category_name: category.name,
            reorder_level,
            unit_of_measure: unitOfMeasure.name,
            unitId,
            updatedBy: userId,
        }
        await StockItems.update(paylaod, { where: { uuid: itemId, farmId }, transaction });

        await StockLevel.update({ price, updatedBy: userId, item_name: name.toLowerCase() }, { where: { farmId, itemId }, transaction });
        await transaction.commit();
        return sendSuccessResponse(res, 200, true, "Stock item updated successfully.", "Stock-category");
    } catch (error) {
        await transaction.rollback();
        next(error);
    }
    return UpdateStockItem;
};
export default UpdateStockItem;
