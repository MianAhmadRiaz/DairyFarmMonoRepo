import FinancialSettings from "../../models/financialSettings.js";
import { getFarmContext, ensureFinanceSetup } from "../../repo/finance.js";
import sendSuccessResponse from "../../utils/responses/sendSuccessResponse.js";

// GET /finance/settings
export const GetSettings = async (req, res, next) => {
    try {
        const { userId } = req;
        const { farmId } = await getFarmContext(userId);
        await ensureFinanceSetup(farmId, userId);
        let settings = await FinancialSettings.getSettingsForFarm(farmId);
        if (!settings) settings = await FinancialSettings.createDefaultSettings(farmId, userId);
        return sendSuccessResponse(res, 200, true, "Settings fetched successfully.", "financial-settings", settings);
    } catch (error) {
        next(error);
    }
};

// PUT /finance/settings
export const UpdateSettings = async (req, res, next) => {
    try {
        const { body, userId } = req;
        const { farmId } = await getFarmContext(userId);
        await ensureFinanceSetup(farmId, userId);
        let settings = await FinancialSettings.getSettingsForFarm(farmId);
        if (!settings) settings = await FinancialSettings.createDefaultSettings(farmId, userId);

        const allowed = [
            "accounting_method", "fiscal_year_start_month", "default_currency", "currency_symbol", "decimal_places",
            "default_cash_account_id", "default_bank_account_id", "default_sales_account_id", "default_purchase_account_id",
            "default_expense_account_id", "default_tax_account_id",
            "auto_create_journal_entries", "auto_post_transactions",
            "auto_generate_milk_sales", "auto_generate_feed_expenses", "auto_generate_salary_expenses",
            "enable_tax", "tax_rate", "enable_budget_alerts", "auto_backup_enabled",
        ];
        const updates = {};
        for (const key of allowed) {
            if (body[key] !== undefined) updates[key] = body[key];
        }
        await settings.update(updates);
        return sendSuccessResponse(res, 200, true, "Settings updated successfully.", "financial-settings", settings);
    } catch (error) {
        next(error);
    }
};
