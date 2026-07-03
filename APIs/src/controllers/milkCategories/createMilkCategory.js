import MilkCategories from "../../models/milkCategories.js";
import { getUserById } from "../../repo/user.js";
import { ApiError } from "../../utils/ApiError.js";
import sendSuccessResponse from "../../utils/responses/sendSuccessResponse.js";

const CreateMilkCategory = async (req, res, next) => {
    try {
        const { body: { name }, userId } = req;
        const user = await getUserById(userId);
        if (!user) throw new ApiError("Unauthorized", 400, "Unauthorized access.", true);
        const { farmId } = user;
        if (!farmId) throw new ApiError("Unauthorized", 400, "Farm not found.", true);
        if (!name?.trim()) throw new ApiError("Unauthorized", 400, "name is required.", true);
        const checkCategory = await MilkCategories.findOne({ where: { name: `${name.trim().toLowerCase()} session 1`, farmId, isDeleted: false }, raw: true });
        if (checkCategory) throw new ApiError("Invalid Details", 400, "Milk Category with provided name already exist in your list.", true);
        const categoriesArray = [
            {
                farmId,
                name: `${name.trim().toLowerCase()} session 1`,
                createdBy: userId,
                updatedBy: userId,
            },
            {
                farmId,
                name: `${name.trim().toLowerCase()} session 2`,
                createdBy: userId,
                updatedBy: userId,
            },
            {
                farmId,
                name: `${name.trim().toLowerCase()} session 3`,
                createdBy: userId,
                updatedBy: userId,
            },
        ]
        const createMilkCategories = await MilkCategories.bulkCreate(categoriesArray);
        const finalResponse = {
            categories: createMilkCategories
        }
        return sendSuccessResponse(res, 200, true, "Milk Categories add successfully.", "milk-category", finalResponse);
    } catch (error) {
        next(error);
    }
    return CreateMilkCategory;
};
export default CreateMilkCategory;
