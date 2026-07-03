import Pen from "../../models/pen.js";
import { getUserById } from "../../repo/user.js";
import { ApiError } from "../../utils/ApiError.js";
import sendSuccessResponse from "../../utils/responses/sendSuccessResponse.js";

const AddPen = async (req, res, next) => {
    try {
        const { body: { name }, userId } = req;
        const user = await getUserById(userId);
        if (!user) throw new ApiError("Unauthorized", 400, "Unauthorized access.", true);
        const { farmId } = user;
        if (!farmId) throw new ApiError("Unauthorized", 400, "Farm not found.", true);
        const checkPen = await Pen.findOne({ where: { name: name.toLowerCase(), farmId }, raw: true });
        if (checkPen) throw new ApiError("Invalid Details", 400, "Pen with provided name already exist in your list.", true);
        const paylaod = {
            farmId,
            name: name.toLowerCase(),
            createdBy: userId,
            updatedBy: userId,
        }
        const AddPen = await Pen.create(paylaod);
        return sendSuccessResponse(res, 200, true, "Pen add successfully.", "Pen", AddPen);
    } catch (error) {
        next(error);
    }
    return AddPen;
};
export default AddPen;
