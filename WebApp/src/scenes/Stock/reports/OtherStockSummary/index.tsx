import React from 'react';
import { useTranslation } from 'react-i18next';
import CategorySummaryReport from '../CategorySummaryReport';

const OtherStockSummary: React.FC = () => {
  const { t } = useTranslation();
  return (
    <CategorySummaryReport
      title={t('stock.otherStockSummary.title')}
      typeLabel={t('stock.otherStockSummary.typeLabel')}
    />
  );
};

export default OtherStockSummary;
