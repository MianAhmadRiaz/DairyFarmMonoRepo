// ─── Finance Module Associations ──────────────────────────────────────────────
// Centralized association definitions for the finance models. Imported from
// models/index.js AFTER all finance models are loaded so that every model
// reference is already registered with Sequelize. Keeping these out of the
// individual model files avoids circular-import issues.

import ChartOfAccounts from "./chartOfAccounts.js";
import TransactionCategory from "./transactionCategory.js";
import FinancialPeriod from "./financialPeriod.js";
import FinancialTransaction from "./financialTransaction.js";
import Budget from "./budget.js";
import AccountBalance from "./accountBalance.js";
import { JournalEntry, JournalEntryLineItem } from "./journalEntry.js";

// ── Financial Transaction → Chart of Accounts (debit / credit) ────────────────
FinancialTransaction.belongsTo(ChartOfAccounts, { as: "debitAccount", foreignKey: "debit_account_id" });
FinancialTransaction.belongsTo(ChartOfAccounts, { as: "creditAccount", foreignKey: "credit_account_id" });

// ── Account Balance → Chart of Accounts / Period ──────────────────────────────
AccountBalance.belongsTo(ChartOfAccounts, { as: "account", foreignKey: "account_id" });
AccountBalance.belongsTo(FinancialPeriod, { as: "period", foreignKey: "period_id" });
ChartOfAccounts.hasMany(AccountBalance, { as: "balances", foreignKey: "account_id" });

// ── Journal Entry → Period / Transaction ──────────────────────────────────────
JournalEntry.belongsTo(FinancialPeriod, { as: "period", foreignKey: "period_id" });
JournalEntry.belongsTo(FinancialTransaction, { as: "transaction", foreignKey: "transaction_id" });
JournalEntryLineItem.belongsTo(ChartOfAccounts, { as: "account", foreignKey: "account_id" });

// ── Budget → Category / Account ───────────────────────────────────────────────
Budget.belongsTo(TransactionCategory, { as: "category", foreignKey: "category_id" });
Budget.belongsTo(ChartOfAccounts, { as: "account", foreignKey: "account_id" });

export default {
    ChartOfAccounts,
    TransactionCategory,
    FinancialPeriod,
    FinancialTransaction,
    Budget,
    AccountBalance,
    JournalEntry,
    JournalEntryLineItem,
};
