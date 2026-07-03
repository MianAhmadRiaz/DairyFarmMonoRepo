import express from "express";
import {
    GetChartOfAccounts,
    GetAccountById,
    CreateAccount,
    UpdateAccount,
    DeleteAccount,
    GetCategories,
    CreateCategory,
    UpdateCategory,
    DeleteCategory,
    GetTransactions,
    GetTransactionById,
    CreateTransaction,
    CancelTransaction,
    GetJournalEntries,
    GetJournalEntryById,
    CreateJournalEntry,
    PostJournalEntry,
    ReverseJournalEntry,
    GetPeriods,
    GetCurrentPeriod,
    CreatePeriod,
    ClosePeriod,
    GetBudgets,
    CreateBudget,
    UpdateBudget,
    DeleteBudget,
    GetBudgetAlerts,
    GetSettings,
    UpdateSettings,
    GetTrialBalance,
    GetProfitLoss,
    GetBalanceSheet,
    GetGeneralLedger,
    GetFinanceDashboard,
} from "../controllers/finance/index.js";

const router = express.Router();

// Dashboard
router.get("/dashboard", GetFinanceDashboard);

// Chart of accounts
router.get("/accounts", GetChartOfAccounts);
router.get("/accounts/:id", GetAccountById);
router.post("/accounts", CreateAccount);
router.put("/accounts/:id", UpdateAccount);
router.delete("/accounts/:id", DeleteAccount);

// Transaction categories
router.get("/categories", GetCategories);
router.post("/categories", CreateCategory);
router.put("/categories/:id", UpdateCategory);
router.delete("/categories/:id", DeleteCategory);

// Financial transactions
router.get("/transactions", GetTransactions);
router.get("/transactions/:id", GetTransactionById);
router.post("/transactions", CreateTransaction);
router.patch("/transactions/:id/cancel", CancelTransaction);

// Journal entries
router.get("/journal-entries", GetJournalEntries);
router.get("/journal-entries/:id", GetJournalEntryById);
router.post("/journal-entries", CreateJournalEntry);
router.patch("/journal-entries/:id/post", PostJournalEntry);
router.patch("/journal-entries/:id/reverse", ReverseJournalEntry);

// Financial periods
router.get("/periods", GetPeriods);
router.get("/periods/current", GetCurrentPeriod);
router.post("/periods", CreatePeriod);
router.patch("/periods/:id/close", ClosePeriod);

// Budgets
router.get("/budgets", GetBudgets);
router.get("/budgets/alerts", GetBudgetAlerts);
router.post("/budgets", CreateBudget);
router.put("/budgets/:id", UpdateBudget);
router.delete("/budgets/:id", DeleteBudget);

// Settings
router.get("/settings", GetSettings);
router.put("/settings", UpdateSettings);

// Reports
router.get("/reports/trial-balance", GetTrialBalance);
router.get("/reports/profit-loss", GetProfitLoss);
router.get("/reports/balance-sheet", GetBalanceSheet);
router.get("/reports/general-ledger", GetGeneralLedger);

export default router;
