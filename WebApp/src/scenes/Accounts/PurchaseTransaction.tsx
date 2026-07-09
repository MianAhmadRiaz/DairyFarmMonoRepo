import React, { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  useTheme,
  Stack,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Alert,
  Snackbar,
} from '@mui/material';
import PrintIcon from '@mui/icons-material/Print';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import {
  fetchChartOfAccounts,
  createTransaction,
  ChartAccount
} from '../../shared/services/finance.service';
import PageContainer from '../../shared/components/Layout/PageContainer';
import { useTranslation } from 'react-i18next';

interface StockRow {
  id: number;
  selectType: string;
  selectProduct: string;
  unit: string;
  rate: string;
  quantity: string;
  total: string;
}

export default function PurchaseTransaction() {
  const { t } = useTranslation();
  const theme = useTheme();
  const pageBg = '#F5FAF7';

  // State management
  const [invoiceNo, setInvoiceNo] = useState('');
  const [transactionDate, setTransactionDate] = useState('');
  const [narration, setNarration] = useState('');
  const [vendorCash, setVendorCash] = useState('[CASH IN HAND] (111)');
  const [stockRows, setStockRows] = useState<StockRow[]>([
    { id: 1, selectType: '', selectProduct: '', unit: '', rate: '', quantity: '', total: '' }
  ]);
  const [discount, setDiscount] = useState('0');
  const [accounts, setAccounts] = useState<ChartAccount[]>([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  useEffect(() => {
    (async () => {
      try {
        const list = await fetchChartOfAccounts({ isActive: 'true' });
        setAccounts(list);
      } catch (e) {
        console.error('Failed to load accounts', e);
      }
    })();
  }, []);

  // Product types
  const productTypes = [
    'Feed',
    'Medicine',
    'Equipment',
    'Supplies',
    'Services',
    'Livestock',
    'Other'
  ];

  // Products by type
  const products = {
    Feed: ['Wheat Bran', 'Rice Bran', 'Corn', 'Soybean Meal', 'Alfalfa Hay', 'Silage'],
    Medicine: ['Antibiotics', 'Vaccines', 'Dewormers', 'Vitamins', 'Pain Relief', 'Antiseptics'],
    Equipment: ['Milking Machine', 'Feed Mixer', 'Water Troughs', 'Fencing', 'Tools'],
    Supplies: ['Bedding', 'Cleaning Supplies', 'Containers', 'Tags', 'Ropes'],
    Services: ['Veterinary Service', 'Transportation', 'Labor', 'Consultation'],
    Livestock: ['Dairy Cows', 'Bulls', 'Calves', 'Heifers'],
    Other: ['Miscellaneous Items']
  };

  // Units
  const units = ['KG', 'Liters', 'Bags', 'Pieces', 'Boxes', 'Tons', 'Meters'];

  // Vendor/Cash options
  const vendorOptions = [
    '[CASH IN HAND] (111)',
    'Feed Supplier - ABC Farm',
    'Medicine Supplier - VetCare',
    'Equipment Dealer - AgriTools',
    'Local Farmer - John Doe',
    'Transport Service',
    'Veterinary Clinic',
    'Other Vendor'
  ];

  // Calculate totals
  const subtotal = stockRows.reduce((sum, row) => {
    const total = parseFloat(row.total) || 0;
    return sum + total;
  }, 0);

  const discountAmount = (subtotal * parseFloat(discount)) / 100;
  const grandTotal = subtotal - discountAmount;

  // Add new stock row
  const addStockRow = () => {
    const newRow: StockRow = {
      id: Date.now(),
      selectType: '',
      selectProduct: '',
      unit: '',
      rate: '',
      quantity: '',
      total: ''
    };
    setStockRows([...stockRows, newRow]);
  };

  // Remove stock row
  const removeStockRow = (id: number) => {
    if (stockRows.length > 1) {
      setStockRows(stockRows.filter(row => row.id !== id));
    }
  };

  // Update stock row
  const updateStockRow = (id: number, field: keyof StockRow, value: string) => {
    setStockRows(stockRows.map(row => {
      if (row.id === id) {
        const updatedRow = { ...row, [field]: value };
        
        // Auto-calculate total when rate or quantity changes
        if (field === 'rate' || field === 'quantity') {
          const rate = parseFloat(field === 'rate' ? value : updatedRow.rate) || 0;
          const quantity = parseFloat(field === 'quantity' ? value : updatedRow.quantity) || 0;
          updatedRow.total = (rate * quantity).toString();
        }
        
        return updatedRow;
      }
      return row;
    }));
  };

  // Handle save
  const handleSave = async () => {
    if (!transactionDate) {
      setSnackbar({ open: true, message: t('accounts.common.fillTransactionDate'), severity: 'error' });
      return;
    }

    if (stockRows.some(row => !row.selectType || !row.selectProduct || !row.rate || !row.quantity)) {
      setSnackbar({ open: true, message: t('accounts.common.fillAllStockInfo'), severity: 'error' });
      return;
    }

    try {
      const cash = accounts.find(a => a.account_code === '1110') || accounts.find(a => a.account_type === 'asset');
      const expense = accounts.find(a => a.account_code === '5700') || accounts.find(a => a.account_type === 'expense');
      if (!cash || !expense) {
        setSnackbar({ open: true, message: t('accounts.common.cashOrExpenseNotConfigured'), severity: 'error' });
        return;
      }
      await createTransaction({
        debit_account_id: Number(expense.id),
        credit_account_id: Number(cash.id),
        amount: grandTotal,
        transaction_type: 'expense',
        transaction_date: transactionDate,
        description: narration || `Purchase ${invoiceNo}`.trim(),
        payment_method: 'cash'
      });
      setSnackbar({ open: true, message: t('accounts.purchaseTransaction.saveSuccess'), severity: 'success' });
      handleReset();
    } catch (e) {
      console.error('Failed to save purchase transaction', e);
      setSnackbar({ open: true, message: t('accounts.purchaseTransaction.saveError'), severity: 'error' });
    }
  };

  // Handle reset
  const handleReset = () => {
    setInvoiceNo('');
    setTransactionDate('');
    setNarration('');
    setVendorCash('[CASH IN HAND] (111)');
    setStockRows([
      { id: 1, selectType: '', selectProduct: '', unit: '', rate: '', quantity: '', total: '' }
    ]);
    setDiscount('0');
  };

  // Handle print
  const handlePrint = () => {
    const printContent = `
      <html>
        <head>
          <title>${t('accounts.purchaseTransaction.title')}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #005f73; padding-bottom: 10px; }
            .details { margin: 20px 0; }
            .row { display: flex; margin-bottom: 10px; }
            .label { font-weight: bold; width: 150px; }
            .value { color: #333; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .totals { margin-top: 20px; text-align: right; }
            .total-row { display: flex; justify-content: space-between; margin: 5px 0; }
            .grand-total { font-weight: bold; font-size: 18px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>${t('accounts.purchaseTransaction.title')}</h2>
            <p>${t('accounts.common.generatedOn', { date: new Date().toLocaleDateString() })}</p>
          </div>
          <div class="details">
            <div class="row"><span class="label">${t('accounts.common.invoiceNo')}:</span><span class="value">${invoiceNo}</span></div>
            <div class="row"><span class="label">${t('accounts.common.transactionDate')}:</span><span class="value">${transactionDate}</span></div>
            <div class="row"><span class="label">${t('accounts.common.vendorCash')}:</span><span class="value">${vendorCash}</span></div>
            <div class="row"><span class="label">${t('accounts.common.narration')}:</span><span class="value">${narration}</span></div>
          </div>
          <table>
            <thead>
              <tr>
                <th>${t('accounts.common.type')}</th>
                <th>${t('accounts.common.product')}</th>
                <th>${t('accounts.common.unit')}</th>
                <th>${t('accounts.common.rate')}</th>
                <th>${t('accounts.common.quantity')}</th>
                <th>${t('accounts.common.total')}</th>
              </tr>
            </thead>
            <tbody>
              ${stockRows.map(row => `
                <tr>
                  <td>${row.selectType}</td>
                  <td>${row.selectProduct}</td>
                  <td>${row.unit}</td>
                  <td>${row.rate}</td>
                  <td>${row.quantity}</td>
                  <td>${row.total}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="totals">
            <div class="total-row">${t('accounts.common.subtotalValue', { value: subtotal })}</div>
            <div class="total-row">${t('accounts.common.discountValue', { percent: discount, value: discountAmount.toFixed(2) })}</div>
            <div class="total-row grand-total">${t('accounts.common.grandTotalValue', { value: grandTotal.toFixed(2) })}</div>
          </div>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <PageContainer title={t('accounts.purchaseTransaction.title')}>
        {/* Main Card */}
        <Paper elevation={0} sx={{ p: 0, borderRadius: 2, border: `1px solid ${theme.palette.divider}`, bgcolor: 'background.paper' }}>
          
          {/* Light Header - matching AddAnimal screen style */}
          <Box
            sx={{
              bgcolor: '#F4F8F7',
              color: '#005f73',
              px: 2.5,
              py: 1.5,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '1px solid #E0E0E0',
            }}
          >
            <Typography variant="h6" fontWeight={600} sx={{ display: 'flex', alignItems: 'center' }}>
              <Box component="span" sx={{ mr: 1 }}>🛒</Box>
              {t('accounts.purchaseTransaction.title')}
            </Typography>
            <Stack direction="row" spacing={1}>
              <IconButton size="small" onClick={handlePrint} sx={{ color: '#005f73' }}>
                <PrintIcon />
              </IconButton>
              <IconButton size="small" sx={{ color: '#005f73' }}>
                <CloseIcon />
              </IconButton>
            </Stack>
          </Box>

          {/* Form Content */}
          <Box sx={{ p: 3, bgcolor: '#F4F8F7' }}>
            {/* Top Row Fields */}
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} sx={{ mb: 3 }}>
              <TextField
                label={t('accounts.common.invoiceNo')}
                value={invoiceNo}
                onChange={(e) => setInvoiceNo(e.target.value)}
                size="small"
                sx={{ flex: 1 }}
              />
              <TextField
                label={t('accounts.common.transactionDate')}
                type="date"
                value={transactionDate}
                onChange={(e) => setTransactionDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                placeholder="DD-MM-YY"
                size="small"
                sx={{ flex: 1 }}
              />
            </Stack>

            {/* Second Row */}
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} sx={{ mb: 3 }}>
              <TextField
                label={t('accounts.common.narration')}
                value={narration}
                onChange={(e) => setNarration(e.target.value)}
                multiline
                rows={1}
                size="small"
                sx={{ flex: 2 }}
              />
              <FormControl size="small" sx={{ flex: 1 }}>
                <InputLabel>{t('accounts.common.vendorCash')}</InputLabel>
                <Select
                  value={vendorCash}
                  onChange={(e) => setVendorCash(e.target.value)}
                  label={t('accounts.common.vendorCash')}
                >
                  {vendorOptions.map((vendor, index) => (
                    <MenuItem key={index} value={vendor}>{t(`accounts.common.vendors.${vendor}`, vendor)}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>

            {/* Stock Information Section */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ color: '#005f73', mb: 2, display: 'flex', alignItems: 'center', fontWeight: 'bold' }}>
                📦 {t('accounts.common.stockInformation')}
                <Box sx={{ ml: 2 }}>
                  <Button 
                    size="small"
                    sx={{ 
                      color: '#1976d2',
                      textTransform: 'none',
                      fontSize: '0.75rem',
                      minWidth: 'auto'
                    }}
                  >
                    🆕{t('accounts.purchaseTransaction.newItemInInventory')}
                  </Button>
                </Box>
              </Typography>

              {/* Add More Items Button */}
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                <Button 
                  variant="contained"
                  onClick={addStockRow}
                  startIcon={<AddIcon />}
                  sx={{ 
                    backgroundColor: '#005f73',
                    color: '#fff',
                    textTransform: 'none',
                    fontSize: '0.75rem',
                    py: 0.5,
                    px: 2,
                    '&:hover': {
                      backgroundColor: '#004a5a',
                    }
                  }}
                >
                  {t('accounts.common.addMoreItems')}
                </Button>
              </Box>

              {/* Table Header */}
              <Box sx={{ display: 'flex', bgcolor: '#F5F5F5', p: 1, borderRadius: '4px 4px 0 0', border: '1px solid #E0E0E0' }}>
                <Typography variant="body2" fontWeight={600} sx={{ flex: 1, px: 1 }}>{t('accounts.common.selectType')}</Typography>
                <Typography variant="body2" fontWeight={600} sx={{ flex: 2, px: 1 }}>{t('accounts.common.selectProduct')}</Typography>
                <Typography variant="body2" fontWeight={600} sx={{ flex: 1, px: 1 }}>{t('accounts.common.unit')}</Typography>
                <Typography variant="body2" fontWeight={600} sx={{ flex: 1, px: 1 }}>{t('accounts.common.rate')}</Typography>
                <Typography variant="body2" fontWeight={600} sx={{ flex: 1, px: 1 }}>{t('accounts.common.quantity')}</Typography>
                <Typography variant="body2" fontWeight={600} sx={{ flex: 1, px: 1 }}>{t('accounts.common.total')}</Typography>
                <Box sx={{ width: 40 }}></Box>
              </Box>

              {/* Stock Rows */}
              {stockRows.map((row) => (
                <Box key={row.id} sx={{ display: 'flex', alignItems: 'center', border: '1px solid #E0E0E0', borderTop: 'none', p: 1 }}>
                  <FormControl size="small" sx={{ flex: 1, mr: 1 }}>
                    <Select
                      value={row.selectType}
                      onChange={(e) => updateStockRow(row.id, 'selectType', e.target.value)}
                      displayEmpty
                    >
                      <MenuItem value="">{t('accounts.common.selectType')}</MenuItem>
                      {productTypes.map((type, index) => (
                        <MenuItem key={index} value={type}>{t(`accounts.common.productTypes.${type}`, type)}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  
                  <FormControl size="small" sx={{ flex: 2, mr: 1 }}>
                    <Select
                      value={row.selectProduct}
                      onChange={(e) => updateStockRow(row.id, 'selectProduct', e.target.value)}
                      displayEmpty
                    >
                      <MenuItem value="">{t('accounts.common.selectProduct')}</MenuItem>
                      {row.selectType && products[row.selectType as keyof typeof products]?.map((product, index) => (
                        <MenuItem key={index} value={product}>{t(`accounts.common.products.${product}`, product)}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  
                  <FormControl size="small" sx={{ flex: 1, mr: 1 }}>
                    <Select
                      value={row.unit}
                      onChange={(e) => updateStockRow(row.id, 'unit', e.target.value)}
                      displayEmpty
                    >
                      <MenuItem value="">{t('accounts.common.unit')}</MenuItem>
                      {units.map((unit, index) => (
                        <MenuItem key={index} value={unit}>{t(`accounts.common.units.${unit}`, unit)}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  
                  <TextField
                    size="small"
                    type="number"
                    value={row.rate}
                    onChange={(e) => updateStockRow(row.id, 'rate', e.target.value)}
                    placeholder={t('accounts.common.rate')}
                    sx={{ flex: 1, mr: 1 }}
                  />
                  
                  <TextField
                    size="small"
                    type="number"
                    value={row.quantity}
                    onChange={(e) => updateStockRow(row.id, 'quantity', e.target.value)}
                    placeholder={t('accounts.common.qty')}
                    sx={{ flex: 1, mr: 1 }}
                  />
                  
                  <TextField
                    size="small"
                    value={row.total}
                    disabled
                    sx={{ flex: 1, mr: 1 }}
                  />
                  
                  <IconButton 
                    size="small" 
                    onClick={() => removeStockRow(row.id)}
                    disabled={stockRows.length === 1}
                    sx={{ color: '#F44336' }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              ))}

              {/* Totals Section */}
              <Box sx={{ mt: 3, p: 2, bgcolor: '#F9F9F9', borderRadius: 1 }}>
                <Stack direction="row" spacing={4} alignItems="center" justifyContent="flex-end">
                  <Typography variant="h6" fontWeight={700}>
                    {t('accounts.common.totalValue', { value: subtotal })}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2">{t('accounts.common.discountLabel')}</Typography>
                    <TextField
                      size="small"
                      type="number"
                      value={discount}
                      onChange={(e) => setDiscount(e.target.value)}
                      sx={{ width: 80 }}
                      InputProps={{
                        endAdornment: '%'
                      }}
                    />
                  </Box>
                  
                  <Typography variant="h6" fontWeight={700}>
                    {t('accounts.common.grandTotalValue', { value: grandTotal.toFixed(2) })}
                  </Typography>
                </Stack>
              </Box>
            </Box>

            {/* Action Buttons - matching AddAnimal screen */}
            <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: 2, mt: 4 }}>
              <Button
                variant="contained"
                onClick={handleSave}
                sx={{ 
                  backgroundColor: "#005f73", 
                  color: "#ffffff", 
                  padding: "7px 50px",
                  textTransform: 'none'
                }}
              >
                💾 {t('accounts.common.saveChanges')}
              </Button>
              <Button
                variant="contained"
                onClick={handleReset}
                sx={{
                  padding: "6px 40px",
                  color: '#6a757d',
                  textTransform: 'none',
                  borderRadius: '6px',
                  backgroundColor: '#CECECE',
                  '&:hover': {
                    backgroundColor: '#BDBDBD',
                  }
                }}
              >
                🔄 {t('accounts.common.reset')}
              </Button>
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
