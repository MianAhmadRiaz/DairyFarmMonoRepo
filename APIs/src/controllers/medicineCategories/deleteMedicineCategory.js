import MedicineCategories from "../../models/medicineSubCategories.js";
import StockItems from "../../models/stockItem.js";
import { getUserById } from "../../repo/user.js";
import { ApiError } from "../../utils/ApiError.js";
import sendSuccessResponse from "../../utils/responses/sendSuccessResponse.js";
import isValidUUID from "../../utils/uuidValidator.js";

const DeleteMedicineCategory = async (req, res, next) => {
    try {
        const { query: { categoryId }, userId } = req;
        const user = await getUserById(userId);
        if (!user) throw new ApiError("Unauthorized", 400, "Unauthorized access.", true);
        const { farmId } = user;
        if (!farmId) throw new ApiError("Unauthorized", 400, "Farm not found.", true);
        if (!isValidUUID(categoryId)) throw new ApiError("Invalid Details", 400, "Please provide a valid medicine categoryId.", true);
        const checkCategory = await MedicineCategories.findOne({ where: { uuid: categoryId, farmId, isDeleted: false }, raw: true });
        if (!checkCategory) throw new ApiError("Invalid Details", 400, "Medicine category not found with provided categoryId", true);
        const checkStockItem = await StockItems.findOne({ where: { sub_categoryId: categoryId, farmId, isDeleted: false }, raw: true });
        if (checkStockItem) throw new ApiError("Invalid Details", 400, "Category is assigned to an stock item and cannot be deleted.", true);
        await MedicineCategories.update({ isDeleted: true }, { where: { uuid: categoryId, farmId } });
        return sendSuccessResponse(res, 200, true, "Medicine category delete successfully.", "medicine-category");
    } catch (error) {
        next(error);
    }
    return DeleteMedicineCategory;
};
export default DeleteMedicineCategory;
