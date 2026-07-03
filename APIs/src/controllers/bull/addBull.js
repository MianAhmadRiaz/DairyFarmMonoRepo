import Bull from "../../models/bull.js";
import { getUserById } from "../../repo/user.js";
import { ApiError } from "../../utils/ApiError.js";
import sendSuccessResponse from "../../utils/responses/sendSuccessResponse.js";

const AddBull = async (req, res, next) => {
    try {
        const { body: { name }, userId } = req;
        const user = await getUserById(userId);
        if (!user) throw new ApiError("Unauthorized", 400, "Unauthorized access.", true);
        const { farmId } = user;
        if (!farmId) throw new ApiError("Unauthorized", 400, "Farm not found.", true);
        const checkBullWIthName = await Bull.findOne({ where: { farmId, name: name.toLowerCase(), isDeleted: false }, raw: true });
        if (checkBullWIthName) throw new ApiError("Invalid Details", 400, "Bull with provided name already exist.", true);
        const newAnimal = {
            farmId,
            createdBy: userId,
            name: name.toLowerCase()
        }
        const bull = await Bull.create(newAnimal);
        return sendSuccessResponse(res, 200, true, "bull add successfully.", "animal", bull);
    } catch (error) {
        next(error);
    }
    return AddBull;
};
export default AddBull;
