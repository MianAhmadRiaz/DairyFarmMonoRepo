// Stock Form Types
export interface StockFormValues {
  productName: string;
  head: string;
  unit: string;
  isStockItem: boolean;
  openingStockQuantity: string;
  openingStockRate: string;
  openingStockAmount: string;
  currentStockQuantity: string;
  currentStockRate: string;
  currentStockAmount: string;
}

// Stock Item Types
export interface StockItem {
  id: number;
  name: string;
  type: string;
  unit: string;
  ratePerUnit: number;
  isStockItem: boolean;
  isStockAsset: boolean;
  status: 'Enabled' | 'Disabled';
}

// Stock Head Types
export interface StockHead {
  id: string;
  name: string;
  description?: string;
}

// Stock Unit Types
export interface StockUnit {
  id: string;
  name: string;
  symbol: string;
  description?: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Stock Registration API Types
export interface StockRegistrationRequest {
  productName: string;
  head: string;
  unit: string;
  isStockItem: boolean;
  openingStockQuantity: number;
  openingStockRate: number;
  openingStockAmount: number;
  currentStockQuantity: number;
  currentStockRate: number;
  currentStockAmount: number;
}

// Stock Update API Types
export interface StockUpdateRequest extends StockRegistrationRequest {
  id: string;
}

// Stock List API Types
export interface StockListResponse {
  items: StockItem[];
  total: number;
  page: number;
  limit: number;
}

// Stock Head List API Types
export interface StockHeadListResponse {
  items: StockHead[];
  total: number;
}

// Stock Unit List API Types
export interface StockUnitListResponse {
  items: StockUnit[];
  total: number;
}
