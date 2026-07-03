// Other Stock Types

export interface OtherStockItem {
  itemName: string;
  totalBags: number;
  bagSize: number;
  unit: string;
  purchaseRate: number;
  unitPrice: number;
  quantity: number;
  amount: number;
}

export interface OtherStockProps {
  title: string;
  subtitle: string;
  data: OtherStockItem[];
  onEdit: (item: OtherStockItem) => void;
}
