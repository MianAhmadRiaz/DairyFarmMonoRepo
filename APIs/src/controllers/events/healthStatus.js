import sequelize from "../../config/db.js";
import Animal from "../../models/animal.js";
import HealthStatusHistory from "../../models/healthStatusHistory.js";
import { getUserById } from "../../repo/user.js";
import { ApiError } from "../../utils/ApiError.js";
import sendSuccessResponse from "../../utils/responses/sendSuccessResponse.js";

const UpdateAnimalHealthStatus = async (req, res, next) => {
    let transaction;
    try {
        const { body: { healthStatus, animalId, date, }, userId } = req;
        const user = await getUserById(userId);
        if (!user) throw new ApiError("Unauthorized", 400, "Unauthorized access.", true);
        const { farmId } = user;
        if (!farmId) throw new ApiError("Unauthorized", 400, "Farm not found.", true);
        const animal = await Animal.findOne({ where: { uuid: animalId, farmId }, raw: true });
        if (!animal) throw new ApiError("Invalid Details", 400, "Animal with the provided animalId does not exist.", true);

        const healthHistory = {
            createdBy: userId,
            healthStatus: healthStatus.toLowerCase(),
            date,
            animalId,
        };
        // transactions start
        transaction = await sequelize.transaction();
        await Promise.all([
            HealthStatusHistory.create(healthHistory, { transaction }),
            Animal.update({ healthStatus: healthStatus.toLowerCase() }, { where: { uuid: animalId }, transaction }),
        ]);
        // Commit transaction
        await transaction.commit();
        return sendSuccessResponse(res, 200, true, "animal weight update successfully.", "animal");
    } catch (error) {
        // Rollback transaction on error
        if (transaction) await transaction.rollback();
        next(error);
    }
    return UpdateAnimalHealthStatus;
};
export default UpdateAnimalHealthStatus;
