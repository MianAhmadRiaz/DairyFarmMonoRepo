// Feeding Stock Types

export interface FeedingStockItem {
  itemName: string;
  totalBags: number;
  bagSize: number;
  unit: string;
  purchaseRate: number;
  unitPrice: number;
  quantity: number;
  amount: number;
}

export interface FeedingStockProps {
  title: string;
  subtitle: string;
  data: FeedingStockItem[];
  onEdit: (item: FeedingStockItem) => void;
}
