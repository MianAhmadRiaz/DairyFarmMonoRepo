import React, { useState } from 'react';
import AnimalWiseCostTable from '../../../../shared/components/AnimalWiseCostTable';
import { Box, Alert } from '@mui/material';
import { useTranslation } from 'react-i18next';

const AnimalWiseCost: React.FC = () => {
  const { t } = useTranslation();
  const [startDate, setStartDate] = useState('2025-04-14');
  const [endDate, setEndDate] = useState('2025-04-14');

  const animalCostData = [
    {
      id: 1,
      tagId: '0001',
      animalStatus: 'Milking & Pregnant',
      animalSex: 'Female',
      itemCode: '',
      itemName: 'Canola Meal (Kg)(کنولا)',
      category: 'Feeding',
      days: 1,
      qty: 2,
      rate: 128,
      amount: 256
    },
    {
      id: 2,
      tagId: '0001',
      animalStatus: 'Milking & Pregnant',
      animalSex: 'Female',
      itemCode: '',
      itemName: 'DCP (Kg) [25Kg] (ڈی سی پی)',
      category: 'Feeding',
      days: 1,
      qty: 0.07,
      rate: 168,
      amount: 11.76
    },
    {
      id: 3,
      tagId: '0001',
      animalStatus: 'Milking & Pregnant',
      animalSex: 'Female',
      itemCode: '',
      itemName: 'Molasses (Kg) (شیرہ)',
      category: 'Feeding',
      days: 1,
      qty: 1.6,
      rate: 40,
      amount: 64
    }
  ];

  const handleDateChange = (newStartDate: string, newEndDate: string) => {
    setStartDate(newStartDate);
    setEndDate(newEndDate);
    // Here you would typically fetch new data based on the date range
  };

  return (
    <Box
      sx={{
        ml: { xs: '6px', sm: '6px', md: '320px' },
        mr: { xs: 2, sm: 4 },
        mt: 2,
        mb: 4,
        width: { xs: 'calc(100% - 12px)', sm: 'auto' }
      }}
    >
      <Alert severity="warning" sx={{ mb: 2 }}>
        {t('stock.common.reportNotConnected')}
      </Alert>
      <AnimalWiseCostTable
        data={animalCostData}
        startDate={startDate}
        endDate={endDate}
        onDateChange={handleDateChange}
      />
    </Box>
  );
};

export default AnimalWiseCost;
