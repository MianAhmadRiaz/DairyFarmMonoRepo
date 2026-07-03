// ─── Finance Automation Hooks ─────────────────────────────────────────────────
// Non-blocking helpers other modules call when a business event with a financial
// impact occurs (milk sale, animal sale, salary payment, feed/stock purchase).
//
// Each hook:
//   • respects the per-farm automation toggle in financial_settings
//   • resolves the configured cash account, falling back to a sensible default
//   • posts a balanced double-entry transaction via the posting engine
//   • NEVER throws — a finance failure must not roll back the core operation
//
// Standard chart-of-accounts codes (created by ChartOfAccounts.createDefaultAccounts):
//   1110 Cash on Hand · 1120 Bank · 1130 Feed Inventory
//   2110 Accounts Payable · 2120 Wages Payable
//   4100 Milk Sales · 4200 Livestock Sales · 4300 Breeding Services
//   5100 Feed Costs · 5200 Veterinary · 5300 Labor Costs

import FinancialSettings from "../../models/financialSettings.js";
import ChartOfAccounts from "../../models/chartOfAccounts.js";
import { postTransaction, ensureFinanceSetup, getAccountByCode } from "../../repo/finance.js";
import logger from "../../logger/index.js";

/**
 * Resolve the cash/bank account id for a farm (configured default → code 1110).
 */
async function resolveCashAccountId(farmId) {
    const settings = await FinancialSettings.getSettingsForFarm(farmId);
    if (settings?.default_cash_account_id) return settings.default_cash_account_id;
    const cash = await ChartOfAccounts.findOne({ where: { farmId, account_code: "1110" } });
    return cash ? cash.id : null;
}

/**
 * Resolve an account by code, creating it on the fly if a farm's chart of
 * accounts predates the code (e.g. older farms missing "Employee Advances").
 */
async function resolveOrCreateAccountId(farmId, userId, { code, name, type, subtype }) {
    let account = await ChartOfAccounts.findOne({ where: { farmId, account_code: code } });
    if (!account) {
        account = await ChartOfAccounts.create({
            account_code: code,
            account_name: name,
            account_type: type,
            account_subtype: subtype,
            is_system_account: true,
            farmId,
            createdBy: userId,
        });
    }
    return account ? account.id : null;
}

/**
 * Internal: post a transaction by account codes, honoring an automation flag.
 * Swallows all errors (logs them) so the caller's main flow is never disrupted.
 */
async function safePost({ farmId, userId, settingFlag, debitCode, creditCode, debitAccountId, creditAccountId, amount, ...rest }) {
    try {
        if (!amount || Number(amount) <= 0) return null;
        await ensureFinanceSetup(farmId, userId);

        const settings = await FinancialSettings.getSettingsForFarm(farmId);
        if (settingFlag && settings && settings[settingFlag] === false) return null; // automation disabled

        let debitId = debitAccountId;
        if (!debitId) {
            const debitAccount = await getAccountByCode(farmId, debitCode);
            debitId = debitAccount ? debitAccount.id : null;
        }
        let creditId = creditAccountId;
        if (!creditId) {
            const creditAccount = await getAccountByCode(farmId, creditCode);
            creditId = creditAccount ? creditAccount.id : null;
        }

        if (!debitId || !creditId) {
            logger.error(`Finance automation (${rest.transactionSource || "auto"}) skipped: missing chart-of-accounts entry (debit: ${debitCode || debitAccountId}, credit: ${creditCode || creditAccountId}) for farm ${farmId}`);
            return null;
        }

        return await postTransaction({
            farmId,
            userId,
            debitAccountId: debitId,
            creditAccountId: creditId,
            amount: Number(amount),
            ...rest,
        });
    } catch (error) {
        logger.error(`Finance automation (${rest.transactionSource || "auto"}) failed: ${error.message}`);
        return null;
    }
}

/**
 * Milk sale → Debit Cash, Credit Milk Sales (4100). Income.
 */
export async function recordMilkSale({ farmId, userId, amount, referenceId, description = "Milk sale", date }) {
    const cashId = await resolveCashAccountId(farmId).catch(() => null);
    return safePost({
        farmId, userId,
        settingFlag: "auto_generate_milk_sales",
        debitAccountId: cashId,
        debitCode: "1110",
        creditCode: "4100",
        amount,
        transactionType: "income",
        transactionSource: "milk_sale",
        description,
        transactionDate: date ? new Date(date) : new Date(),
        referenceId: referenceId ? String(referenceId) : null,
        referenceType: "milk_sale",
    });
}

/**
 * Animal / livestock sale → Debit Cash, Credit Livestock Sales (4200). Income.
 */
export async function recordAnimalSale({ farmId, userId, amount, referenceId, description = "Animal sale", date }) {
    const cashId = await resolveCashAccountId(farmId).catch(() => null);
    return safePost({
        farmId, userId,
        settingFlag: null,
        debitAccountId: cashId,
        debitCode: "1110",
        creditCode: "4200",
        amount,
        transactionType: "income",
        transactionSource: "animal_sale",
        description,
        transactionDate: date ? new Date(date) : new Date(),
        referenceId: referenceId ? String(referenceId) : null,
        referenceType: "animal_sale",
    });
}

/**
 * Salary payment → Debit Labor Costs (5300), Credit Cash. Expense.
 */
export async function recordSalaryPayment({ farmId, userId, amount, referenceId, description = "Salary payment", date }) {
    const cashId = await resolveCashAccountId(farmId).catch(() => null);
    return safePost({
        farmId, userId,
        settingFlag: "auto_generate_salary_expenses",
        creditAccountId: cashId,
        debitCode: "5300",
        creditCode: "1110",
        amount,
        transactionType: "expense",
        transactionSource: "salary",
        description,
        transactionDate: date ? new Date(date) : new Date(),
        referenceId: referenceId ? String(referenceId) : null,
        referenceType: "salary",
    });
}

/**
 * Feed cost/expense → Debit Feed Costs (5100), Credit Cash. Expense.
 */
export async function recordFeedExpense({ farmId, userId, amount, referenceId, description = "Feed expense", date }) {
    const cashId = await resolveCashAccountId(farmId).catch(() => null);
    return safePost({
        farmId, userId,
        settingFlag: "auto_generate_feed_expenses",
        creditAccountId: cashId,
        debitCode: "5100",
        creditCode: "1110",
        amount,
        transactionType: "expense",
        transactionSource: "feeding",
        description,
        transactionDate: date ? new Date(date) : new Date(),
        referenceId: referenceId ? String(referenceId) : null,
        referenceType: "feeding",
    });
}

/**
 * Stock / inventory purchase → Debit expense/inventory account, Credit Cash.
 * @param {string} [debitCode="5700"] expense account to debit (defaults to Operating Expenses)
 */
export async function recordStockPurchase({ farmId, userId, amount, referenceId, debitCode = "5700", description = "Stock purchase", date }) {
    const cashId = await resolveCashAccountId(farmId).catch(() => null);
    return safePost({
        farmId, userId,
        settingFlag: null,
        creditAccountId: cashId,
        debitCode,
        creditCode: "1110",
        amount,
        transactionType: "expense",
        transactionSource: "purchase",
        description,
        transactionDate: date ? new Date(date) : new Date(),
        referenceId: referenceId ? String(referenceId) : null,
        referenceType: "purchase",
    });
}

/**
 * Reversal of a stock purchase (purchase deleted) → Debit Cash, Credit the
 * original expense account. Keeps the ledger consistent with inventory.
 */
export async function recordStockPurchaseReversal({ farmId, userId, amount, referenceId, creditCode = "5700", description = "Stock purchase reversal", date }) {
    const cashId = await resolveCashAccountId(farmId).catch(() => null);
    return safePost({
        farmId, userId,
        settingFlag: null,
        debitAccountId: cashId,
        debitCode: "1110",
        creditCode,
        amount,
        transactionType: "adjustment",
        transactionSource: "purchase",
        description,
        transactionDate: date ? new Date(date) : new Date(),
        referenceId: referenceId ? String(referenceId) : null,
        referenceType: "purchase_reversal",
    });
}

/**
 * Veterinary / treatment expense → Debit Veterinary (5200), Credit Cash. Expense.
 * Uses transactionSource "automated" (valid ENUM value) with referenceType "treatment".
 */
export async function recordVetExpense({ farmId, userId, amount, referenceId, description = "Veterinary / treatment expense", date }) {
    const cashId = await resolveCashAccountId(farmId).catch(() => null);
    return safePost({
        farmId, userId,
        settingFlag: null,
        creditAccountId: cashId,
        debitCode: "5200",
        creditCode: "1110",
        amount,
        transactionType: "expense",
        transactionSource: "automated",
        description,
        transactionDate: date ? new Date(date) : new Date(),
        referenceId: referenceId ? String(referenceId) : null,
        referenceType: "treatment",
    });
}

/**
 * Advance salary given to an employee → Debit Employee Advances (1160, asset),
 * Credit Cash. Records the outstanding receivable from the employee.
 */
export async function recordAdvanceGiven({ farmId, userId, amount, referenceId, description = "Advance given to employee", date }) {
    const cashId = await resolveCashAccountId(farmId).catch(() => null);
    const advanceId = await resolveOrCreateAccountId(farmId, userId, {
        code: "1160", name: "Employee Advances", type: "asset", subtype: "current_asset",
    }).catch(() => null);
    return safePost({
        farmId, userId,
        settingFlag: null,
        debitAccountId: advanceId,
        creditAccountId: cashId,
        debitCode: "1160",
        creditCode: "1110",
        amount,
        transactionType: "transfer",
        transactionSource: "employee_advance",
        description,
        transactionDate: date ? new Date(date) : new Date(),
        referenceId: referenceId ? String(referenceId) : null,
        referenceType: "employee_advance",
    });
}

/**
 * Advance repayment received from an employee → Debit Cash, Credit Employee
 * Advances (1160). Reduces the outstanding receivable.
 */
export async function recordAdvanceReceived({ farmId, userId, amount, referenceId, description = "Advance received from employee", date }) {
    const cashId = await resolveCashAccountId(farmId).catch(() => null);
    const advanceId = await resolveOrCreateAccountId(farmId, userId, {
        code: "1160", name: "Employee Advances", type: "asset", subtype: "current_asset",
    }).catch(() => null);
    return safePost({
        farmId, userId,
        settingFlag: null,
        debitAccountId: cashId,
        creditAccountId: advanceId,
        debitCode: "1110",
        creditCode: "1160",
        amount,
        transactionType: "transfer",
        transactionSource: "employee_advance_recovery",
        description,
        transactionDate: date ? new Date(date) : new Date(),
        referenceId: referenceId ? String(referenceId) : null,
        referenceType: "employee_advance_recovery",
    });
}

export default {
    recordMilkSale,
    recordAnimalSale,
    recordSalaryPayment,
    recordFeedExpense,
    recordStockPurchase,
    recordVetExpense,
    recordAdvanceGiven,
    recordAdvanceReceived,
};
