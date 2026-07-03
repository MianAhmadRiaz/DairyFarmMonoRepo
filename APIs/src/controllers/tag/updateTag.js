import { Op } from "sequelize";
import Animal from "../../models/animal.js";
import Tag from "../../models/tag.js";
import { getUserById } from "../../repo/user.js";
import { ApiError } from "../../utils/ApiError.js";
import sendSuccessResponse from "../../utils/responses/sendSuccessResponse.js";
import isValidUUID from "../../utils/uuidValidator.js";

const UpdateTag = async (req, res, next) => {
    try {
        const { query: { tagId, name }, userId } = req;
        const user = await getUserById(userId);
        if (!user) throw new ApiError("Unauthorized", 400, "Unauthorized access.", true);
        const { farmId } = user;
        if (!farmId) throw new ApiError("Unauthorized", 400, "Farm not found.", true);
        if (!isValidUUID(tagId)) throw new ApiError("Invalid Details", 400, "Please provide a valid tagId.", true);
        if (!name) throw new ApiError("Invalid Details", 400, "Please provide a name to update.", true);
        const checkTag = await Tag.findOne({ where: { uuid: tagId, isDeleted: false }, raw: true });
        if (!checkTag) throw new ApiError("Invalid Details", 400, "Tag not found with provided tagId", true);
        if (name.toLowerCase() === checkTag.name) throw new ApiError("Invalid Details", 400, "You provided the same name for update tag.", true);
        const checkTagWithNewName = await Tag.findOne({ where: { uuid: { [Op.ne]: tagId }, name: name.toLowerCase(), isDeleted: false }, raw: true });
        if (checkTagWithNewName) throw new ApiError("Invalid Details", 400, "Tag already exist with provided name", true);
        const checkAnimal = await Animal.findOne({ where: { tagId }, raw: true });
        if (checkAnimal) await Animal.update({ tagName: name }, { where: { tagId } });
        await Tag.update({ name: name.toLowerCase(), updatedBy: userId }, { where: { uuid: tagId } });
        return sendSuccessResponse(res, 200, true, "Tag update successfully.", "tag");
    } catch (error) {
        next(error);
    }
    return UpdateTag;
};
export default UpdateTag;
