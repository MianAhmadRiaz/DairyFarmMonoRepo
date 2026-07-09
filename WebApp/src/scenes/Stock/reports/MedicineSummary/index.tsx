import React from 'react';
import { useTranslation } from 'react-i18next';
import CategorySummaryReport from '../CategorySummaryReport';

const MedicineSummary: React.FC = () => {
  const { t } = useTranslation();
  return (
    <CategorySummaryReport
      title={t('stock.medicineSummary.title')}
      categoryName="medicine"
      typeLabel={t('stock.medicineSummary.typeLabel')}
    />
  );
};

export default MedicineSummary;
