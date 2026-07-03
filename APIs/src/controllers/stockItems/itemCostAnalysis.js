
import { col, fn, Op } from "sequelize";
import { getUserById } from "../../repo/user.js";
import { ApiError } from "../../utils/ApiError.js";
import sendSuccessResponse from "../../utils/responses/sendSuccessResponse.js";
import StockTransactions from "../../models/stockTransactions.js";
import StockItems from "../../models/stockItem.js";
import { TransactionTypes } from "../../constants/index.js";
import StockLevel from "../../models/stockLevel.js";
import isValidUUID from "../../utils/uuidValidator.js";
import StockCategories from "../../models/stockCategories.js";

const StockItemCostAnalysis = async (req, res, next) => {
    try {
        const { query: { categoryId, startDate, endDate = new Date() }, userId } = req;
        const user = await getUserById(userId);
        if (!user) throw new ApiError("Unauthorized", 400, "Unauthorized access.", true);
        const { farmId } = user;
        if (!farmId) throw new ApiError("Unauthorized", 400, "Farm not found.", true);
        if (!startDate) throw new ApiError("Unauthorized", 400, "Start date is required.", true);
        let where = {
            farmId,
            transaction_type: TransactionTypes.USAGE,
            date: {
                [Op.gte]: startDate,
                [Op.lte]: endDate,
            },
        };
        if (isValidUUID(categoryId)) {
            const category = await StockCategories.findOne({ where: { uuid: categoryId, farmId, isDeleted: false }, raw: true });
            if (!category) throw new ApiError("Invalid Details", 400, "Stock category not found with provided categoryId", true);
            const items = await StockItems.findAll({ where: { categoryId, farmId, isDeleted: false }, attributes: ["uuid"], raw: true });
            const itemIds = items?.map(item => item.uuid);
            where.itemId = { [Op.in]: itemIds }
        };
        // Fetch Data
        const report = await StockTransactions.findAll({
            where,
            attributes: [
                "stock_transactions.itemId",
                [fn("SUM", col("stock_transactions.quantity")), "total_quantity"],
            ],
            include: [
                {
                    model: StockItems,
                    as: "item",
                    attributes: ["name"],
                    include: [
                        {
                            model: StockLevel,
                            as: "stockLevel",
                            attributes: ["uuid", "price", "itemId"],
                            required: false,
                        },
                    ],
                    required: false,
                },
            ],
            group: ["stock_transactions.itemId", "item.name", "item->stockLevel.uuid", "item->stockLevel.price", "item->stockLevel.itemId"],
            raw: true,
        });

        const responseData = {
            items: report
        };
        return sendSuccessResponse(res, 200, true, "Day Wise Consumption Report fetched successfully.", "stock-items", responseData);
    } catch (error) {
        next(error);
    }
    return StockItemCostAnalysis;
};
export default StockItemCostAnalysis;
