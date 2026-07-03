import React from 'react';
import CategoryStockInventory from '../shared/CategoryStockInventory';

const MedicationStock: React.FC = () => (
  <CategoryStockInventory
    title="Medication Stock Inventory"
    subtitle="Manage medication stock items"
    categoryName="medicine"
  />
);

export default MedicationStock;
