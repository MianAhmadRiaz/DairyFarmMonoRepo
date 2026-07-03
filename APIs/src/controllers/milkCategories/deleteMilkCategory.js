import MilkCategories from "../../models/milkCategories.js";
import MilkOut from "../../models/milkOut.js";
import { getUserById } from "../../repo/user.js";
import { ApiError } from "../../utils/ApiError.js";
import sendSuccessResponse from "../../utils/responses/sendSuccessResponse.js";
import isValidUUID from "../../utils/uuidValidator.js";

const DeleteMilkCategory = async (req, res, next) => {
    try {
        const { query: { categoryId }, userId } = req;
        const user = await getUserById(userId);
        if (!user) throw new ApiError("Unauthorized", 400, "Unauthorized access.", true);
        const { farmId } = user;
        if (!farmId) throw new ApiError("Unauthorized", 400, "Farm not found.", true);
        if (!isValidUUID(categoryId)) throw new ApiError("Invalid Details", 400, "Please provide a valid milk categoryId.", true);
        const checkCategory = await MilkCategories.findOne({ where: { uuid: categoryId, farmId, isDeleted: false }, raw: true });
        if (!checkCategory) throw new ApiError("Invalid Details", 400, "Milk category not found with provided categoryId", true);
        const checkMilkoutItem = await MilkOut.findOne({ where: { categoryId, isDeleted: false }, raw: true });
        if (checkMilkoutItem) throw new ApiError("Invalid Details", 400, "Category is assigned to an milkout item and cannot be deleted.", true);
        await MilkCategories.update({ isDeleted: true }, { where: { uuid: categoryId, farmId } });
        return sendSuccessResponse(res, 200, true, "Milk category delete successfully.", "milk-category");
    } catch (error) {
        next(error);
    }
    return DeleteMilkCategory;
};
export default DeleteMilkCategory;
