export interface ConsumptionItem {
  itemId: string;
  itemName: string;
  day: string;
  total_quantity: number;
}

export interface ConsumptionData {
  [key: string]: ConsumptionItem[];
}
