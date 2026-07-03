import Animal from "../../models/animal.js";
import Pen from "../../models/pen.js";
import { getUserById } from "../../repo/user.js";
import { ApiError } from "../../utils/ApiError.js";
import sendSuccessResponse from "../../utils/responses/sendSuccessResponse.js";
import isValidUUID from "../../utils/uuidValidator.js";

const DeletePen = async (req, res, next) => {
    try {
        const { query: { penId }, userId } = req;
        const user = await getUserById(userId);
        if (!user) throw new ApiError("Unauthorized", 400, "Unauthorized access.", true);
        const { farmId } = user;
        if (!farmId) throw new ApiError("Unauthorized", 400, "Farm not found.", true);
        if (!isValidUUID(penId)) throw new ApiError("Invalid Details", 400, "Please provide a valid penId.", true);
        const checkpen = await Pen.findOne({ where: { uuid: penId, farmId, isDeleted: false }, raw: true });
        if (!checkpen) throw new ApiError("Invalid Details", 400, "pen not found with provided penId", true);
        const checkAnimal = await Animal.findOne({ where: { penId, farmId, isDeleted: false }, raw: true });
        if (checkAnimal) throw new ApiError("Invalid Details", 400, "pen is assigned to animals and cannot be deleted.", true);
        await Pen.update({ isDeleted: true }, { where: { uuid: penId, farmId } });
        return sendSuccessResponse(res, 200, true, "pen delete successfully.", "pen");
    } catch (error) {
        next(error);
    }
    return DeletePen;
};
export default DeletePen;
