import React from 'react';
import CategoryStockInventory from '../shared/CategoryStockInventory';

const OtherStock: React.FC = () => (
  <CategoryStockInventory
    title="Other Stock Inventory"
    subtitle="Manage other stock items"
    otherCategories
  />
);

export default OtherStock;
