// Common types for report components
export interface ReportFilterState {
  startDate: string;
  endDate: string;
  searchTerm: string;
  page: number;
  rowsPerPage: number;
  loading: boolean;
  error: string | null;
}

export interface ReportTableProps {
  data: any[];
  totalCount: number;
  page: number;
  rowsPerPage: number;
  loading: boolean;
  error: string | null;
  onPageChange: (event: unknown, newPage: number) => void;
  onRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

// Types for Animal Wise Cost Report
export interface AnimalCostItem {
  id: string;
  animalId: string;
  animalName: string;
  category: string;
  totalCost: number;
  details: {
    date: string,
    itemName: string,
    quantity: number,
    rate: number,
    amount: number
  }[];
}

// Types for Medicine Summary Report
export interface MedicineSummaryItem {
  id: string;
  medicineName: string;
  totalQuantity: number;
  totalAmount: number;
  details: {
    date: string,
    quantity: number,
    rate: number,
    amount: number
  }[];
}

// Types for Feeding Summary Report
export interface FeedingSummaryItem {
  id: string;
  feedName: string;
  totalQuantity: number;
  totalAmount: number;
  details: {
    date: string,
    quantity: number,
    rate: number,
    amount: number
  }[];
}

// Types for Other Stock Summary Report
export interface OtherStockSummaryItem {
  id: string;
  itemName: string;
  totalQuantity: number;
  totalAmount: number;
  details: {
    date: string,
    quantity: number,
    rate: number,
    amount: number
  }[];
}

// Types for Semen Summary Report
export interface SemenSummaryItem {
  id: string;
  semenName: string;
  totalQuantity: number;
  totalAmount: number;
  details: {
    date: string,
    quantity: number,
    rate: number,
    amount: number
  }[];
}

// Types for Stock Ledger Report
export interface StockLedgerItem {
  id: string;
  date: string;
  itemName: string;
  category: string;
  transactionType: 'IN' | 'OUT';
  quantity: number;
  rate: number;
  amount: number;
  balance: number;
}

// Types for Stock Reorder Report
export interface StockReorderItem {
  id: string;
  itemName: string;
  category: string;
  currentStock: number;
  reorderLevel: number;
  unit: string;
  lastTransactionDate: string;
}

// Types for Remaining Feed Stock Days Report
export interface RemainingFeedStockItem {
  id: string;
  feedName: string;
  currentStock: number;
  dailyConsumption: number;
  remainingDays: number;
  unit: string;
}
