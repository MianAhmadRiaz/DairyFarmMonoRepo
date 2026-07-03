import { Op } from "sequelize";
import FinancialTransaction from "../../models/financialTransaction.js";
import ChartOfAccounts from "../../models/chartOfAccounts.js";
import { getFarmContext, ensureFinanceSetup, postTransaction } from "../../repo/finance.js";
import { ApiError } from "../../utils/ApiError.js";
import sendSuccessResponse from "../../utils/responses/sendSuccessResponse.js";

const accountInclude = [
    { model: ChartOfAccounts, as: "debitAccount", attributes: ["id", "account_code", "account_name", "account_type"] },
    { model: ChartOfAccounts, as: "creditAccount", attributes: ["id", "account_code", "account_name", "account_type"] },
];

// GET /finance/transactions
export const GetTransactions = async (req, res, next) => {
    try {
        const { query: { limit = 20, page = 1, transactionType, transactionSource, status, startDate, endDate, search }, userId } = req;
        const offset = (page - 1) * limit;
        const { farmId } = await getFarmContext(userId);
        await ensureFinanceSetup(farmId, userId);

        const where = { farmId };
        if (transactionType) where.transaction_type = transactionType;
        if (transactionSource) where.transaction_source = transactionSource;
        if (status) where.status = status;
        if (startDate && endDate) where.transaction_date = { [Op.between]: [startDate, endDate] };
        else if (startDate) where.transaction_date = { [Op.gte]: startDate };
        else if (endDate) where.transaction_date = { [Op.lte]: endDate };
        if (search) {
            where[Op.or] = [
                { transaction_number: { [Op.iLike]: `%${search}%` } },
                { description: { [Op.iLike]: `%${search}%` } },
            ];
        }

        const { count, rows: items } = await FinancialTransaction.findAndCountAll({
            where,
            include: accountInclude,
            offset: Number(offset),
            limit: Number(limit),
            order: [["transaction_date", "DESC"], ["createdAt", "DESC"]],
            distinct: true,
        });

        const totalPages = Math.ceil(count / limit);
        return sendSuccessResponse(res, 200, true, "Transactions fetched successfully.", "financial-transactions", {
            items,
            page: Number(page),
            totalPages: Number(totalPages),
            limit: Number(limit),
            skip: offset,
            totalCount: Number(count),
        });
    } catch (error) {
        next(error);
    }
};

// GET /finance/transactions/:id
export const GetTransactionById = async (req, res, next) => {
    try {
        const { params: { id }, userId } = req;
        const { farmId } = await getFarmContext(userId);
        const transaction = await FinancialTransaction.findOne({ where: { id, farmId }, include: accountInclude });
        if (!transaction) throw new ApiError("Not found", 404, "Transaction not found", true);
        return sendSuccessResponse(res, 200, true, "Transaction fetched successfully.", "financial-transactions", transaction);
    } catch (error) {
        next(error);
    }
};

// POST /finance/transactions
export const CreateTransaction = async (req, res, next) => {
    try {
        const { body, userId } = req;
        const { farmId } = await getFarmContext(userId);
        await ensureFinanceSetup(farmId, userId);

        const { debit_account_id, credit_account_id, amount, transaction_type, transaction_date, description, payment_method, reference_id, reference_type } = body;
        if (!debit_account_id || !credit_account_id || !amount) {
            throw new ApiError("Validation error", 400, "debit_account_id, credit_account_id and amount are required", true);
        }

        const transaction = await postTransaction({
            farmId,
            userId,
            debitAccountId: Number(debit_account_id),
            creditAccountId: Number(credit_account_id),
            amount: Number(amount),
            transactionType: transaction_type || "expense",
            transactionSource: "manual",
            description: description || "",
            transactionDate: transaction_date ? new Date(transaction_date) : new Date(),
            paymentMethod: payment_method || null,
            referenceId: reference_id || null,
            referenceType: reference_type || null,
        });
        return sendSuccessResponse(res, 201, true, "Transaction recorded successfully.", "financial-transactions", transaction);
    } catch (error) {
        next(error);
    }
};

// PATCH /finance/transactions/:id/cancel
export const CancelTransaction = async (req, res, next) => {
    try {
        const { params: { id }, userId } = req;
        const { farmId } = await getFarmContext(userId);
        const transaction = await FinancialTransaction.findOne({ where: { id, farmId } });
        if (!transaction) throw new ApiError("Not found", 404, "Transaction not found", true);
        if (transaction.status === "cancelled") throw new ApiError("Invalid", 400, "Transaction already cancelled", true);

        // Reverse the balance impact by posting an opposite entry.
        await postTransaction({
            farmId,
            userId,
            debitAccountId: transaction.credit_account_id,
            creditAccountId: transaction.debit_account_id,
            amount: Number(transaction.amount),
            transactionType: "adjustment",
            transactionSource: "manual",
            description: `Reversal of ${transaction.transaction_number}`,
            referenceId: String(transaction.id),
            referenceType: "reversal",
        });
        await transaction.update({ status: "cancelled" });
        return sendSuccessResponse(res, 200, true, "Transaction cancelled and reversed.", "financial-transactions", transaction);
    } catch (error) {
        next(error);
    }
};
