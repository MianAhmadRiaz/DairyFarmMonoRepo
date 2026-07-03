import { Op } from "sequelize";
import StockCategories from "../../models/stockCategories.js";
import StockItems from "../../models/stockItem.js";
import StockLevel from "../../models/stockLevel.js";
import { getUserById } from "../../repo/user.js";
import { ApiError } from "../../utils/ApiError.js";
import sendSuccessResponse from "../../utils/responses/sendSuccessResponse.js";
import isValidUUID from "../../utils/uuidValidator.js";
import { DefaultStockCategories } from "../../constants/index.js";

const GetStockItems = async (req, res, next) => {
    try {
        const { query: { limit = 20, page = 1, itemId, categoryId }, userId } = req;
        const offset = (page - 1) * limit;
        const user = await getUserById(userId);
        if (!user) throw new ApiError("Unauthorized", 400, "Unauthorized access.", true);
        const { farmId } = user;
        if (!farmId) throw new ApiError("Unauthorized", 400, "Farm not found.", true);
        const include = [
            {
                model: StockLevel,
                as: "stockLevel",
                attributes: ["uuid", "quantity", "price"],
                required: false,
            },
        ];
        if (isValidUUID(itemId)) {
            const item = await StockItems.findOne({ where: { uuid: itemId, farmId, isDeleted: false }, include, raw: true });
            if (!item) throw new ApiError("Invalid Details", 400, "Stock item not found with provided itemId", true);
            return sendSuccessResponse(res, 200, true, "Stock item fetched successfully.", "stock-item", item);
        }
        let categoryIds = []
        if (isValidUUID(categoryId)) {
            // only provided categoryId items data fetched
            const category = await StockCategories.findOne({ where: { uuid: categoryId, farmId, isDeleted: false }, raw: true });
            if (!category) throw new ApiError("Invalid Details", 400, "Stock category not found with provided categoryId", true);
            categoryIds = [categoryId];
        } else {
            // other then defaulte categories items data fetched
            const categories = await StockCategories.findAll({ where: { farmId, isDeleted: false, name: { [Op.in]: Object.values(DefaultStockCategories) } }, raw: true });
            if (!categories) throw new ApiError("Invalid Details", 400, "Stock category not found with provided categoryId", true);
            const ids = categories?.map(item => item.uuid);
            categoryIds = ids;
        }
        const where = { isDeleted: false, farmId, categoryId: { [Op.in]: categoryIds } };
        const { count, rows: items } = await StockItems.findAndCountAll({
            where,
            include,
            offset,
            limit,
            order: [["createdAt", "DESC"]],
        });

        const totalPages = Math.ceil(count / limit);
        const responseData = {
            items,
            page: Number(page),
            totalPages: Number(totalPages),
            limit: Number(limit),
            skip: offset,
            totalCount: Number(count),
        };
        return sendSuccessResponse(res, 200, true, "Stock items fetched successfully.", "stock-item", responseData);
    } catch (error) {
        next(error);
    }
    return GetStockItems;
};
export default GetStockItems;
