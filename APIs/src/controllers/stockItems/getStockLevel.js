import StockLevel from "../../models/stockLevel.js";
import { getUserById } from "../../repo/user.js";
import { ApiError } from "../../utils/ApiError.js";
import sendSuccessResponse from "../../utils/responses/sendSuccessResponse.js";
import isValidUUID from "../../utils/uuidValidator.js";

const GetStockLevel = async (req, res, next) => {
    try {
        const { query: { limit = 20, page = 1, stockId }, userId } = req;
        const offset = (page - 1) * limit;
        const user = await getUserById(userId);
        if (!user) throw new ApiError("Unauthorized", 400, "Unauthorized access.", true);
        const { farmId } = user;
        if (!farmId) throw new ApiError("Unauthorized", 400, "Farm not found.", true);
        if (isValidUUID(stockId)) {
            const item = await StockLevel.findOne({ where: { uuid: stockId, farmId, isDeleted: false }, raw: true });
            if (!item) throw new ApiError("Invalid Details", 400, "Stock item level not found with provided stockId", true);
            return sendSuccessResponse(res, 200, true, "Stock item level fetched successfully.", "stock-item", item);
        }
        const where = { isDeleted: false, farmId };
        const { count, rows: stockLevels } = await StockLevel.findAndCountAll({
            where,
            offset,
            limit,
            order: [["createdAt", "DESC"]],
        });

        const totalPages = Math.ceil(count / limit);
        const responseData = {
            stockLevels,
            page: Number(page),
            totalPages: Number(totalPages),
            limit: Number(limit),
            skip: offset,
            totalCount: Number(count),
        };
        return sendSuccessResponse(res, 200, true, "Stock items level fetched successfully.", "stock-item", responseData);
    } catch (error) {
        next(error);
    }
    return GetStockLevel;
};
export default GetStockLevel;
