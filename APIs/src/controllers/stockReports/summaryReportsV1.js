
import { getUserById } from "../../repo/user.js";
import { ApiError } from "../../utils/ApiError.js";
import sendSuccessResponse from "../../utils/responses/sendSuccessResponse.js";
import { getOpeningSnapshots, getReportData } from "../../repo/summrayReports.js";
import isValidUUID from "../../utils/uuidValidator.js";
import StockCategories from "../../models/stockCategories.js";
import { Op } from "sequelize";
import { DefaultStockCategories } from "../../constants/index.js";

function mergeResults(result, openingClosingStock) {
    const openingClosingStockMap = openingClosingStock.reduce((map, item) => {
        map[item.itemId] = item;
        return map;
    }, {});
    // Merge data
    const merged = result.map(item => {
        const match = openingClosingStockMap[item.itemid];
        return {
            ...item,
            usage_price: Number(item.usage_price),
            purchase_price: Number(item.purchase_price),
            sale_price: Number(item.sale_price),
            closing_quantity: match ? match.closing_quantity : 0,
            closing_price: match ? match.closing_avg_price : 0,
            opening_quantity: match ? match.opening_quantity : item.opening_quantity,
            opening_price: match ? match.avg_price : 0
        };
    });

    return merged;
}

const SummaryReportV1 = async (req, res, next) => {
    try {
        const { query: { categoryId, startDate, endDate = new Date() }, userId } = req;
        const user = await getUserById(userId);
        if (!user) throw new ApiError("Unauthorized", 400, "Unauthorized access.", true);
        const { farmId } = user;
        if (!farmId) throw new ApiError("Unauthorized", 400, "Farm not found.", true);
        if (!startDate) throw new ApiError("Unauthorized", 400, "Start date is required.", true);
        let categoryIds = [categoryId];
        let isExluded = false;
        if (isValidUUID(categoryId)) {
            // only provided categoryId items data fetched
            const category = await StockCategories.findOne({ where: { uuid: categoryId, farmId, isDeleted: false }, raw: true });
            if (!category) throw new ApiError("Invalid Details", 400, "Stock category not found with provided categoryId", true);
        } else {
            // other then defaulte categories items data fetched
            const categories = await StockCategories.findAll({ where: { farmId, isDeleted: false, name: { [Op.in]: Object.values(DefaultStockCategories) } }, raw: true });
            if (!categories) throw new ApiError("Invalid Details", 400, "Stock category not found with provided categoryId", true);
            const ids = categories?.map(item => item.uuid);
            categoryIds = ids;
            isExluded = true;
        }
        // Fetch Data
        const result = await getReportData({ farmId, startDate, endDate, categoryId });
        const openingClosingStock = await getOpeningSnapshots(farmId, categoryIds, startDate, endDate, isExluded);
        const finalMergedData = mergeResults(result, openingClosingStock);
        const responseData = {
            result: finalMergedData,
        };
        return sendSuccessResponse(res, 200, true, "Summary Report fetched successfully.", "stock-items", responseData);
    } catch (error) {
        next(error);
    }
    return SummaryReportV1;
};
export default SummaryReportV1;
