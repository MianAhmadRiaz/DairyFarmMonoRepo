// ─── Finance Repository ───────────────────────────────────────────────────────
// Shared data-access helpers and the double-entry posting engine used by both
// the finance controllers and the automation hooks of other modules.

import sequelize from "../config/db.js";
import { Op } from "sequelize";
import { getUserById } from "./user.js";
import ChartOfAccounts from "../models/chartOfAccounts.js";
import TransactionCategory from "../models/transactionCategory.js";
import FinancialPeriod from "../models/financialPeriod.js";
import FinancialSettings from "../models/financialSettings.js";
import FinancialTransaction from "../models/financialTransaction.js";
import AccountBalance from "../models/accountBalance.js";
import { JournalEntry } from "../models/journalEntry.js";
import { ApiError } from "../utils/ApiError.js";
import { HttpStatusCode } from "../constants/index.js";
import logger from "../logger/index.js";

// Account types whose balance increases on the debit side.
const DEBIT_NORMAL = new Set(["asset", "expense"]);

/**
 * Resolve the authenticated user and their farm.
 * @returns {Promise<{ user: object, farmId: string }>}
 */
export async function getFarmContext(userId) {
    const user = await getUserById(userId);
    if (!user) {
        throw new ApiError("User not found", HttpStatusCode.NOT_FOUND, "Authenticated user could not be found", true);
    }
    if (!user.farmId) {
        throw new ApiError("Farm not found", HttpStatusCode.BAD_REQUEST, "User is not associated with any farm", true);
    }
    return { user, farmId: user.farmId };
}

/**
 * Lazily provision the finance module for a farm. Idempotent — safe to call on
 * every finance request. Creates the default chart of accounts, transaction
 * categories, settings and an initial open financial period the first time.
 */
export async function ensureFinanceSetup(farmId, userId) {
    const existing = await ChartOfAccounts.findOne({ where: { farmId }, attributes: ["id"] });
    if (existing) {
        // Setup already done — make sure a current period exists.
        const current = await FinancialPeriod.getCurrentPeriod(farmId);
        if (!current) {
            await createCurrentPeriod(farmId, userId);
        }
        return { created: false };
    }

    const t = await sequelize.transaction();
    try {
        const accountMap = await ChartOfAccounts.createDefaultAccounts(farmId, userId, t);
        await TransactionCategory.createDefaultCategories(farmId, userId, t);

        // Settings + map default accounts to the well-known codes.
        const settings = await FinancialSettings.createDefaultSettings(farmId, userId);
        await settings.update({
            default_cash_account_id: accountMap["1110"] || null,
            default_bank_account_id: accountMap["1120"] || null,
            default_sales_account_id: accountMap["4100"] || null,
            default_purchase_account_id: accountMap["2110"] || null,
            default_expense_account_id: accountMap["5000"] || null,
        }, { transaction: t });

        await t.commit();
    } catch (error) {
        await t.rollback();
        logger.error("ensureFinanceSetup failed: " + error.message);
        throw new ApiError("Finance setup failed", HttpStatusCode.INTERNAL_SERVER, error.message, true);
    }

    await createCurrentPeriod(farmId, userId);
    return { created: true };
}

/**
 * Create a monthly financial period covering "now" and mark it current.
 */
export async function createCurrentPeriod(farmId, userId) {
    const existing = await FinancialPeriod.getCurrentPeriod(farmId);
    if (existing) return existing;

    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    return FinancialPeriod.createNewPeriod(farmId, userId, "monthly", start);
}

/**
 * Look up an account by code for a farm. Throws if not found.
 */
export async function getAccountByCode(farmId, code, transaction = null) {
    const account = await ChartOfAccounts.findOne({ where: { farmId, account_code: code }, transaction });
    if (!account) {
        throw new ApiError("Account not found", HttpStatusCode.BAD_REQUEST, `No account with code ${code}`, true);
    }
    return account;
}

/**
 * Apply the signed balance delta for a single posting side.
 * @param {object} account ChartOfAccounts instance
 * @param {"debit"|"credit"} side
 * @param {number} amount
 */
function balanceDelta(account, side, amount) {
    const isDebitNormal = DEBIT_NORMAL.has(account.account_type);
    if (side === "debit") return isDebitNormal ? amount : -amount;
    return isDebitNormal ? -amount : amount; // credit side
}

/**
 * Core double-entry posting engine.
 *
 * Creates a FinancialTransaction, the matching JournalEntry with two balanced
 * line items, updates the running current_balance on both chart accounts and
 * the per-period AccountBalance rows — all inside a single DB transaction.
 *
 * @param {object} params
 * @param {string} params.farmId
 * @param {string} params.userId
 * @param {number} params.debitAccountId   chart_of_accounts.id being debited
 * @param {number} params.creditAccountId  chart_of_accounts.id being credited
 * @param {number} params.amount
 * @param {string} [params.transactionType] income|expense|transfer|adjustment
 * @param {string} [params.transactionSource]
 * @param {string} [params.description]
 * @param {Date}   [params.transactionDate]
 * @param {string} [params.referenceId]
 * @param {string} [params.referenceType]
 * @param {string} [params.paymentMethod]
 * @param {object} [params.externalTransaction] outer sequelize transaction to join
 * @returns {Promise<object>} the created FinancialTransaction
 */
export async function postTransaction(params) {
    const {
        farmId,
        userId,
        debitAccountId,
        creditAccountId,
        amount,
        transactionType = "expense",
        transactionSource = "manual",
        description = "",
        transactionDate = new Date(),
        referenceId = null,
        referenceType = null,
        paymentMethod = null,
        externalTransaction = null,
    } = params;

    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
        throw new ApiError("Invalid amount", HttpStatusCode.BAD_REQUEST, "Amount must be a positive number", true);
    }
    if (!debitAccountId || !creditAccountId) {
        throw new ApiError("Accounts required", HttpStatusCode.BAD_REQUEST, "Both debit and credit accounts are required", true);
    }
    if (debitAccountId === creditAccountId) {
        throw new ApiError("Invalid accounts", HttpStatusCode.BAD_REQUEST, "Debit and credit accounts must differ", true);
    }

    // Idempotency: a business event (referenceId + referenceType) must post at
    // most once. Retries / double-submits return the original posting.
    if (referenceId && referenceType) {
        const existing = await FinancialTransaction.findOne({
            where: { farmId, reference_id: String(referenceId), reference_type: referenceType, status: "completed" },
        });
        if (existing) {
            logger.warn(`postTransaction skipped duplicate: ${referenceType}/${referenceId} already posted as ${existing.transaction_number}`);
            return existing;
        }
    }

    const ownTransaction = !externalTransaction;
    const t = externalTransaction || (await sequelize.transaction());
    try {
        const debitAccount = await ChartOfAccounts.findOne({ where: { id: debitAccountId, farmId }, transaction: t });
        const creditAccount = await ChartOfAccounts.findOne({ where: { id: creditAccountId, farmId }, transaction: t });
        if (!debitAccount || !creditAccount) {
            throw new ApiError("Account not found", HttpStatusCode.BAD_REQUEST, "Debit or credit account does not belong to this farm", true);
        }

        // Assign the period containing the transaction date (falling back to
        // the current period), and refuse to post into a closed/locked one.
        let period = await FinancialPeriod.findOne({
            where: {
                farmId,
                start_date: { [Op.lte]: transactionDate },
                end_date: { [Op.gte]: transactionDate },
            },
            order: [["start_date", "DESC"]],
        });
        if (period && period.status !== "open") {
            throw new ApiError("Period closed", HttpStatusCode.BAD_REQUEST, `Financial period ${period.name || period.id} is ${period.status} — transactions dated ${new Date(transactionDate).toISOString().split("T")[0]} cannot be posted.`, true);
        }
        if (!period) period = await FinancialPeriod.getCurrentPeriod(farmId);

        // 1. Financial transaction record
        const transactionNumber = await FinancialTransaction.generateTransactionNumber(farmId);
        const financialTransaction = await FinancialTransaction.create({
            transaction_number: transactionNumber,
            transaction_date: transactionDate,
            transaction_type: transactionType,
            transaction_source: transactionSource,
            reference_id: referenceId,
            reference_type: referenceType,
            description,
            debit_account_id: debitAccountId,
            credit_account_id: creditAccountId,
            amount: numericAmount,
            status: "completed",
            payment_method: paymentMethod,
            farmId,
            createdBy: userId,
        }, { transaction: t });

        // 2. Journal entry (double-entry record)
        await JournalEntry.createWithLineItems(
            {
                entry_date: transactionDate,
                entry_type: "standard",
                description: description || `Auto entry for ${transactionNumber}`,
                period_id: period ? period.id : null,
                transaction_id: financialTransaction.id,
                farmId,
                createdBy: userId,
                status: "posted",
            },
            [
                { account_id: debitAccountId, debit_amount: numericAmount, credit_amount: 0, line_order: 1 },
                { account_id: creditAccountId, debit_amount: 0, credit_amount: numericAmount, line_order: 2 },
            ],
            t
        );

        // 3. Running balances on the chart accounts
        await debitAccount.update(
            { current_balance: Number(debitAccount.current_balance) + balanceDelta(debitAccount, "debit", numericAmount) },
            { transaction: t }
        );
        await creditAccount.update(
            { current_balance: Number(creditAccount.current_balance) + balanceDelta(creditAccount, "credit", numericAmount) },
            { transaction: t }
        );

        // 4. Per-period account balances
        if (period) {
            await AccountBalance.updateBalance(debitAccountId, period.id, numericAmount, 0, transactionDate, farmId, t);
            await AccountBalance.updateBalance(creditAccountId, period.id, 0, numericAmount, transactionDate, farmId, t);
        }

        if (ownTransaction) await t.commit();
        return financialTransaction;
    } catch (error) {
        if (ownTransaction) await t.rollback();
        logger.error("postTransaction failed: " + error.message);
        if (error instanceof ApiError) throw error;
        throw new ApiError("Transaction failed", HttpStatusCode.INTERNAL_SERVER, error.message, true);
    }
}

/**
 * Convenience wrapper for automation hooks: resolves debit/credit accounts by
 * code, ensures finance setup exists, and posts the transaction. Failures are
 * logged but DO NOT throw by default so that core business operations (e.g.
 * recording a milk sale) are never blocked by a finance posting problem.
 *
 * @param {object} opts
 * @param {string} opts.farmId
 * @param {string} opts.userId
 * @param {string} opts.debitCode  account code to debit
 * @param {string} opts.creditCode account code to credit
 * @param {number} opts.amount
 * @param {boolean} [opts.throwOnError=false]
 */
export async function postByAccountCode(opts) {
    const { farmId, userId, debitCode, creditCode, amount, throwOnError = false } = opts;
    try {
        if (!amount || Number(amount) <= 0) return null;
        await ensureFinanceSetup(farmId, userId);
        const debitAccount = await getAccountByCode(farmId, debitCode);
        const creditAccount = await getAccountByCode(farmId, creditCode);
        return await postTransaction({
            ...opts,
            debitAccountId: debitAccount.id,
            creditAccountId: creditAccount.id,
        });
    } catch (error) {
        logger.error(`postByAccountCode failed (${opts.transactionSource || "auto"}): ${error.message}`);
        if (throwOnError) throw error;
        return null;
    }
}

/**
 * Recalculate income / expense / profit totals for a period from its posted
 * transactions. Replaces the model stub.
 */
export async function recalcPeriodTotals(periodId, farmId) {
    const period = await FinancialPeriod.findOne({ where: { id: periodId, farmId } });
    if (!period) return null;

    const rows = await FinancialTransaction.findAll({
        where: {
            farmId,
            status: "completed",
            transaction_date: { [Op.between]: [period.start_date, period.end_date] },
        },
        attributes: ["transaction_type", "amount"],
        raw: true,
    });

    let income = 0;
    let expenses = 0;
    for (const r of rows) {
        if (r.transaction_type === "income") income += Number(r.amount);
        else if (r.transaction_type === "expense") expenses += Number(r.amount);
    }

    await period.update({
        total_income: income,
        total_expenses: expenses,
        net_profit: income - expenses,
    });
    return period;
}

export default {
    getFarmContext,
    ensureFinanceSetup,
    createCurrentPeriod,
    getAccountByCode,
    postTransaction,
    postByAccountCode,
    recalcPeriodTotals,
};
