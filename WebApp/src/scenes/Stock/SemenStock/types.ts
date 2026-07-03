// Semen Stock Types

export interface SemenStockItem {
  itemName: string;
  totalBags: number;
  bagSize: number;
  unit: string;
  purchaseRate: number;
  unitPrice: number;
  quantity: number;
  amount: number;
}

export interface SemenStockProps {
  title: string;
  subtitle: string;
  data: SemenStockItem[];
  onEdit: (item: SemenStockItem) => void;
}
