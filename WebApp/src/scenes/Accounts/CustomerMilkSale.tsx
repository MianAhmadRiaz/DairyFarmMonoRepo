import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  useTheme,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Alert,
  Snackbar,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import SearchIcon from '@mui/icons-material/Search';
import SettingsIcon from '@mui/icons-material/Settings';
import { useTranslation } from 'react-i18next';
import { tokens } from '../../shared/theme/theme';
import PageContainer from '../../shared/components/Layout/PageContainer';

interface MilkSaleRow {
  id: number;
  customer: string;
  quantity: string;
  rate: string;
  total: number;
}

export default function CustomerMilkSale() {
  const { t } = useTranslation();
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const pageBg = theme.palette.mode === 'dark' ? colors.primary[500] : '#F5FAF7';

  // State management
  const [date, setDate] = useState('2025-04-29');
  const [searchTerm, setSearchTerm] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  // Sample milk sales data matching the screenshot
  const [milkSales, setMilkSales] = useState<MilkSaleRow[]>([
    { id: 1, customer: 'Home Milk', quantity: '12.5', rate: '145', total: 1812.5 },
    { id: 2, customer: 'Milk Sale (Antibiotic Milk)', quantity: '19.51', rate: '94', total: 1833.94 },
    { id: 3, customer: 'Mess Kitchen Milk', quantity: '29.3', rate: '145', total: 4248.5 },
    { id: 4, customer: 'M Asif (Shed) (Milk)', quantity: '4.5', rate: '145', total: 652.5 },
    { id: 5, customer: 'Faraz Haider (Milk)', quantity: '2.5', rate: '145', total: 362.5 },
    { id: 6, customer: 'Aurangzaib Khan Ghazikhanana (Milk Customer)', quantity: '5', rate: '150', total: 750 },
    { id: 7, customer: 'Waqas Ahmad (Milk Customer)', quantity: '4', rate: '150', total: 600 },
    { id: 8, customer: 'Milk Sale (Cash Milk Customer)', quantity: '', rate: '160', total: 0 },
    { id: 9, customer: 'Mazhara Bibi (Milk)', quantity: '1', rate: '145', total: 145 }
  ]);

  // Calculate totals
  const totalQuantity = milkSales.reduce((sum, row) => sum + (parseFloat(row.quantity) || 0), 0);
  const totalAmount = milkSales.reduce((sum, row) => sum + row.total, 0);

  // Update milk sale row
  const updateMilkSale = (id: number, field: 'quantity' | 'rate', value: string) => {
    setMilkSales(milkSales.map(row => {
      if (row.id === id) {
        const updatedRow = { ...row, [field]: value };
        
        // Recalculate total
        const quantity = parseFloat(field === 'quantity' ? value : updatedRow.quantity) || 0;
        const rate = parseFloat(field === 'rate' ? value : updatedRow.rate) || 0;
        updatedRow.total = quantity * rate;
        
        return updatedRow;
      }
      return row;
    }));
  };

  // Handle save
  const handleSave = () => {
    setSnackbar({ open: true, message: t('accounts.customerMilkSale.saveSuccess'), severity: 'success' });
  };

  // Filter sales based on search term
  const filteredSales = milkSales.filter(sale =>
    sale.customer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <PageContainer title={t('accounts.customerMilkSale.title')}>
        {/* Main Card */}
        <Paper elevation={0} sx={{ p: 0, borderRadius: 2, border: `1px solid ${theme.palette.divider}`, bgcolor: 'background.paper' }}>
          
          {/* Light Header - matching AddAnimal screen style */}
          <Box
            sx={{
              bgcolor: theme.palette.mode === 'dark' ? colors.primary[400] : '#F4F8F7',
              color: '#005f73',
              px: 2.5,
              py: 1.5,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: `1px solid ${theme.palette.divider}`,
            }}
          >
            <Typography variant="h6" fontWeight={600} sx={{ display: 'flex', alignItems: 'center' }}>
              <Box component="span" sx={{ mr: 1 }}>🥛</Box>
              {t('accounts.customerMilkSale.title')}
            </Typography>
            <Stack direction="row" spacing={2} alignItems="center">
              <TextField
                size="small"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                sx={{ 
                  bgcolor: theme.palette.background.paper,
                  '& .MuiInputBase-input': {
                    py: 1,
                    px: 2
                  }
                }}
              />
              <Button
                variant="contained"
                onClick={handleSave}
                startIcon={<SaveIcon />}
                sx={{ 
                  backgroundColor: "#4CAF50", 
                  color: "#ffffff",
                  textTransform: 'none',
                  '&:hover': {
                    backgroundColor: '#45a049',
                  }
                }}
              >
                {t('common.save')}
              </Button>
              <IconButton sx={{ color: '#FF9800' }}>
                <SettingsIcon />
              </IconButton>
            </Stack>
          </Box>

          {/* Form Content */}
          <Box sx={{ p: 3, bgcolor: theme.palette.mode === 'dark' ? colors.primary[400] : '#F4F8F7' }}>
            {/* Search Bar */}
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end' }}>
              <TextField
                size="small"
                placeholder={t('accounts.common.searchLabel')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ color: 'gray', mr: 1 }} />
                }}
                sx={{ 
                  bgcolor: theme.palette.background.paper,
                  minWidth: 250
                }}
              />
            </Box>

            {/* Milk Sales Table */}
            <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #E0E0E0' }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: '#F5F5F5' }}>
                    <TableCell sx={{ fontWeight: 600, border: '1px solid #E0E0E0', width: '60px' }}>#</TableCell>
                    <TableCell sx={{ fontWeight: 600, border: '1px solid #E0E0E0' }}>{t('accounts.common.customer')}</TableCell>
                    <TableCell sx={{ fontWeight: 600, border: '1px solid #E0E0E0', textAlign: 'center' }} colSpan={2}>
                      {t('accounts.customerMilkSale.milk')}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, border: '1px solid #E0E0E0', width: '100px' }}></TableCell>
                  </TableRow>
                  <TableRow sx={{ bgcolor: '#F5F5F5' }}>
                    <TableCell sx={{ border: '1px solid #E0E0E0' }}></TableCell>
                    <TableCell sx={{ border: '1px solid #E0E0E0' }}></TableCell>
                    <TableCell sx={{ fontWeight: 600, border: '1px solid #E0E0E0', textAlign: 'center', width: '120px' }}>
                      {t('accounts.customerMilkSale.quantity')}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, border: '1px solid #E0E0E0', textAlign: 'center', width: '120px' }}>
                      {t('accounts.customerMilkSale.rate')}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, border: '1px solid #E0E0E0', width: '100px' }}></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredSales.map((row, index) => (
                    <TableRow 
                      key={row.id}
                      sx={{
                        bgcolor: row.customer.includes('Home Milk') || 
                               row.customer.includes('Milk Sale (Antibiotic Milk)') ||
                               row.customer.includes('Mess Kitchen Milk') ||
                               row.customer.includes('M Asif') ||
                               row.customer.includes('Faraz Haider') ||
                               row.customer.includes('Waqas Ahmad') ||
                               row.customer.includes('Mazhara Bibi')
                               ? (theme.palette.mode === 'dark' ? colors.greenAccent[800] : '#C8E6C9') : theme.palette.background.paper
                      }}
                    >
                      <TableCell sx={{ border: '1px solid #E0E0E0', textAlign: 'center' }}>
                        {index + 1}
                      </TableCell>
                      <TableCell sx={{ border: '1px solid #E0E0E0' }}>
                        {row.customer}
                      </TableCell>
                      <TableCell sx={{ border: '1px solid #E0E0E0', p: 0.5 }}>
                        <TextField
                          size="small"
                          type="number"
                          value={row.quantity}
                          onChange={(e) => updateMilkSale(row.id, 'quantity', e.target.value)}
                          sx={{ 
                            '& .MuiOutlinedInput-root': {
                              '& fieldset': { border: 'none' },
                            },
                            '& .MuiInputBase-input': {
                              textAlign: 'center',
                              py: 0.5
                            }
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ border: '1px solid #E0E0E0', p: 0.5 }}>
                        <TextField
                          size="small"
                          type="number"
                          value={row.rate}
                          onChange={(e) => updateMilkSale(row.id, 'rate', e.target.value)}
                          sx={{ 
                            '& .MuiOutlinedInput-root': {
                              '& fieldset': { border: 'none' },
                            },
                            '& .MuiInputBase-input': {
                              textAlign: 'center',
                              py: 0.5
                            }
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ border: '1px solid #E0E0E0' }}>
                      </TableCell>
                    </TableRow>
                  ))}
                  
                  {/* Total Row */}
                  <TableRow sx={{ bgcolor: '#F5F5F5', fontWeight: 'bold' }}>
                    <TableCell sx={{ border: '1px solid #E0E0E0', fontWeight: 600 }}>
                      {t('accounts.customerMilkSale.total')}
                    </TableCell>
                    <TableCell sx={{ border: '1px solid #E0E0E0' }}>
                    </TableCell>
                    <TableCell sx={{ border: '1px solid #E0E0E0', textAlign: 'center', fontWeight: 600 }}>
                      {totalQuantity.toFixed(2)}
                    </TableCell>
                    <TableCell sx={{ border: '1px solid #E0E0E0', textAlign: 'center', fontWeight: 600 }}>
                      0
                    </TableCell>
                    <TableCell sx={{ border: '1px solid #E0E0E0' }}>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>

            {/* Footer Info */}
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                {t('accounts.common.showingEntriesRange', { start: 1, end: filteredSales.length, total: milkSales.length })}
              </Typography>
            </Box>
          </Box>
        </Paper>

        {/* Success/Error Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
    </PageContainer>
  );
}
