import React from 'react';
import { useTranslation } from 'react-i18next';
import CategorySummaryReport from '../CategorySummaryReport';

const FeedingSummary: React.FC = () => {
  const { t } = useTranslation();
  return (
    <CategorySummaryReport
      title={t('stock.feedingSummary.title')}
      categoryName="feeding"
      typeLabel={t('stock.feedingSummary.typeLabel')}
    />
  );
};

export default FeedingSummary;
