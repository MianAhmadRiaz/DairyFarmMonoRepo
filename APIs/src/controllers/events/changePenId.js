import sequelize from "../../config/db.js";
import Animal from "../../models/animal.js";
import Pen from "../../models/pen.js";
import PenHistory from "../../models/penHistory.js";
import { getUserById } from "../../repo/user.js";
import { ApiError } from "../../utils/ApiError.js";
import sendSuccessResponse from "../../utils/responses/sendSuccessResponse.js";

const ChangePenId = async (req, res, next) => {
    let transaction;
    try {
        const { body: { oldPenId, newPenId, animalId, date, reason }, userId } = req;
        const user = await getUserById(userId);
        if (!user) throw new ApiError("Unauthorized", 400, "Unauthorized access.", true);
        const { farmId } = user;
        if (!farmId) throw new ApiError("Unauthorized", 400, "Farm not found.", true);
        const [oldPen, newPen, animalWithOldPen] = await Promise.all([
            Pen.findOne({ where: { uuid: oldPenId, farmId }, raw: true }),
            Pen.findOne({ where: { uuid: newPenId, farmId }, raw: true }),
            Animal.findOne({ where: { uuid: animalId, penId: oldPenId, farmId, isDeleted: false }, raw: true }),
        ]);

        if (!oldPen) throw new ApiError("Invalid Details", 400, "Old penId does not exist. Please provide a valid penId.", true);
        if (!newPen) throw new ApiError("Invalid Details", 400, "New penId does not exist. Please provide a valid penId.", true);
        if (!animalWithOldPen) throw new ApiError("Invalid Details", 400, "Animal with the provided animalId and Old penId does not exist.", true);

        const tagHistory = {
            createdBy: userId,
            oldPenId,
            newPenId,
            animalId,
            reason: reason?.toLowerCase(),
            date,
        };
        // transactions start
        transaction = await sequelize.transaction();
        await Promise.all([
            PenHistory.create(tagHistory, { transaction }),
            Animal.update({ penId: newPenId }, { where: { uuid: animalId }, transaction }),
        ]);
        // Commit transaction
        await transaction.commit();
        return sendSuccessResponse(res, 200, true, "animal penId update successfully.", "animal");
    } catch (error) {
        // Rollback transaction on error
        if (transaction) await transaction.rollback();
        next(error);
    }
    return ChangePenId;
};
export default ChangePenId;
