import React from 'react';
import StockInventoryTable from '../StockInventoryTable';
import PageContainer from '../../../shared/components/Layout/PageContainer';

export interface StockItem {
  itemName: string;
  unit: string;
  purchaseRate: number;
  unitPrice: number;
  quantity: number;
  reorderLevel: number;
  amount: number;
}

interface GlobalStockInventoryProps {
  title: string;
  subtitle: string;
  data: StockItem[];
  onEdit?: (item: StockItem) => void;
}

const GlobalStockInventory: React.FC<GlobalStockInventoryProps> = ({
  title,
  subtitle,
  data,
  onEdit
}) => {
  const handleEdit = (item: StockItem) => {
    if (onEdit) {
      onEdit(item);
    }
  };

  return (
    <PageContainer title={title} subtitle={subtitle}>
      <StockInventoryTable title={title} data={data} onEdit={handleEdit} />
    </PageContainer>
  );
};

export default GlobalStockInventory;
