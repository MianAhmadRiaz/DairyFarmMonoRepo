import sequelize from "../../config/db.js";
import { TransactionTypes } from "../../constants/index.js";
import logger from "../../logger/index.js";
import FeedFormulations from "../../models/feedFormulation.js";
import FeedFormulationsHistory from "../../models/feedFormulationHistory.js";
import FeedFormulationsItems from "../../models/feedFormulationItems.js";
import StockLevel from "../../models/stockLevel.js";
import StockTransactions from "../../models/stockTransactions.js";
import { getUserById } from "../../repo/user.js";
import { ApiError } from "../../utils/ApiError.js";
import { recordFeedExpense } from "../../utils/finance/financeHooks.js";
import sendSuccessResponse from "../../utils/responses/sendSuccessResponse.js";

const FeedUsage = async (req, res, next) => {
    const transaction = await sequelize.transaction();
    try {
        const { body: { formulationId, remarks, quantity, penId, date = new Date().toISOString().split("T")[0] }, userId } = req;
        const user = await getUserById(userId);
        if (!user) throw new ApiError("Unauthorized", 400, "Unauthorized access.", true);
        const { farmId } = user;
        if (!farmId) throw new ApiError("Unauthorized", 400, "Farm not found.", true);
        const includeItems = {
            model: FeedFormulationsItems,
            as: "items",
            where: { isDeleted: false },
            required: false,
        };
        const formulation = await FeedFormulations.findOne({ where: { uuid: formulationId, farmId, isDeleted: false }, include: [includeItems] });
        if (!formulation) throw new ApiError("Invalid Details", 400, "Stock formulation not found with provided formulationId", true);
        const { items } = formulation;
        if (!items.length) {
            throw new ApiError("Invalid Details", 400, "No items found in the selected feed formulation.", true);
        }
        const paylaod = {
            farmId,
            formulationId,
            formulation_name: formulation.name,
            date,
            quantity,
            penId,
            remarks,
            createdBy: userId,
            updatedBy: userId,
        }
        const createfeedFormulation = await FeedFormulationsHistory.create(paylaod, { transaction, raw: true });
        const { uuid: formulation_history_id } = createfeedFormulation;
        const stockTransactions = [];
        const arrayOfPromises = [];
        let totalCost = 0;
        await Promise.all(
            items.map(async (item) => {
                const { itemId } = item;
                const stockItem = await StockLevel.findOne({ where: { itemId, farmId, isDeleted: false }, raw: true });
                if (!stockItem) throw new ApiError("Invalid Details", 400, "Stock item not found that include in feed formulation.", true);
                const stockUsage = parseFloat(item.quantity) * parseFloat(quantity);
                if (stockItem.quantity < stockUsage) throw new ApiError("Invalid Details", 400, `Insufficient quantity for ${stockItem.item_name}. Available: ${stockItem.quantity}, Required: ${stockUsage}.`, true);

                const transactionPayload = {
                    farmId,
                    itemId,
                    item_name: stockItem.item_name,
                    quantity: stockUsage,
                    last_quantity: stockItem.quantity,
                    date,
                    price: stockItem.price || 0,
                    reference: formulation_history_id,
                    transaction_type: TransactionTypes.USAGE,
                    createdBy: userId,
                    updatedBy: userId,
                }
                stockTransactions.push(transactionPayload);
                totalCost += stockUsage * (parseFloat(stockItem.price) || 0);
                arrayOfPromises.push(StockLevel.decrement({ quantity: stockUsage }, { where: { itemId, farmId }, transaction }));
            })
        );
        arrayOfPromises.push(StockTransactions.bulkCreate(stockTransactions, { transaction }));
        await Promise.all(arrayOfPromises)
        await transaction.commit();
        // Record the feed expense in finance (non-blocking)
        if (totalCost > 0) {
            await recordFeedExpense({
                farmId,
                userId,
                amount: totalCost,
                referenceId: formulation_history_id,
                description: `Feed usage - ${formulation.name} x ${quantity}`,
                date,
            });
        }
        return sendSuccessResponse(res, 200, true, "Feed formulation usage event execute successfully.", "feed-formulation", createfeedFormulation);
    } catch (error) {
        logger.error(`Error in feed formulation usage: ${error.message}`);
        await transaction.rollback();
        next(error);
    }
    return FeedUsage;
};
export default FeedUsage;
