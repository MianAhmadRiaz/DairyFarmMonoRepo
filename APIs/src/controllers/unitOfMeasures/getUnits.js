import UnitsOfMeasure from "../../models/unitsOfMeasures.js";
import { getUserById } from "../../repo/user.js";
import { ApiError } from "../../utils/ApiError.js";
import sendSuccessResponse from "../../utils/responses/sendSuccessResponse.js";
import isValidUUID from "../../utils/uuidValidator.js";

const GetUnits = async (req, res, next) => {
    try {
        const { query: { limit = 20, page = 1, unitId }, userId } = req;
        const offset = (page - 1) * limit;
        const user = await getUserById(userId);
        if (!user) throw new ApiError("Unauthorized", 400, "Unauthorized access.", true);
        const { farmId } = user;
        if (!farmId) throw new ApiError("Unauthorized", 400, "Farm not found.", true);
        if (isValidUUID(unitId)) {
            const unit = await UnitsOfMeasure.findOne({ where: { uuid: unitId, farmId, isDeleted: false }, raw: true });
            if (!unit) throw new ApiError("Invalid Details", 400, "Unit not found with provided unitId", true);
            return sendSuccessResponse(res, 200, true, "Unit fetched successfully.", "units", unit);
        }
        const where = { isDeleted: false, farmId };
        const { count, rows: units } = await UnitsOfMeasure.findAndCountAll({
            where,
            offset,
            limit,
            order: [["createdAt", "DESC"]],
        });

        const totalPages = Math.ceil(count / limit);
        const responseData = {
            units,
            page: Number(page),
            totalPages: Number(totalPages),
            limit: Number(limit),
            skip: offset,
            totalCount: Number(count),
        };
        return sendSuccessResponse(res, 200, true, "units fetched successfully.", "stock-unit", responseData);
    } catch (error) {
        next(error);
    }
    return GetUnits;
};
export default GetUnits;
