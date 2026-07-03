// Medication Stock Types

export interface MedicationStockItem {
  itemName: string;
  totalBags: number;
  bagSize: number;
  unit: string;
  purchaseRate: number;
  unitPrice: number;
  quantity: number;
  amount: number;
}

export interface MedicationStockProps {
  title: string;
  subtitle: string;
  data: MedicationStockItem[];
  onEdit: (item: MedicationStockItem) => void;
}
