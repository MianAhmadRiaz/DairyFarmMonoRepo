import sequelize from "../../config/db.js";
import Animal from "../../models/animal.js";
import Tag from "../../models/tag.js";
import TagHistory from "../../models/tagHistory.js";
import { getUserById } from "../../repo/user.js";
import { ApiError } from "../../utils/ApiError.js";
import sendSuccessResponse from "../../utils/responses/sendSuccessResponse.js";

const ReplaceTag = async (req, res, next) => {
    let transaction;
    try {
        const { body: { oldTagId, newTagId, animalId, date, }, userId } = req;
        const user = await getUserById(userId);
        if (!user) throw new ApiError("Unauthorized", 400, "Unauthorized access.", true);
        const { farmId } = user;
        if (!farmId) throw new ApiError("Unauthorized", 400, "Farm not found.", true);
        const [oldTag, newTag, animalWithOldTag, animalWithNewTag] = await Promise.all([
            Tag.findOne({ where: { uuid: oldTagId, farmId }, raw: true }),
            Tag.findOne({ where: { uuid: newTagId, farmId }, raw: true }),
            Animal.findOne({ where: { uuid: animalId, tagId: oldTagId, farmId, isDeleted: false }, raw: true }),
            Animal.findOne({ where: { tagId: newTagId, farmId, isDeleted: false }, raw: true }),
        ]);

        if (!oldTag) throw new ApiError("Invalid Details", 400, "Old TagId does not exist. Please provide a valid tagId.", true);
        if (!newTag) throw new ApiError("Invalid Details", 400, "New TagId does not exist. Please provide a valid tagId.", true);
        if (!animalWithOldTag) throw new ApiError("Invalid Details", 400, "Animal with the provided animalId and Old TagId does not exist.", true);
        if (animalWithNewTag) throw new ApiError("Invalid Details", 400, "Animal with the provided New TagId already exists.", true);

        const tagHistory = {
            createdBy: userId,
            oldTagId,
            newTagId,
            animalId,
            date,
        };
        // transactions start
        transaction = await sequelize.transaction();
        await Promise.all([
            TagHistory.create(tagHistory, { transaction }),
            Animal.update({ tagId: newTagId, tagName: newTag.name }, { where: { uuid: animalId, farmId }, transaction }),
            Tag.update({ is_used: false }, { where: { uuid: oldTagId, farmId }, transaction }),
            Tag.update({ is_used: true }, { where: { uuid: newTagId, farmId }, transaction }),
        ]);
        // Commit transaction
        await transaction.commit();
        return sendSuccessResponse(res, 200, true, "animal tagId update successfully.", "animal");
    } catch (error) {
        // Rollback transaction on error
        if (transaction) await transaction.rollback();
        next(error);
    }
    return ReplaceTag;
};
export default ReplaceTag;
