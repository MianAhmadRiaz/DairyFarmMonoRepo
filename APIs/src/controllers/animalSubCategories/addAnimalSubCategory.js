import AnimalSubCategories from "../../models/animalSubCategories.js";
import { getUserById } from "../../repo/user.js";
import { ApiError } from "../../utils/ApiError.js";
import sendSuccessResponse from "../../utils/responses/sendSuccessResponse.js";

const AddAnimalSubCategory = async (req, res, next) => {
    try {
        const { body: { name }, userId } = req;
        const user = await getUserById(userId);
        if (!user) throw new ApiError("Unauthorized", 400, "Unauthorized access.", true);
        const { farmId } = user;
        if (!farmId) throw new ApiError("Unauthorized", 400, "Farm not found.", true);
        const checkAnimalSubCategory = await AnimalSubCategories.findOne({ where: { name: name.toLowerCase(), farmId }, raw: true });
        if (checkAnimalSubCategory) throw new ApiError("Invalid Details", 400, "AnimalType with provided name already exist in your list.", true);
        const paylaod = {
            farmId,
            name: name.toLowerCase(),
            createdBy: userId,
            updatedBy: userId,
        }
        const addanimalSubCategory = await AnimalSubCategories.create(paylaod);
        return sendSuccessResponse(res, 200, true, "Animal sub-category add successfully.", "Animal-Sub-category", addanimalSubCategory);
    } catch (error) {
        next(error);
    }
    return AddAnimalSubCategory;
};
export default AddAnimalSubCategory;
