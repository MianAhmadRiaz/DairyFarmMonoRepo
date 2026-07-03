import UnitsOfMeasure from "../../models/unitsOfMeasures.js";
import { getUserById } from "../../repo/user.js";
import { ApiError } from "../../utils/ApiError.js";
import sendSuccessResponse from "../../utils/responses/sendSuccessResponse.js";

const AddUnitOfMeasure = async (req, res, next) => {
    try {
        const { body: { name }, userId } = req;
        const user = await getUserById(userId);
        if (!user) throw new ApiError("Unauthorized", 400, "Unauthorized access.", true);
        const { farmId } = user;
        if (!farmId) throw new ApiError("Unauthorized", 400, "Farm not found.", true);
        if (!name) throw new ApiError("Invalid Details", 400, "name is required.", true);
        const checkunit = await UnitsOfMeasure.findOne({ where: { name: name.toLowerCase(), farmId, isDeleted: false }, raw: true });
        if (checkunit) throw new ApiError("Invalid Details", 400, "Unit of measure with provided name already exist in your list.", true);
        const paylaod = {
            farmId,
            name: name.toLowerCase(),
        }
        const createUnit = await UnitsOfMeasure.create(paylaod, { raw: true });
        return sendSuccessResponse(res, 200, true, "Unit of measure add successfully.", "unitOfMeasure", createUnit);
    } catch (error) {
        next(error);
    }
    return AddUnitOfMeasure;
};
export default AddUnitOfMeasure;
