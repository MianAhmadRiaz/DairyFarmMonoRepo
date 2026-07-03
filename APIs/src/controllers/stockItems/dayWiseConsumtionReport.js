
import { col, fn, literal, Op } from "sequelize";
import { getUserById } from "../../repo/user.js";
import { ApiError } from "../../utils/ApiError.js";
import sendSuccessResponse from "../../utils/responses/sendSuccessResponse.js";
import StockTransactions from "../../models/stockTransactions.js";
import StockItems from "../../models/stockItem.js";
import { TransactionTypes } from "../../constants/index.js";

const GetDayWiseConsumptionReport = async (req, res, next) => {
    try {
        const { query: { startDate, endDate = new Date() }, userId } = req;
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
        // Fetch Data
        const report = await StockTransactions.findAll({
            where,
            attributes: [
                "itemId",
                [fn("DATE", col("date")), "day"],
                [fn("SUM", col("quantity")), "total_quantity"],
            ],
            include: [
                {
                    model: StockItems,
                    as: "item",
                    attributes: ["name"],
                    required: false,
                },
            ],
            group: ["itemId", "day", "item.name"],
            order: [[literal("day"), "ASC"]],
            raw: true,
        });
        
        const groupedData = {};

        report.forEach(({ itemId, day, total_quantity, "item.name": itemName }) => {
            if (!groupedData[itemName]) {
                groupedData[itemName] = [];
            }
            groupedData[itemName].push({
                itemId,
                itemName,
                day,
                total_quantity: Number(total_quantity),
            });
        });

        const responseData = {
            items: groupedData
        };
        return sendSuccessResponse(res, 200, true, "Day Wise Consumption Report fetched successfully.", "stock-items", responseData);
    } catch (error) {
        next(error);
    }
    return GetDayWiseConsumptionReport;
};
export default GetDayWiseConsumptionReport;
