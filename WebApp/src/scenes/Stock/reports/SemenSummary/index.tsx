import React from 'react';
import { useTranslation } from 'react-i18next';
import CategorySummaryReport from '../CategorySummaryReport';

const SemenSummary: React.FC = () => {
  const { t } = useTranslation();
  return (
    <CategorySummaryReport
      title={t('stock.semenSummary.title')}
      categoryName="semen"
      typeLabel={t('stock.semenSummary.typeLabel')}
    />
  );
};

export default SemenSummary;
