import sequelize from "../../config/db.js";
import logger from "../../logger/index.js";
import FeedFormulations from "../../models/feedFormulation.js";
import FeedFormulationsItems from "../../models/feedFormulationItems.js";
import { getUserById } from "../../repo/user.js";
import { ApiError } from "../../utils/ApiError.js";
import sendSuccessResponse from "../../utils/responses/sendSuccessResponse.js";
import isValidUUID from "../../utils/uuidValidator.js";

const DeleteFormulation = async (req, res, next) => {
    const transaction = await sequelize.transaction()
    try {
        const { query: { formulationId }, userId } = req;
        const user = await getUserById(userId);
        if (!user) throw new ApiError("Unauthorized", 400, "Unauthorized access.", true);
        const { farmId } = user;
        if (!farmId) throw new ApiError("Unauthorized", 400, "Farm not found.", true);
        if (!isValidUUID(formulationId)) throw new ApiError("Invalid Details", 400, "Please provide a valid formulationId.", true);
        const checkFormulation = await FeedFormulations.findOne({ where: { uuid: formulationId, isDeleted: false }, raw: true });
        if (!checkFormulation) throw new ApiError("Invalid Details", 400, "Feed formulation not found with provided formulationId", true);
        await FeedFormulations.update({ isDeleted: true }, { where: { uuid: formulationId }, transaction });
        await FeedFormulationsItems.update({ isDeleted: true }, { where: { formulationId: checkFormulation.uuid }, transaction });
        await transaction.commit();
        return sendSuccessResponse(res, 200, true, "Feed formulation delete successfully.", "feed-formulation");
    } catch (error) {
        logger.error(`Error in deleting feed formulation: ${error.message}`);
        await transaction.rollback();
        next(error);
    }
    return DeleteFormulation;
};
export default DeleteFormulation;
