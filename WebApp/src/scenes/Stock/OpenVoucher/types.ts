// Open Voucher Types

export interface StockItemWithTotal {
  uuid: string;
  name: string;
  description: string;
  farmId: string;
  categoryId: string;
  category_name: string;
  unit_of_measure: string;
  reorder_level: number;
  currentStockQuantity?: number;
  currentStockRate?: number;
  currentStockAmount?: number;
  total: number;
  stockLevel?: {
    quantity: number
  };
}

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
  currentStockQuantity?: number;
  currentStockRate?: number;
  currentStockAmount?: number;
}

export interface PaginatedResponse {
  items: StockItem[];
  page: number;
  totalPages: number;
  limit: number;
  skip: number;
  totalCount: number;
}
