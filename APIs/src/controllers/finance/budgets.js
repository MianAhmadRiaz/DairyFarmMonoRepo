import { Op } from "sequelize";
import Budget from "../../models/budget.js";
import FinancialTransaction from "../../models/financialTransaction.js";
import TransactionCategory from "../../models/transactionCategory.js";
import ChartOfAccounts from "../../models/chartOfAccounts.js";
import { getFarmContext, ensureFinanceSetup } from "../../repo/finance.js";
import { ApiError } from "../../utils/ApiError.js";
import sendSuccessResponse from "../../utils/responses/sendSuccessResponse.js";

const budgetInclude = [
    { model: TransactionCategory, as: "category", attributes: ["id", "name", "category_type"] },
    { model: ChartOfAccounts, as: "account", attributes: ["id", "account_code", "account_name", "account_type"] },
];

/**
 * Compute the actual amount spent/earned for a budget from posted transactions.
 */
async function computeActuals(budget, farmId) {
    if (!budget.account_id) return 0;
    const side = budget.budget_type === "income" ? "credit_account_id" : "debit_account_id";
    const total = await FinancialTransaction.sum("amount", {
        where: {
            farmId,
            status: "completed",
            [side]: budget.account_id,
            transaction_date: { [Op.between]: [budget.start_date, budget.end_date] },
        },
    });
    return Number(total || 0);
}

async function refreshBudget(budget, farmId) {
    const actual = await computeActuals(budget, farmId);
    const budgeted = Number(budget.budgeted_amount) || 0;
    const variance = budgeted - actual;
    const variancePct = budgeted !== 0 ? (variance / budgeted) * 100 : 0;
    await budget.update({
        actual_amount: actual,
        variance,
        variance_percentage: Number(variancePct.toFixed(2)),
    });
    return budget;
}

// GET /finance/budgets
export const GetBudgets = async (req, res, next) => {
    try {
        const { query: { budgetType, status }, userId } = req;
        const { farmId } = await getFarmContext(userId);
        await ensureFinanceSetup(farmId, userId);
        const where = { farmId };
        if (budgetType) where.budget_type = budgetType;
        if (status) where.status = status;

        const budgets = await Budget.findAll({ where, include: budgetInclude, order: [["start_date", "DESC"]] });
        for (const b of budgets) await refreshBudget(b, farmId);
        return sendSuccessResponse(res, 200, true, "Budgets fetched successfully.", "budgets", { budgets });
    } catch (error) {
        next(error);
    }
};

// POST /finance/budgets
export const CreateBudget = async (req, res, next) => {
    try {
        const { body, userId } = req;
        const { farmId } = await getFarmContext(userId);
        await ensureFinanceSetup(farmId, userId);
        const { name, budget_type, period_type, start_date, end_date, budgeted_amount, category_id, account_id, alert_threshold } = body;
        if (!name || !budget_type || !start_date || !end_date || budgeted_amount === undefined) {
            throw new ApiError("Validation error", 400, "name, budget_type, start_date, end_date and budgeted_amount are required", true);
        }
        const budget = await Budget.create({
            name,
            budget_type,
            period_type: period_type || "monthly",
            start_date,
            end_date,
            budgeted_amount,
            actual_amount: 0,
            category_id: category_id || null,
            account_id: account_id || null,
            alert_threshold: alert_threshold || 80,
            status: "active",
            farmId,
            createdBy: userId,
        });
        return sendSuccessResponse(res, 201, true, "Budget created successfully.", "budgets", budget);
    } catch (error) {
        next(error);
    }
};

// PUT /finance/budgets/:id
export const UpdateBudget = async (req, res, next) => {
    try {
        const { params: { id }, body, userId } = req;
        const { farmId } = await getFarmContext(userId);
        const budget = await Budget.findOne({ where: { id, farmId } });
        if (!budget) throw new ApiError("Not found", 404, "Budget not found", true);
        await budget.update({
            name: body.name ?? budget.name,
            budgeted_amount: body.budgeted_amount ?? budget.budgeted_amount,
            start_date: body.start_date ?? budget.start_date,
            end_date: body.end_date ?? budget.end_date,
            category_id: body.category_id ?? budget.category_id,
            account_id: body.account_id ?? budget.account_id,
            alert_threshold: body.alert_threshold ?? budget.alert_threshold,
            status: body.status ?? budget.status,
        });
        await refreshBudget(budget, farmId);
        return sendSuccessResponse(res, 200, true, "Budget updated successfully.", "budgets", budget);
    } catch (error) {
        next(error);
    }
};

// DELETE /finance/budgets/:id
export const DeleteBudget = async (req, res, next) => {
    try {
        const { params: { id }, userId } = req;
        const { farmId } = await getFarmContext(userId);
        const budget = await Budget.findOne({ where: { id, farmId } });
        if (!budget) throw new ApiError("Not found", 404, "Budget not found", true);
        await budget.destroy();
        return sendSuccessResponse(res, 200, true, "Budget deleted successfully.", "budgets", { id });
    } catch (error) {
        next(error);
    }
};

// GET /finance/budgets/alerts
export const GetBudgetAlerts = async (req, res, next) => {
    try {
        const { userId } = req;
        const { farmId } = await getFarmContext(userId);
        await ensureFinanceSetup(farmId, userId);
        const budgets = await Budget.findAll({ where: { farmId, status: "active" }, include: budgetInclude });
        const alerts = [];
        for (const b of budgets) {
            await refreshBudget(b, farmId);
            const budgeted = Number(b.budgeted_amount) || 0;
            const actual = Number(b.actual_amount) || 0;
            const usedPct = budgeted !== 0 ? (actual / budgeted) * 100 : 0;
            if (usedPct >= Number(b.alert_threshold)) {
                alerts.push({
                    id: b.id,
                    name: b.name,
                    budgeted_amount: budgeted,
                    actual_amount: actual,
                    used_percentage: Number(usedPct.toFixed(2)),
                    alert_threshold: Number(b.alert_threshold),
                    exceeded: actual > budgeted,
                });
            }
        }
        return sendSuccessResponse(res, 200, true, "Budget alerts fetched successfully.", "budgets", { alerts });
    } catch (error) {
        next(error);
    }
};
