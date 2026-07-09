import React from 'react';
import { useTranslation } from 'react-i18next';
import CategoryStockInventory from '../shared/CategoryStockInventory';

const OtherStock: React.FC = () => {
  const { t } = useTranslation();
  return (
    <CategoryStockInventory
      title={t('stock.otherStock.title')}
      subtitle={t('stock.otherStock.subtitle')}
      otherCategories
    />
  );
};

export default OtherStock;
