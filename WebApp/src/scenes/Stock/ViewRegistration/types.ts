// View Registration Types

export type FilterCategory = 'type' | 'unit' | 'stockItem' | 'stockAsset';

export interface StockItemResponse {
  uuid: string;
  name: string;
  description: string;
  farmId: string;
  categoryId: string;
  category_name: string;
  unit_of_measure: string;
  reorder_level: number;
  currentStockQuantity?: number;
  currentStockRate?: any;
  currentStockAmount?: number;
  createdBy?: string;
  updatedBy?: string;
  isDeleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
}

export interface PaginatedResponse {
  items: StockItemResponse[];
  page: number;
  totalPages: number;
  limit: number;
  skip: number;
  totalCount: number;
}

export interface FilterState {
  type: string[];
  unit: string[];
  stockItem: string[];
  stockAsset: string[];
}

export interface SnackbarState {
  open: boolean;
  message: string;
  severity: 'success' | 'error';
}

export interface UpdateStockItemPayload {
  name: string;
  itemId: string;
  unitId: string;
  price: number;
  categoryId: string;
  reorder_level: number;
}
