import api from '../api/AxiosClient';
import { API_CONFIG } from './apiConfigs';

// =======================================
//  Types
// =======================================
export type AccountType = 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
export type TransactionType = 'income' | 'expense' | 'transfer' | 'adjustment';

export interface ChartAccount {
  id: number;
  account_code: string;
  account_name: string;
  account_type: AccountType;
  account_subtype: string | null;
  parent_account_id: number | null;
  current_balance: number;
  opening_balance: number;
  is_active: boolean;
  is_system_account: boolean;
}

export interface TransactionCategory {
  id: number;
  name: string;
  code: string;
  category_type: 'income' | 'expense';
  parent_id: number | null;
}

export interface FinancialTransaction {
  id: number;
  transaction_number: string;
  transaction_date: string;
  transaction_type: TransactionType;
  transaction_source: string;
  description: string;
  debit_account_id: number;
  credit_account_id: number;
  amount: number;
  status: string;
  payment_method: string | null;
  debitAccount?: { account_code: string; account_name: string };
  creditAccount?: { account_code: string; account_name: string };
}

export interface Paginated<T> {
  items: T[];
  page: number;
  totalPages: number;
  limit: number;
  skip: number;
  totalCount: number;
}

export interface FinancialPeriod {
  id: number;
  name: string;
  period_type: string;
  start_date: string;
  end_date: string;
  status: string;
  is_current: boolean;
  total_income: number;
  total_expenses: number;
  net_profit: number;
}

export interface Budget {
  id: number;
  name: string;
  budget_type: string;
  start_date: string;
  end_date: string;
  budgeted_amount: number;
  actual_amount: number;
  variance: number;
  variance_percentage: number;
  status: string;
  alert_threshold: number;
  category?: { name: string };
  account?: { account_name: string };
}

export interface FinanceDashboardData {
  period: { id: number; name: string; total_income: number; total_expenses: number; net_profit: number };
  summary: { cashOnHand: number; totalIncome: number; totalExpense: number; netProfit: number };
  cashAccounts: Array<{ account_code: string; account_name: string; current_balance: number }>;
  monthlyTrend: Array<{ month: string; income: number; expense: number }>;
  bySource: Array<{ transaction_source: string; transaction_type: string; total: string }>;
  recentTransactions: FinancialTransaction[];
}

// =======================================
//  Chart of Accounts
// =======================================
export async function fetchChartOfAccounts(params: { accountType?: string; search?: string; isActive?: string } = {}): Promise<ChartAccount[]> {
  const res = await api.get(API_CONFIG.finance.accounts, params);
  return res.data.data?.accounts || [];
}

export async function fetchAccountById(id: number): Promise<ChartAccount> {
  const res = await api.get(`${API_CONFIG.finance.accounts}/${id}`);
  return res.data.data;
}

export async function createAccount(payload: Partial<ChartAccount>): Promise<ChartAccount> {
  const res = await api.post(API_CONFIG.finance.accounts, payload);
  return res.data.data;
}

export async function updateAccount(id: number, payload: Partial<ChartAccount>): Promise<ChartAccount> {
  const res = await api.put(`${API_CONFIG.finance.accounts}/${id}`, payload);
  return res.data.data;
}

export async function deleteAccount(id: number): Promise<void> {
  await api.delete(`${API_CONFIG.finance.accounts}/${id}`);
}

// =======================================
//  Categories
// =======================================
export async function fetchCategories(params: { categoryType?: string } = {}): Promise<TransactionCategory[]> {
  const res = await api.get(API_CONFIG.finance.categories, params);
  return res.data.data?.categories || [];
}

export async function createCategory(payload: Partial<TransactionCategory>): Promise<TransactionCategory> {
  const res = await api.post(API_CONFIG.finance.categories, payload);
  return res.data.data;
}

export async function updateCategory(id: number, payload: Partial<TransactionCategory>): Promise<TransactionCategory> {
  const res = await api.put(`${API_CONFIG.finance.categories}/${id}`, payload);
  return res.data.data;
}

export async function deleteCategory(id: number): Promise<void> {
  await api.delete(`${API_CONFIG.finance.categories}/${id}`);
}

// =======================================
//  Transactions
// =======================================
export async function fetchTransactions(params: Record<string, string | number> = {}): Promise<Paginated<FinancialTransaction>> {
  const res = await api.get(API_CONFIG.finance.transactions, params);
  return res.data.data;
}

export async function fetchTransactionById(id: number): Promise<FinancialTransaction> {
  const res = await api.get(`${API_CONFIG.finance.transactions}/${id}`);
  return res.data.data;
}

export async function createTransaction(payload: {
  debit_account_id: number;
  credit_account_id: number;
  amount: number;
  transaction_type?: TransactionType;
  transaction_date?: string;
  description?: string;
  payment_method?: string;
}): Promise<FinancialTransaction> {
  const res = await api.post(API_CONFIG.finance.transactions, payload);
  return res.data.data;
}

export async function cancelTransaction(id: number): Promise<FinancialTransaction> {
  const res = await api.patch(`${API_CONFIG.finance.transactions}/${id}/cancel`, {});
  return res.data.data;
}

// =======================================
//  Journal Entries
// =======================================
export interface JournalLineItem {
  account_id: number;
  debit_amount: number;
  credit_amount: number;
  description?: string;
}

export async function fetchJournalEntries(params: Record<string, string | number> = {}): Promise<Paginated<any>> {
  const res = await api.get(API_CONFIG.finance.journalEntries, params);
  return res.data.data;
}

export async function createJournalEntry(payload: {
  entry_date?: string;
  entry_type?: string;
  description?: string;
  lineItems: JournalLineItem[];
}): Promise<any> {
  const res = await api.post(API_CONFIG.finance.journalEntries, payload);
  return res.data.data;
}

export async function postJournalEntry(id: number): Promise<any> {
  const res = await api.patch(`${API_CONFIG.finance.journalEntries}/${id}/post`, {});
  return res.data.data;
}

// =======================================
//  Periods
// =======================================
export async function fetchPeriods(): Promise<FinancialPeriod[]> {
  const res = await api.get(API_CONFIG.finance.periods);
  return res.data.data?.periods || [];
}

export async function fetchCurrentPeriod(): Promise<FinancialPeriod> {
  const res = await api.get(API_CONFIG.finance.currentPeriod);
  return res.data.data;
}

// =======================================
//  Budgets
// =======================================
export async function fetchBudgets(params: Record<string, string> = {}): Promise<Budget[]> {
  const res = await api.get(API_CONFIG.finance.budgets, params);
  return res.data.data?.budgets || [];
}

export async function createBudget(payload: Partial<Budget>): Promise<Budget> {
  const res = await api.post(API_CONFIG.finance.budgets, payload);
  return res.data.data;
}

export async function fetchBudgetAlerts(): Promise<any[]> {
  const res = await api.get(API_CONFIG.finance.budgetAlerts);
  return res.data.data?.alerts || [];
}

// =======================================
//  Settings
// =======================================
export async function fetchFinanceSettings(): Promise<any> {
  const res = await api.get(API_CONFIG.finance.settings);
  return res.data.data;
}

export async function updateFinanceSettings(payload: Record<string, unknown>): Promise<any> {
  const res = await api.put(API_CONFIG.finance.settings, payload);
  return res.data.data;
}

// =======================================
//  Reports
// =======================================
export async function fetchTrialBalance(): Promise<any> {
  const res = await api.get(API_CONFIG.finance.reports.trialBalance);
  return res.data.data;
}

export async function fetchProfitLoss(params: { startDate?: string; endDate?: string } = {}): Promise<any> {
  const res = await api.get(API_CONFIG.finance.reports.profitLoss, params);
  return res.data.data;
}

export async function fetchBalanceSheet(): Promise<any> {
  const res = await api.get(API_CONFIG.finance.reports.balanceSheet);
  return res.data.data;
}

export async function fetchGeneralLedger(params: { accountId: number; startDate?: string; endDate?: string }): Promise<any> {
  const res = await api.get(API_CONFIG.finance.reports.generalLedger, params as any);
  return res.data.data;
}

// =======================================
//  Dashboard
// =======================================
export async function fetchFinanceDashboard(): Promise<FinanceDashboardData> {
  const res = await api.get(API_CONFIG.finance.dashboard);
  return res.data.data;
}
