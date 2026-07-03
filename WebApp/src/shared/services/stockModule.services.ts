import api from '../api/AxiosClient';
import { fetchStockCategories, StockCategory } from './stock.services';

/* ─────────────────────────── shared types ─────────────────────────── */

export interface PaginationMeta {
  page: number;
  totalPages: number;
  limit: number;
  skip: number;
  totalCount: number;
}

/** Category names auto-created by the backend (DefaultStockCategories). */
export const DEFAULT_STOCK_CATEGORY_NAMES = ['feeding', 'medicine', 'semen'] as const;

/* ─────────────────────────── stock items (with level) ─────────────────────────── */

export interface StockLevelInfo {
  uuid: string;
  quantity: number | string;
  price: number | string;
}

export interface StockItemRow {
  uuid: string;
  name: string;
  description?: string | null;
  categoryId: string;
  category_name?: string | null;
  unit_of_measure?: string | null;
  reorder_level: number;
  stockLevel?: StockLevelInfo | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface StockItemsListData extends PaginationMeta {
  items: StockItemRow[];
}

export async function getStockItems(
  params: { page?: number; limit?: number; categoryId?: string } = {}
): Promise<StockItemsListData> {
  const res = await api.get('/stock-items', params);
  return res.data.data;
}

/**
 * GET /stock-items without categoryId only returns items belonging to the
 * default categories (feeding / medicine / semen), so to build a complete
 * item list we also fetch every non-default category individually.
 */
export async function getAllStockItems(limit: number = 500): Promise<StockItemRow[]> {
  const [defaultList, categories] = await Promise.all([
    getStockItems({ page: 1, limit }),
    fetchStockCategories()
  ]);
  const otherCategories = (categories || []).filter(
    (c: StockCategory) =>
      !DEFAULT_STOCK_CATEGORY_NAMES.includes(
        (c.name || '').toLowerCase() as (typeof DEFAULT_STOCK_CATEGORY_NAMES)[number]
      )
  );
  const otherLists = await Promise.all(
    otherCategories.map(c => getStockItems({ page: 1, limit, categoryId: c.uuid }))
  );
  const byId = new Map<string, StockItemRow>();
  [...(defaultList.items || []), ...otherLists.flatMap(l => l.items || [])].forEach(item =>
    byId.set(item.uuid, item)
  );
  return Array.from(byId.values());
}

/* ─────────────────────────── stock level ─────────────────────────── */

export interface StockLevelRow {
  uuid: string;
  itemId: string;
  item_name?: string | null;
  quantity: number | string;
  price: number | string;
  createdAt?: string;
}

export interface StockLevelsListData extends PaginationMeta {
  stockLevels: StockLevelRow[];
}

export async function getStockLevels(
  params: { page?: number; limit?: number; stockId?: string } = {}
): Promise<StockLevelsListData> {
  const res = await api.get('/stock-items/level', params);
  return res.data.data;
}

/* ─────────────────────────── low stock alerts ─────────────────────────── */

/** Raw joined row of stock_items + stock_level (reorder_level >= quantity). */
export interface StockAlertRow {
  uuid: string;
  name?: string | null;
  item_name?: string | null;
  category_name?: string | null;
  reorder_level: number;
  quantity: number | string;
  price?: number | string;
  itemId?: string;
}

export interface StockAlertsListData extends PaginationMeta {
  items: StockAlertRow[];
}

export async function getStockItemAlerts(
  params: { page?: number; limit?: number } = {}
): Promise<StockAlertsListData> {
  const res = await api.get('/stock-items/alert', params);
  return res.data.data;
}

/* ─────────────────────────── suppliers ─────────────────────────── */

export interface Supplier {
  uuid: string;
  name: string;
  contact?: string | null;
  address?: string | null;
  farmId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SuppliersListData extends PaginationMeta {
  suppliers: Supplier[];
}

export async function getSuppliers(
  params: { page?: number; limit?: number } = {}
): Promise<SuppliersListData> {
  const res = await api.get('/suppliers', params);
  return res.data.data;
}

export async function getSupplier(supplierId: string): Promise<Supplier> {
  const res = await api.get('/suppliers', { supplierId });
  return res.data.data;
}

export async function addSupplier(payload: {
  name: string;
  contact?: string;
  address?: string;
}): Promise<Supplier> {
  const res = await api.post('/suppliers', payload);
  return res.data.data;
}

export async function deleteSupplier(supplierId: string): Promise<void> {
  await api.delete(`/suppliers?supplierId=${supplierId}`);
}

/* ─────────────────────────── purchase items ─────────────────────────── */

export interface PurchaseItem {
  uuid: string;
  farmId?: string;
  supplierId: string;
  itemId: string;
  item_name?: string | null;
  supplier_name?: string | null;
  quantity: number | string;
  cost_per_unit: number | string;
  total_cost: number | string;
  date: string;
  batch_number?: string | null;
  expiry_date?: string | null;
  createdAt?: string;
}

export interface PurchaseItemsListData extends PaginationMeta {
  items: PurchaseItem[];
}

export async function getPurchaseItems(
  params: { page?: number; limit?: number; supplierId?: string } = {}
): Promise<PurchaseItemsListData> {
  const res = await api.get('/purchase-items', params);
  return res.data.data;
}

export interface AddPurchaseItemPayload {
  supplierId: string;
  itemId: string;
  quantity: number;
  cost_per_unit: number;
  date?: string;
  note?: string;
  batch_number?: string;
  expiry_date?: string;
}

export async function addPurchaseItem(payload: AddPurchaseItemPayload): Promise<PurchaseItem> {
  const res = await api.post('/purchase-items', payload);
  return res.data.data;
}

export async function deletePurchaseItem(purchaseId: string): Promise<void> {
  await api.delete(`/purchase-items?purchaseId=${purchaseId}`);
}

/* ─────────────────────────── stock transactions ─────────────────────────── */

export type StockTransactionType = 'purchase' | 'usage' | 'sale';

export interface StockTransaction {
  uuid: string;
  itemId: string;
  item_name?: string | null;
  quantity: number | string;
  last_quantity?: number | string | null;
  price?: number | string | null;
  note?: string | null;
  is_adjustment?: boolean;
  date: string;
  transaction_type: StockTransactionType;
  reference?: string | null;
  createdAt?: string;
}

export interface StockTransactionsListData extends PaginationMeta {
  transactions: StockTransaction[];
}

export async function getStockTransactions(
  params: {
    page?: number;
    limit?: number;
    transaction_type?: StockTransactionType;
    is_adjustment?: 'true' | 'false';
  } = {}
): Promise<StockTransactionsListData> {
  const res = await api.get('/stock-transactions', params);
  return res.data.data;
}

export async function addStockTransaction(payload: {
  itemId: string;
  quantity: number;
  transaction_type: StockTransactionType;
  note?: string;
  date?: string;
}): Promise<StockTransaction> {
  const res = await api.post('/stock-transactions', payload);
  return res.data.data;
}

/* ─────────────────────────── stock reports ─────────────────────────── */

/**
 * Row of GET /stock-reports (summaryReportsV1). Keys are lowercase because
 * the backend uses unquoted SQL aliases.
 */
export interface StockSummaryReportRow {
  itemid: string;
  itemname: string;
  price?: number | string | null;
  consumption_quantity: number | string;
  purchase_quantity: number | string;
  sale_quantity: number | string;
  usage_price: number;
  purchase_price: number;
  sale_price: number;
  opening_quantity?: number | string | null;
  opening_price?: number | string | null;
  closing_quantity?: number | string | null;
  closing_price?: number | string | null;
}

export async function getStockSummaryReport(params: {
  startDate: string;
  endDate?: string;
  categoryId?: string;
}): Promise<StockSummaryReportRow[]> {
  const res = await api.get('/stock-reports', params);
  return res.data.data?.result || [];
}

export interface ReorderReportRow {
  uuid: string;
  name: string;
  reorder_level: number;
  category_name?: string | null;
  quantity: number | string;
}

export async function getReorderReport(): Promise<ReorderReportRow[]> {
  const res = await api.get('/stock-reports/re-order');
  return res.data.data?.items || [];
}

export interface ExpiryBatch {
  uuid: string;
  itemId: string;
  item_name?: string | null;
  supplier_name?: string | null;
  quantity: number | string;
  batch_number?: string | null;
  expiry_date: string;
  date?: string;
}

export interface ExpiryReportData {
  days: number;
  expired: ExpiryBatch[];
  expiringSoon: ExpiryBatch[];
  counts: { expired: number; expiringSoon: number };
}

export async function getExpiryReport(days: number = 60): Promise<ExpiryReportData> {
  const res = await api.get('/stock-reports/expiry', { days });
  return res.data.data;
}

/* ─────────────────────────── helpers ─────────────────────────── */

/** Resolve a stock category by (case-insensitive) name, e.g. 'feeding'. */
export async function findStockCategoryByName(name: string): Promise<StockCategory | undefined> {
  const categories = await fetchStockCategories();
  return (categories || []).find(c => (c.name || '').toLowerCase() === name.toLowerCase());
}
