import { DefaultStockCategories } from "../../constants/index.js";
import StockCategories from "../../models/stockCategories.js";
import StockItems from "../../models/stockItem.js";
import { getUserById } from "../../repo/user.js";
import { ApiError } from "../../utils/ApiError.js";
import sendSuccessResponse from "../../utils/responses/sendSuccessResponse.js";
import isValidUUID from "../../utils/uuidValidator.js";

const DeleteCategory = async (req, res, next) => {
    try {
        const { query: { categoryId }, userId } = req;
        const user = await getUserById(userId);
        if (!user) throw new ApiError("Unauthorized", 400, "Unauthorized access.", true);
        const { farmId } = user;
        if (!farmId) throw new ApiError("Unauthorized", 400, "Farm not found.", true);
        if (!isValidUUID(categoryId)) throw new ApiError("Invalid Details", 400, "Please provide a valid stock categoryId.", true);
        const checkCategory = await StockCategories.findOne({ where: { uuid: categoryId, farmId, isDeleted: false }, raw: true });
        if (!checkCategory) throw new ApiError("Invalid Details", 400, "Stock category not found with provided categoryId", true);
        if (Object.values(DefaultStockCategories).includes(checkCategory.name)) throw new ApiError("Invalid Details", 400, `Default categories can not be deleted. [${Object.values(DefaultStockCategories)}]`, true);
        const checkStockItem = await StockItems.findOne({ where: { categoryId, farmId, isDeleted: false }, raw: true });
        if (checkStockItem) throw new ApiError("Invalid Details", 400, "Category is assigned to an stock item and cannot be deleted.", true);
        await StockCategories.update({ isDeleted: true }, { where: { uuid: categoryId, farmId } });
        return sendSuccessResponse(res, 200, true, "Stock category delete successfully.", "stock-category");
    } catch (error) {
        next(error);
    }
    return DeleteCategory;
};
export default DeleteCategory;
