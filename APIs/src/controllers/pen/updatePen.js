import { Op } from "sequelize";
import { getUserById } from "../../repo/user.js";
import { ApiError } from "../../utils/ApiError.js";
import sendSuccessResponse from "../../utils/responses/sendSuccessResponse.js";
import isValidUUID from "../../utils/uuidValidator.js";
import Pen from "../../models/pen.js";

const UpdatePen = async (req, res, next) => {
    try {
        const { query: { penId, name }, userId } = req;
        const user = await getUserById(userId);
        if (!user) throw new ApiError("Unauthorized", 400, "Unauthorized access.", true);
        const { farmId } = user;
        if (!farmId) throw new ApiError("Unauthorized", 400, "Farm not found.", true);
        if (!isValidUUID(penId)) throw new ApiError("Invalid Details", 400, "Please provide a valid penId.", true);
        if (!name) throw new ApiError("Invalid Details", 400, "Please provide a name to update.", true);
        const checkpen = await Pen.findOne({ where: { uuid: penId, isDeleted: false }, raw: true });
        if (!checkpen) throw new ApiError("Invalid Details", 400, "pen not found with provided penId", true);
        if (name.toLowerCase() === checkpen.name) throw new ApiError("Invalid Details", 400, "You provided the same name for update pen.", true);
        const checkpenWithNewName = await Pen.findOne({ where: { uuid: { [Op.ne]: penId }, name: name.toLowerCase(), isDeleted: false }, raw: true });
        if (checkpenWithNewName) throw new ApiError("Invalid Details", 400, "pen already exist with provided name", true);
        await Pen.update({ name: name.toLowerCase(), updatedBy: userId }, { where: { uuid: penId } });
        return sendSuccessResponse(res, 200, true, "pen update successfully.", "pen");
    } catch (error) {
        next(error);
    }
    return UpdatePen;
};
export default UpdatePen;
