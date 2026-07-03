import { Op, fn, col, literal } from "sequelize";
import FinancialTransaction from "../../models/financialTransaction.js";
import FinancialPeriod from "../../models/financialPeriod.js";
import FinancialSettings from "../../models/financialSettings.js";
import ChartOfAccounts from "../../models/chartOfAccounts.js";
import { getFarmContext, ensureFinanceSetup, recalcPeriodTotals, createCurrentPeriod } from "../../repo/finance.js";
import sendSuccessResponse from "../../utils/responses/sendSuccessResponse.js";

// GET /finance/dashboard
export const GetFinanceDashboard = async (req, res, next) => {
    try {
        const { userId } = req;
        const { farmId } = await getFarmContext(userId);
        await ensureFinanceSetup(farmId, userId);

        let period = await FinancialPeriod.getCurrentPeriod(farmId);
        if (!period) period = await createCurrentPeriod(farmId, userId);
        await recalcPeriodTotals(period.id, farmId);
        period = await FinancialPeriod.findByPk(period.id);

        // Cash & bank balances (use configured default cash/bank accounts, fall back to current_asset)
        const settings = await FinancialSettings.getSettingsForFarm(farmId);
        const cashAccountIds = [settings?.default_cash_account_id, settings?.default_bank_account_id].filter(Boolean);
        const cashWhere = cashAccountIds.length
            ? { farmId, id: { [Op.in]: cashAccountIds } }
            : { farmId, account_type: "asset", account_subtype: "current_asset" };
        const cashAccounts = await ChartOfAccounts.findAll({
            where: cashWhere,
            attributes: ["account_code", "account_name", "current_balance"],
        });
        const cashOnHand = cashAccounts.reduce((s, a) => s + Number(a.current_balance || 0), 0);

        // All-time income / expense totals
        const incomeTotal = Number(await FinancialTransaction.sum("amount", { where: { farmId, status: "completed", transaction_type: "income" } }) || 0);
        const expenseTotal = Number(await FinancialTransaction.sum("amount", { where: { farmId, status: "completed", transaction_type: "expense" } }) || 0);

        // Last 6 months trend
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
        sixMonthsAgo.setDate(1);
        const monthly = await FinancialTransaction.findAll({
            where: { farmId, status: "completed", transaction_date: { [Op.gte]: sixMonthsAgo } },
            attributes: [
                [fn("to_char", col("transaction_date"), "YYYY-MM"), "month"],
                "transaction_type",
                [fn("sum", col("amount")), "total"],
            ],
            group: [literal("month"), "transaction_type"],
            order: [literal("month ASC")],
            raw: true,
        });

        const trendMap = {};
        for (const row of monthly) {
            const m = row.month;
            if (!trendMap[m]) trendMap[m] = { month: m, income: 0, expense: 0 };
            if (row.transaction_type === "income") trendMap[m].income = Number(row.total);
            else if (row.transaction_type === "expense") trendMap[m].expense = Number(row.total);
        }

        // Recent transactions
        const recent = await FinancialTransaction.findAll({
            where: { farmId },
            include: [
                { model: ChartOfAccounts, as: "debitAccount", attributes: ["account_name"] },
                { model: ChartOfAccounts, as: "creditAccount", attributes: ["account_name"] },
            ],
            order: [["transaction_date", "DESC"], ["createdAt", "DESC"]],
            limit: 10,
        });

        // Income / expense by source
        const bySource = await FinancialTransaction.findAll({
            where: { farmId, status: "completed" },
            attributes: ["transaction_source", "transaction_type", [fn("sum", col("amount")), "total"]],
            group: ["transaction_source", "transaction_type"],
            raw: true,
        });

        return sendSuccessResponse(res, 200, true, "Finance dashboard generated.", "finance-dashboard", {
            period: {
                id: period.id,
                name: period.name,
                total_income: Number(period.total_income),
                total_expenses: Number(period.total_expenses),
                net_profit: Number(period.net_profit),
            },
            summary: {
                cashOnHand,
                totalIncome: incomeTotal,
                totalExpense: expenseTotal,
                netProfit: incomeTotal - expenseTotal,
            },
            cashAccounts,
            monthlyTrend: Object.values(trendMap),
            bySource,
            recentTransactions: recent,
        });
    } catch (error) {
        next(error);
    }
};
