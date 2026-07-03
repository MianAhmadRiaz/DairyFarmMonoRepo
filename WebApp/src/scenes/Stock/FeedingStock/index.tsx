import React from 'react';
import CategoryStockInventory from '../shared/CategoryStockInventory';

const FeedingStock: React.FC = () => (
  <CategoryStockInventory
    title="Feeding Stock Inventory"
    subtitle="Manage feeding stock items"
    categoryName="feeding"
  />
);

export default FeedingStock;
