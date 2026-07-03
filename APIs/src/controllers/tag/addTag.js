import Tag from "../../models/tag.js";
import { getUserById } from "../../repo/user.js";
import { ApiError } from "../../utils/ApiError.js";
import sendSuccessResponse from "../../utils/responses/sendSuccessResponse.js";

const AddTag = async (req, res, next) => {
    try {
        const { body: { name }, userId } = req;
        const user = await getUserById(userId);
        if (!user) throw new ApiError("Unauthorized", 400, "Unauthorized access.", true);
        const { farmId } = user;
        if (!farmId) throw new ApiError("Unauthorized", 400, "Farm not found.", true);
        const checkTag = await Tag.findOne({ where: { name: name.toLowerCase(), farmId }, raw: true });
        if (checkTag) throw new ApiError("Invalid Details", 400, "Tag with provided name already exist in your list.", true);
        const paylaod = {
            farmId,
            name: name.toLowerCase(),
            createdBy: userId,
            updatedBy: userId,
        }
        const addTag = await Tag.create(paylaod);
        return sendSuccessResponse(res, 200, true, "Tag add successfully.", "Tag", addTag);
    } catch (error) {
        next(error);
    }
    return AddTag;
};
export default AddTag;
