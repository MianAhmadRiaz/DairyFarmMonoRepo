import sequelize from "../../config/db.js";
import Animal from "../../models/animal.js";
import AnimalRemovalHistory from "../../models/removalAnimalHistory.js";
import FarmConfiguration from "../../models/farmConfiguration.js";
import Tag from "../../models/tag.js";
import { getUserById } from "../../repo/user.js";
import { ApiError } from "../../utils/ApiError.js";
import { resolveCategoryCounterField } from "../../utils/herd/animalHelpers.js";
import sendSuccessResponse from "../../utils/responses/sendSuccessResponse.js";
import { recordAnimalSale } from "../../utils/finance/financeHooks.js";

const RemoveAnimal = async (req, res, next) => {
    let transaction;
    try {
        const { body: { animalId, date, comments, removalCategory, removalReason, salePrice }, userId } = req;
        const user = await getUserById(userId);
        if (!user) throw new ApiError("Unauthorized", 400, "Unauthorized access.", true);
        const { farmId } = user;
        if (!farmId) throw new ApiError("Unauthorized", 400, "Farm not found.", true);
        const animalWithOldTag = await Animal.findOne({ where: { uuid: animalId, farmId, isDeleted: false }, raw: true });
        if (!animalWithOldTag) throw new ApiError("Invalid Details", 400, "Animal with the provided animalId does not exist.", true);
        if (removalCategory === "sold" && !(Number(salePrice) > 0)) {
            throw new ApiError("Invalid Details", 400, "salePrice is required and must be greater than 0 when removalCategory is sold.", true);
        }

        const removalHistory = {
            createdBy: userId,
            farmId,
            oldTagId: animalWithOldTag.tagId,
            animalId,
            date,
            comments,
            removalCategory,
            removalReason,
            salePrice: removalCategory === "sold" ? Number(salePrice) : null,
        };
        // transactions start
        transaction = await sequelize.transaction();
        await AnimalRemovalHistory.create(removalHistory, { transaction });
        await Animal.update({ isDeleted: true, tagId: null }, { where: { uuid: animalId, farmId }, transaction });
        if (animalWithOldTag.tagId) {
            await Tag.update({ is_used: false }, { where: { uuid: animalWithOldTag.tagId, farmId }, transaction });
        }
        const fieldToUpdate = resolveCategoryCounterField(animalWithOldTag);
        await FarmConfiguration.decrement({ current_animals: 1, [fieldToUpdate]: 1 }, { where: { farmId }, transaction });
        // Commit transaction
        await transaction.commit();
        // Finance automation: if the animal was sold, record the sale income (non-blocking)
        if (removalCategory === "sold" && Number(salePrice) > 0) {
            await recordAnimalSale({
                farmId,
                userId,
                amount: salePrice,
                referenceId: animalId,
                description: `Animal sale - tag ${animalWithOldTag.tagName || animalWithOldTag.tagId}`,
                date,
            });
        }
        return sendSuccessResponse(res, 200, true, "animal remove successfully.", "animal");
    } catch (error) {
        // Rollback transaction on error
        if (transaction) await transaction.rollback();
        next(error);
    }
};
export default RemoveAnimal;
