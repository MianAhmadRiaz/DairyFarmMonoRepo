import React, { useState, useEffect } from 'react';
import { Box, Paper, Typography, TextField, Button, Snackbar, Alert, useMediaQuery, useTheme } from '@mui/material';
import PageContainer from '../../../../../shared/components/Layout/PageContainer';
import { fetchStockCategories, fetchStockItems } from '../../../../../shared/services/stock.services';
import ConsumptionTable, { ConsumptionItem } from '../../../../../shared/components/ConsumptionTable';
import { addMedicineConsumption } from '../../../../../shared/services/feeding.services';

import { StockItemResponse ,ConsumptionPayload} from '../../types';
const AddMedicineConsumption: React.FC = () => {
   const theme = useTheme();
   const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [date, setDate] = useState('2025-04-15');
  const [medicines, setMedicines] = useState<ConsumptionItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });
  const fetchMedicines = async (pageNumber: number, limit: number) => {
    try {
      setLoading(true);
      setError(null);
      const categories = await fetchStockCategories();
      const medicineCategory = categories?.find(item => item.name.toLowerCase() === "medicine");
      
      if (!medicineCategory?.uuid) {
        throw new Error('Medicine category not found');
      }

      const response = await fetchStockItems(pageNumber + 1, limit, medicineCategory.uuid);
      
      const medicineItems: ConsumptionItem[] = response.data.items.map((item: StockItemResponse) => ({
        id: item.uuid,
        name: item.name,
        unit: item.unit_of_measure,
        quantity: '',
        selected: false,
        totalQty: item.stockLevel?.quantity

      }));

      setMedicines(medicineItems);
      setTotalCount(response.data.totalCount);
    } catch (err) {
      setError('Failed to fetch medicines. Please try again.');
      console.error('Error fetching medicines:', err);

      
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedicines(page, rowsPerPage);
  }, [page, rowsPerPage]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleQuantityChange = (id: string, value: string) => {
    setMedicines(prevMedicines =>
      prevMedicines.map(medicine =>
        medicine.id === id ? { ...medicine, quantity: value } : medicine
      )
    );
  };
  const handleSnackbarClose = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };
  const handleSelectionChange = (id: string) => {
    setMedicines(prevMedicines =>
      prevMedicines.map(medicine =>
        medicine.id === id ? { ...medicine, selected: !medicine.selected } : medicine
      )
    );
  };

  const handleSave = async () => {
    try {
      const selectedMedicines = medicines.filter(medicine => medicine.selected);
      
      if (selectedMedicines.length === 0) {
        setError('Please select at least one medicine');
        return;
      }

      const payload: ConsumptionPayload = {
        date,
        items: selectedMedicines.map(medicine => ({
          itemId: medicine.id,
          quantity: parseFloat(medicine.quantity) || 0
        }))
      };

      const invalidItems = payload.items.filter(item => item.quantity <= 0);
      if (invalidItems.length > 0) {
        setError('Please enter valid quantities for all selected medicines');
        return;
      }
      console.log('🚀 ~ handleSave ~ payload:', payload)

      const response = await addMedicineConsumption(payload);
   
      
      setSnackbar({
        open: true,
        message: response?.data?.message,
        severity: 'success'
      });
      setMedicines(prevMedicines =>
        prevMedicines.map(medicine => ({
          ...medicine,
          selected: false,
          quantity: ''
        }))
      );

      fetchMedicines(page, rowsPerPage);
    } catch (err) {
      setError('Failed to save medicine consumption. Please try again.');
      console.error('Error saving medicine consumption:', err);
      setSnackbar({
        open: true,
        message: err?.response?.data?.message,
        severity: 'error'
      });
    }
  };
  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  return (
    <PageContainer title="Medicine Consumption" subtitle={`Total Products: ${totalCount}`}>
      <Paper
        elevation={3} 
        sx={{ 
     
          borderRadius: '8px',
          width: '100%',
          overflowX: 'auto'
        }}
      >
        <Box 
          sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between', 
            alignItems: { xs: 'flex-start', sm: 'center' },
            gap: { xs: 2, sm: 0 },
            mb: 2,
            // backgroundColor: '#f8f9fa',
            p: { xs: 1, sm: 3},
            borderRadius: '8px'
          }}
        >
         <Box
  sx={{
    width: '100%',
    display: 'flex',
    justifyContent: 'flex-end', 
  }}
>
          <Box 
            sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', sm: 'row' },
              gap: 2,
              width: { xs: '100%', sm: 'auto' }
            }}
          >
            <TextField
              type="date"
              label="Date"
              size="small"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ 
                width: { xs: '100%', sm: '250px' },
                mr: { xs: 0, sm: '10px' }
              }}
            />
            <Button
              variant="contained"
              onClick={handleSave}
              fullWidth={isMobile}
              sx={{
                backgroundColor: '#005f73',
                '&:hover': {
                  backgroundColor: '#ffffff',
                  color: '#005f73',
                  border: '1px solid #005f73'
                }
              }}
            >
              Save Consumption
            </Button>
          </Box>
        </Box>
       </Box>
        <ConsumptionTable
          items={medicines}
          totalCount={totalCount}
          page={page}
          rowsPerPage={rowsPerPage}
          loading={loading}
          error={error}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          onQuantityChange={handleQuantityChange}
          onSelectionChange={handleSelectionChange}
        />
      </Paper>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </PageContainer>
  );
};

export default AddMedicineConsumption;
