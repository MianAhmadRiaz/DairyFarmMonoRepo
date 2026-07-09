import React from 'react';
import { useTranslation } from 'react-i18next';
import CategoryStockInventory from '../shared/CategoryStockInventory';

const FeedingStock: React.FC = () => {
  const { t } = useTranslation();
  return (
    <CategoryStockInventory
      title={t('stock.feedingStock.title')}
      subtitle={t('stock.feedingStock.subtitle')}
      categoryName="feeding"
    />
  );
};

export default FeedingStock;
