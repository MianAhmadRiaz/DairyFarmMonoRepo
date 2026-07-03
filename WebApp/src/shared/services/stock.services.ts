import api from '../api/AxiosClient';
import { API_CONFIG } from './apiConfigs';

// =======================================
//  Types
// =======================================
export interface StockCategory {
  uuid: string;
  name: string;
  description: string;
}

export interface StockItem {
  uuid: string;
  name: string;
  description: string;
  farmId: string;
  categoryId: string;
  category_name: string;
  unit_of_measure: string;
  reorder_level: number;
  openingStockQuantity?: number;
  openingStockRate?: number;
  openingStockAmount?: number;
  currentStockQuantity?: number;
  currentStockRate?: number;
  currentStockAmount?: number;
  createdBy: string;
  updatedBy: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

interface PaginatedStockResponse {
  items: StockItem[];
  page: number;
  totalPages: number;
  limit: number;
  skip: number;
  totalCount: number;
}

// =======================================
//  Stock Categories
// =======================================
export async function fetchStockCategories(): Promise<StockCategory[]> {
  const res = await api.get(API_CONFIG.stock.categories);
  return res.data.data?.categories || [];
}

export async function addStockCategory(payload: {
  name: string,
  description: string
}): Promise<StockCategory> {
  const res = await api.post(API_CONFIG.stock.categories, payload);
  return res.data.data;
}

// =======================================
//  Stock Items
// =======================================
export async function fetchStockItems(
  page: number = 1,
  limit: number = 10,
  categoryId?: string
): Promise<{ data: PaginatedStockResponse }> {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    ...(categoryId && { categoryId })
  });

  const res = await api.get(`${API_CONFIG.stock.items}?${params}`);
  return res.data;
}

export async function fetchStockItem(itemId: string): Promise<StockItem> {
  const res = await api.get(`${API_CONFIG.stock.items}?itemId=${itemId}`);
  return res.data.data;
}

export async function addStockItem(payload: {
  name: string,
  description: string,
  categoryId: string,
  unit_of_measure: string,
  reorder_level: number,
  openingStockQuantity?: number,
  openingStockRate?: number,
  openingStockAmount?: number,
  currentStockQuantity?: number,
  currentStockRate?: number,
  currentStockAmount?: number
}): Promise<StockItem> {
  const res = await api.post(API_CONFIG.stock.items, payload);
  return res.data.data;
}

export async function deleteStockItem(itemId: string): Promise<void> {
  await api.delete(`${API_CONFIG.stock.items}?itemId=${itemId}`);
}

export async function updateStockItem(payload: {
  name: string,
  description: string,
  categoryId: string,
  unit_of_measure: string,
  reorder_level: number,
  openingStockQuantity?: number,
  openingStockRate?: number,
  openingStockAmount?: number,
  currentStockQuantity?: number,
  currentStockRate?: number,
  currentStockAmount?: number
}): Promise<StockItem> {
  const res = await api.put(`${API_CONFIG.stock.updateItem}`, payload);
  return res.data.data;
}

export async function fetchUnits(): Promise<StockCategory[]> {
  const res = await api.get(API_CONFIG.stock.units);
  return res.data.data.units || [];
}

export const addUnit = (unitData: { name: string }) => {
  return api.post(API_CONFIG.stock.units, unitData);
};
export const deleteUnit = (unitId: { unitId: string }) => {
  return api.delete(`${API_CONFIG.stock.units}?unitId=${unitId}`);
};
