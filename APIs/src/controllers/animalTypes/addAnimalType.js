import AnimalTypes from "../../models/animalTypes.js";
import { getUserById } from "../../repo/user.js";
import { ApiError } from "../../utils/ApiError.js";
import sendSuccessResponse from "../../utils/responses/sendSuccessResponse.js";

const AddAnimalType = async (req, res, next) => {
    try {
        const { body: { name }, userId } = req;
        const user = await getUserById(userId);
        if (!user) throw new ApiError("Unauthorized", 400, "Unauthorized access.", true);
        const { farmId } = user;
        if (!farmId) throw new ApiError("Unauthorized", 400, "Farm not found.", true);
        const checkAnimalType = await AnimalTypes.findOne({ where: { name: name.toLowerCase(), farmId }, raw: true });
        if (checkAnimalType) throw new ApiError("Invalid Details", 400, "AnimalType with provided name already exist in your list.", true);
        const paylaod = {
            farmId,
            name: name.toLowerCase(),
            createdBy: userId,
            updatedBy: userId,
        }
        const addanimalType = await AnimalTypes.create(paylaod);
        return sendSuccessResponse(res, 200, true, "AnimalType add successfully.", "AnimalType", addanimalType);
    } catch (error) {
        next(error);
    }
    return AddAnimalType;
};
export default AddAnimalType;
