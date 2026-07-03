import { DefaultStockCategories } from "../../constants/index.js";
import MedicineCategories from "../../models/medicineSubCategories.js";
import StockCategories from "../../models/stockCategories.js";
import StockItems from "../../models/stockItem.js";
import StockLevel from "../../models/stockLevel.js";
import UnitsOfMeasure from "../../models/unitsOfMeasures.js";
import { getUserById } from "../../repo/user.js";
import { ApiError } from "../../utils/ApiError.js";
import sendSuccessResponse from "../../utils/responses/sendSuccessResponse.js";

const CreateStockItem = async (req, res, next) => {
    try {
        const { body: { name, description, categoryId, sub_categoryId, reorder_level, unitId }, userId } = req;
        const user = await getUserById(userId);
        if (!user) throw new ApiError("Unauthorized", 400, "Unauthorized access.", true);
        const { farmId } = user;
        if (!farmId) throw new ApiError("Unauthorized", 400, "Farm not found.", true);
        const checkItem = await StockItems.findOne({ where: { name: name.toLowerCase(), farmId, isDeleted: false }, raw: true });
        if (checkItem) throw new ApiError("Invalid Details", 400, "Stock item with provided name already exist in your list.", true);
        const category = await StockCategories.findOne({ where: { uuid: categoryId, farmId, isDeleted: false }, raw: true });
        if (!category) throw new ApiError("Invalid Details", 400, "Stock category not found with provided categoryId", true);
        let sub_category_name;
        if (category.name === DefaultStockCategories.Medicine) {
            if (!sub_categoryId) throw new ApiError("Invalid Details", 400, "Please select a sub-category for the medicine stock item.", true);
            const category = await MedicineCategories.findOne({ where: { uuid: sub_categoryId, farmId, isDeleted: false }, raw: true });
            if (!category) throw new ApiError("Invalid Details", 400, "Medicine category not found with provided sub_categoryId", true);
            sub_category_name = category.name;
        }
        const unitOfMeasure = await UnitsOfMeasure.findOne({ where: { uuid: unitId, farmId, isDeleted: false }, raw: true });
        if (!unitOfMeasure) throw new ApiError("Invalid Details", 400, "Unit of measure not found with provided unitId", true);
        const paylaod = {
            farmId,
            name: name.toLowerCase(),
            description,
            categoryId,
            category_name: category.name,
            reorder_level,
            sub_category_name,
            sub_categoryId,
            unit_of_measure: unitOfMeasure.name,
            unitId,
            createdBy: userId,
            updatedBy: userId,
        }
        const createStockItem = await StockItems.create(paylaod, { raw: true });
        const stockLevelPayload = {
            farmId,
            itemId: createStockItem.uuid,
            item_name: createStockItem.name,
            createdBy: userId,
            updatedBy: userId,
        }
        await StockLevel.create(stockLevelPayload);
        return sendSuccessResponse(res, 200, true, "Stock Category add successfully.", "Stock-category", createStockItem);
    } catch (error) {
        next(error);
    }
    return CreateStockItem;
};
export default CreateStockItem;
