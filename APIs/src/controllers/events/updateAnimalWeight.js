import sequelize from "../../config/db.js";
import Animal from "../../models/animal.js";
import WeightHistory from "../../models/weightHistory.js";
import { getUserById } from "../../repo/user.js";
import { ApiError } from "../../utils/ApiError.js";
import sendSuccessResponse from "../../utils/responses/sendSuccessResponse.js";

const UpdateAnimalWeight = async (req, res, next) => {
    let transaction;
    try {
        const { body: { weight, animalId, date, }, userId } = req;
        const user = await getUserById(userId);
        if (!user) throw new ApiError("Unauthorized", 400, "Unauthorized access.", true);
        const { farmId } = user;
        if (!farmId) throw new ApiError("Unauthorized", 400, "Farm not found.", true);
        const animal = await Animal.findOne({ where: { uuid: animalId, farmId }, raw: true });
        if (!animal) throw new ApiError("Invalid Details", 400, "Animal with the provided animalId does not exist.", true);

        const weightHistory = {
            createdBy: userId,
            weight,
            date,
            animalId,
        };
        // transactions start
        transaction = await sequelize.transaction();
        await Promise.all([
            WeightHistory.create(weightHistory, { transaction }),
            Animal.update({ animalWeight: weight }, { where: { uuid: animalId }, transaction }),
        ]);
        // Commit transaction
        await transaction.commit();
        return sendSuccessResponse(res, 200, true, "animal weight update successfully.", "animal");
    } catch (error) {
        // Rollback transaction on error
        if (transaction) await transaction.rollback();
        next(error);
    }
    return UpdateAnimalWeight;
};
export default UpdateAnimalWeight;
