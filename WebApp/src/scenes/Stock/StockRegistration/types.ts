// Stock Registration Types

export interface StockFormValues {
  name: string;
  description: string;
  categoryId: string;
  unit_of_measure: string;
  reorder_level: string;
  isStockItem: boolean;
}

export interface SnackbarState {
  open: boolean;
  message: string;
  severity: 'success' | 'error';
}

export interface StockCategory {
  uuid: string;
  name: string;
  description: string;
}

export interface Unit {
  uuid: string;
  name: string;
}

export interface StockItemPayload {
  name: string;
  description: string;
  categoryId: string;
  unitId: string;
  reorder_level: number;
}

export interface CategoryPayload {
  name: string;
  description: string;
}

export interface UnitPayload {
  name: string;
}
