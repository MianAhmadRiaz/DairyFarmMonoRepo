import Animal from "../../models/animal.js";
import Tag from "../../models/tag.js";
import { getUserById } from "../../repo/user.js";
import { ApiError } from "../../utils/ApiError.js";
import sendSuccessResponse from "../../utils/responses/sendSuccessResponse.js";
import isValidUUID from "../../utils/uuidValidator.js";

const DeleteTag = async (req, res, next) => {
    try {
        const { query: { tagId }, userId } = req;
        const user = await getUserById(userId);
        if (!user) throw new ApiError("Unauthorized", 400, "Unauthorized access.", true);
        const { farmId } = user;
        if (!farmId) throw new ApiError("Unauthorized", 400, "Farm not found.", true);
        if (!isValidUUID(tagId)) throw new ApiError("Invalid Details", 400, "Please provide a valid tagId.", true);
        const checkTag = await Tag.findOne({ where: { uuid: tagId, isDeleted: false }, raw: true });
        if (!checkTag) throw new ApiError("Invalid Details", 400, "Tag not found with provided tagId", true);
        const checkAnimal = await Animal.findOne({ where: { tagId, isDeleted: false }, raw: true });
        if (checkAnimal) throw new ApiError("Invalid Details", 400, "Tag is assigned to an animal and cannot be deleted.", true);
        await Tag.update({ isDeleted: true }, { where: { uuid: tagId } });
        return sendSuccessResponse(res, 200, true, "Tag delete successfully.", "tag");
    } catch (error) {
        next(error);
    }
    return DeleteTag;
};
export default DeleteTag;
