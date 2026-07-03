import { Op } from "sequelize";
import FinancialTransaction from "../../models/financialTransaction.js";
import ChartOfAccounts from "../../models/chartOfAccounts.js";
import { getFarmContext, ensureFinanceSetup } from "../../repo/finance.js";
import { ApiError } from "../../utils/ApiError.js";
import sendSuccessResponse from "../../utils/responses/sendSuccessResponse.js";

const DEBIT_NORMAL = new Set(["asset", "expense"]);

const accountInclude = [
    { model: ChartOfAccounts, as: "debitAccount", attributes: ["id", "account_code", "account_name", "account_type"] },
    { model: ChartOfAccounts, as: "creditAccount", attributes: ["id", "account_code", "account_name", "account_type"] },
];

function dateRangeWhere(farmId, startDate, endDate) {
    const where = { farmId, status: "completed" };
    if (startDate && endDate) where.transaction_date = { [Op.between]: [startDate, endDate] };
    else if (startDate) where.transaction_date = { [Op.gte]: startDate };
    else if (endDate) where.transaction_date = { [Op.lte]: endDate };
    return where;
}

// GET /finance/reports/trial-balance
export const GetTrialBalance = async (req, res, next) => {
    try {
        const { userId } = req;
        const { farmId } = await getFarmContext(userId);
        await ensureFinanceSetup(farmId, userId);

        const accounts = await ChartOfAccounts.findAll({ where: { farmId }, order: [["account_code", "ASC"]] });
        let totalDebit = 0;
        let totalCredit = 0;
        const rows = accounts.map((a) => {
            const balance = Number(a.current_balance) || 0;
            const isDebitNormal = DEBIT_NORMAL.has(a.account_type);
            let debit = 0;
            let credit = 0;
            if (isDebitNormal) {
                if (balance >= 0) debit = balance; else credit = -balance;
            } else {
                if (balance >= 0) credit = balance; else debit = -balance;
            }
            totalDebit += debit;
            totalCredit += credit;
            return {
                account_id: a.id,
                account_code: a.account_code,
                account_name: a.account_name,
                account_type: a.account_type,
                debit,
                credit,
            };
        });
        return sendSuccessResponse(res, 200, true, "Trial balance generated.", "reports", {
            rows: rows.filter((r) => r.debit !== 0 || r.credit !== 0),
            totalDebit,
            totalCredit,
            balanced: Math.abs(totalDebit - totalCredit) < 0.01,
        });
    } catch (error) {
        next(error);
    }
};

// GET /finance/reports/profit-loss
export const GetProfitLoss = async (req, res, next) => {
    try {
        const { query: { startDate, endDate }, userId } = req;
        const { farmId } = await getFarmContext(userId);
        await ensureFinanceSetup(farmId, userId);

        const transactions = await FinancialTransaction.findAll({
            where: dateRangeWhere(farmId, startDate, endDate),
            include: accountInclude,
        });

        const revenue = {};
        const expense = {};
        const addTo = (bucket, account, amount) => {
            if (!account) return;
            const key = account.account_code;
            if (!bucket[key]) bucket[key] = { account_code: account.account_code, account_name: account.account_name, amount: 0 };
            bucket[key].amount += amount;
        };

        for (const tx of transactions) {
            const amount = Number(tx.amount);
            if (tx.creditAccount?.account_type === "revenue") addTo(revenue, tx.creditAccount, amount);
            if (tx.debitAccount?.account_type === "revenue") addTo(revenue, tx.debitAccount, -amount);
            if (tx.debitAccount?.account_type === "expense") addTo(expense, tx.debitAccount, amount);
            if (tx.creditAccount?.account_type === "expense") addTo(expense, tx.creditAccount, -amount);
        }

        const revenueRows = Object.values(revenue);
        const expenseRows = Object.values(expense);
        const totalRevenue = revenueRows.reduce((s, r) => s + r.amount, 0);
        const totalExpense = expenseRows.reduce((s, r) => s + r.amount, 0);
        return sendSuccessResponse(res, 200, true, "Profit & loss generated.", "reports", {
            startDate: startDate || null,
            endDate: endDate || null,
            revenue: revenueRows,
            expenses: expenseRows,
            totalRevenue,
            totalExpense,
            netProfit: totalRevenue - totalExpense,
        });
    } catch (error) {
        next(error);
    }
};

// GET /finance/reports/balance-sheet
export const GetBalanceSheet = async (req, res, next) => {
    try {
        const { userId } = req;
        const { farmId } = await getFarmContext(userId);
        await ensureFinanceSetup(farmId, userId);

        const accounts = await ChartOfAccounts.findAll({ where: { farmId }, order: [["account_code", "ASC"]] });
        const assets = [];
        const liabilities = [];
        const equity = [];
        let netIncome = 0;

        for (const a of accounts) {
            const balance = Number(a.current_balance) || 0;
            const row = { account_code: a.account_code, account_name: a.account_name, amount: balance };
            if (a.account_type === "asset") assets.push(row);
            else if (a.account_type === "liability") liabilities.push(row);
            else if (a.account_type === "equity") equity.push(row);
            else if (a.account_type === "revenue") netIncome += balance;
            else if (a.account_type === "expense") netIncome -= balance;
        }

        const totalAssets = assets.reduce((s, r) => s + r.amount, 0);
        const totalLiabilities = liabilities.reduce((s, r) => s + r.amount, 0);
        const totalEquity = equity.reduce((s, r) => s + r.amount, 0) + netIncome;
        return sendSuccessResponse(res, 200, true, "Balance sheet generated.", "reports", {
            assets,
            liabilities,
            equity,
            netIncome,
            totalAssets,
            totalLiabilities,
            totalEquity,
            balanced: Math.abs(totalAssets - (totalLiabilities + totalEquity)) < 0.01,
        });
    } catch (error) {
        next(error);
    }
};

// GET /finance/reports/general-ledger?accountId=&startDate=&endDate=
export const GetGeneralLedger = async (req, res, next) => {
    try {
        const { query: { accountId, startDate, endDate }, userId } = req;
        const { farmId } = await getFarmContext(userId);
        await ensureFinanceSetup(farmId, userId);
        if (!accountId) throw new ApiError("Validation error", 400, "accountId is required", true);

        const account = await ChartOfAccounts.findOne({ where: { id: accountId, farmId } });
        if (!account) throw new ApiError("Not found", 404, "Account not found", true);

        const where = dateRangeWhere(farmId, startDate, endDate);
        where[Op.or] = [{ debit_account_id: accountId }, { credit_account_id: accountId }];
        const transactions = await FinancialTransaction.findAll({
            where,
            include: accountInclude,
            order: [["transaction_date", "ASC"], ["createdAt", "ASC"]],
        });

        const isDebitNormal = DEBIT_NORMAL.has(account.account_type);
        let running = Number(account.opening_balance) || 0;
        const entries = transactions.map((tx) => {
            const amount = Number(tx.amount);
            const isDebit = tx.debit_account_id === Number(accountId);
            const debit = isDebit ? amount : 0;
            const credit = isDebit ? 0 : amount;
            running += isDebitNormal ? debit - credit : credit - debit;
            return {
                transaction_id: tx.id,
                date: tx.transaction_date,
                transaction_number: tx.transaction_number,
                description: tx.description,
                contra_account: isDebit ? tx.creditAccount?.account_name : tx.debitAccount?.account_name,
                debit,
                credit,
                balance: running,
            };
        });

        return sendSuccessResponse(res, 200, true, "General ledger generated.", "reports", {
            account: { id: account.id, account_code: account.account_code, account_name: account.account_name, account_type: account.account_type },
            opening_balance: Number(account.opening_balance) || 0,
            closing_balance: running,
            entries,
        });
    } catch (error) {
        next(error);
    }
};
