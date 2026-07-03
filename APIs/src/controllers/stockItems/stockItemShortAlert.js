import { QueryTypes } from "sequelize";
import { getUserById } from "../../repo/user.js";
import { ApiError } from "../../utils/ApiError.js";
import sendSuccessResponse from "../../utils/responses/sendSuccessResponse.js";
import sequelize from "../../config/db.js";

const stockItemsAlerts = async (req, res, next) => {
    try {
        const { query: { limit = 20, page = 1 }, userId } = req;
        const offset = (page - 1) * limit;
        const user = await getUserById(userId);
        if (!user) throw new ApiError("Unauthorized", 400, "Unauthorized access.", true);
        const { farmId } = user;
        if (!farmId) throw new ApiError("Unauthorized", 400, "Farm not found.", true);

        const results = await sequelize.query(`
  SELECT si.*,
  sl.*
  FROM stock_items si
  JOIN stock_level sl ON si.uuid = sl."itemId"
  WHERE si.reorder_level >= sl.quantity
    AND si."farmId" = :farmId
  LIMIT :limit OFFSET :offset;
`, {
            replacements: { farmId, limit, offset },
            type: QueryTypes.SELECT,
        });

        const totalCountResult = await sequelize.query(`
  SELECT COUNT(*) AS count
  FROM stock_items si
  JOIN stock_level sl ON si.uuid = sl."itemId"
  WHERE si.reorder_level >= sl.quantity
    AND si."farmId" = :farmId
`, {
            replacements: { farmId },
            type: QueryTypes.SELECT,
        });
        const count = parseInt(totalCountResult[0].count);

        const totalPages = Math.ceil(count / limit);
        const responseData = {
            items: results,
            page: Number(page),
            totalPages: Number(totalPages),
            limit: Number(limit),
            skip: offset,
            totalCount: Number(count),
        };
        return sendSuccessResponse(res, 200, true, "Stock items alerts fetched successfully.", "stock-item", responseData);
    } catch (error) {
        next(error);
    }
    return stockItemsAlerts;
};
export default stockItemsAlerts;
