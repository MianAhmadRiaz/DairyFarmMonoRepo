import React from 'react';
import { useTranslation } from 'react-i18next';
import CategoryStockInventory from '../shared/CategoryStockInventory';

const MedicationStock: React.FC = () => {
  const { t } = useTranslation();
  return (
    <CategoryStockInventory
      title={t('stock.medicationStock.title')}
      subtitle={t('stock.medicationStock.subtitle')}
      categoryName="medicine"
    />
  );
};

export default MedicationStock;
