import MedicineCategories from "../../models/medicineSubCategories.js";
import { getUserById } from "../../repo/user.js";
import { ApiError } from "../../utils/ApiError.js";
import sendSuccessResponse from "../../utils/responses/sendSuccessResponse.js";

const CreateMedicineCategory = async (req, res, next) => {
    try {
        const { body: { name, description }, userId } = req;
        const user = await getUserById(userId);
        if (!user) throw new ApiError("Unauthorized", 400, "Unauthorized access.", true);
        const { farmId } = user;
        if (!farmId) throw new ApiError("Unauthorized", 400, "Farm not found.", true);
        const checkCategory = await MedicineCategories.findOne({ where: { name: name.toLowerCase(), farmId, isDeleted: false }, raw: true });
        if (checkCategory) throw new ApiError("Invalid Details", 400, "Medicine Category with provided name already exist in your list.", true);
        const paylaod = {
            farmId,
            name: name.toLowerCase(),
            description,
            createdBy: userId,
            updatedBy: userId,
        }
        const createStockCategory = await MedicineCategories.create(paylaod);
        return sendSuccessResponse(res, 200, true, "Medicine Category add successfully.", "medicine-category", createStockCategory);
    } catch (error) {
        next(error);
    }
    return CreateMedicineCategory;
};
export default CreateMedicineCategory;
