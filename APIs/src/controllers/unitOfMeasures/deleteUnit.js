import StockItems from "../../models/stockItem.js";
import UnitsOfMeasure from "../../models/unitsOfMeasures.js";
import { getUserById } from "../../repo/user.js";
import { ApiError } from "../../utils/ApiError.js";
import sendSuccessResponse from "../../utils/responses/sendSuccessResponse.js";
import isValidUUID from "../../utils/uuidValidator.js";

const DeleteUnit = async (req, res, next) => {
    try {
        const { query: { unitId }, userId } = req;
        const user = await getUserById(userId);
        if (!user) throw new ApiError("Unauthorized", 400, "Unauthorized access.", true);
        const { farmId } = user;
        if (!farmId) throw new ApiError("Unauthorized", 400, "Farm not found.", true);
        if (!isValidUUID(unitId)) throw new ApiError("Invalid Details", 400, "Please provide a valid unitId.", true);
        const checkUnit = await UnitsOfMeasure.findOne({ where: { uuid: unitId, farmId, isDeleted: false }, raw: true });
        if (!checkUnit) throw new ApiError("Invalid Details", 400, "Unit not found with provided unitId", true);
        const checkStockItem = await StockItems.findOne({ where: { unitId, farmId, isDeleted: false }, raw: true });
        if (checkStockItem) throw new ApiError("Invalid Details", 400, "unit is assigned to an stock item and cannot be deleted.", true);
        await UnitsOfMeasure.update({ isDeleted: true }, { where: { uuid: unitId, farmId } });
        return sendSuccessResponse(res, 200, true, "Unit delete successfully.", "unit");
    } catch (error) {
        next(error);
    }
    return DeleteUnit;
};
export default DeleteUnit;
