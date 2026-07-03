export interface FeedCostItem {
  itemId: string;
  total_quantity: string;
  'item.name': string;
  'item.stockLevel.uuid': string;
  'item.stockLevel.price': number;
  'item.stockLevel.itemId': string;
}
