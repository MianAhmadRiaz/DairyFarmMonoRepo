// Common types for consumption components
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
  currentStockRate?: number;
  currentStockAmount?: number;
}
export interface FeedCostItem {
  itemId: string;
  total_quantity: string;
  'item.name': string;
  'item.stockLevel.uuid': string;
  'item.stockLevel.price': number;
  'item.stockLevel.itemId': string;
}
export interface ConsumptionItem {
  id: string;
  name: string;
  unit: string;
  quantity: string;
  selected: boolean;
}

export interface ConsumptionPayload {
  date: string;
  items: {
    itemId: string,
    quantity: number
  }[];
}

export interface ConsumptionTableProps {
  items: ConsumptionItem[];
  totalCount: number;
  page: number;
  rowsPerPage: number;
  loading: boolean;
  error: string | null;
  onPageChange: (event: unknown, newPage: number) => void;
  onRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onQuantityChange: (id: string, value: string) => void;
  onSelectionChange: (id: string) => void;
}

export interface FeedingConsumptionState {
  date: string;
  medicines: ConsumptionItem[];
  loading: boolean;
  error: string | null;
  page: number;
  rowsPerPage: number;
  totalCount: number;
  snackbar: {
    open: boolean,
    message: string,
    severity: 'success' | 'error'
  };
}

export interface MedicineConsumptionState extends FeedingConsumptionState {}

export interface OtherConsumptionState extends FeedingConsumptionState {}

export interface SemenConsumptionState extends FeedingConsumptionState {}
