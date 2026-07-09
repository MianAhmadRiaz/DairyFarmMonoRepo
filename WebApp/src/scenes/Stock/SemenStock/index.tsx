import React from 'react';
import { useTranslation } from 'react-i18next';
import CategoryStockInventory from '../shared/CategoryStockInventory';

const SemenStock: React.FC = () => {
  const { t } = useTranslation();
  return (
    <CategoryStockInventory
      title={t('stock.semenStock.title')}
      subtitle={t('stock.semenStock.subtitle')}
      categoryName="semen"
    />
  );
};

export default SemenStock;
