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

interface StockRow {
  id: number;
  selectType: string;
  selectProduct: string;
  curQty: string;
  unit: string;
  rate: string;
  qty: string;
  total: string;
}

export default function SalesReturnTransaction() {
  const theme = useTheme();
  const pageBg = '#F5FAF7';

  // State management
  const [invoiceNo, setInvoiceNo] = useState('');
  const [transactionDate, setTransactionDate] = useState('');
  const [narration, setNarration] = useState('');
  const [customer, setCustomer] = useState('[CASH IN HAND] (111)');
  const [stockRows, setStockRows] = useState<StockRow[]>([
    { id: 1, selectType: '', selectProduct: '', curQty: '0', unit: '', rate: '0', qty: '', total: '0' }
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

  // Product types for sales returns
  const productTypes = [
    'Milk',
    'Dairy Products',
    'Cattle',
    'Feed',
    'Equipment',
    'Services',
    'Other'
  ];

  // Products by type for sales returns
  const products = {
    Milk: ['Fresh Milk', 'Buffalo Milk', 'Cow Milk', 'Organic Milk'],
    'Dairy Products': ['Butter', 'Cheese', 'Yogurt', 'Cream', 'Ghee'],
    Cattle: ['Dairy Cows', 'Bulls', 'Calves', 'Heifers', 'Pregnant Cows'],
    Feed: ['Hay Bales', 'Silage', 'Grain Mix', 'Supplements'],
    Equipment: ['Milking Equipment', 'Farm Tools', 'Containers'],
    Services: ['Breeding Service', 'Consultation', 'Transportation', 'Veterinary'],
    Other: ['Manure', 'Miscellaneous Items']
  };

  // Units
  const units = ['Liters', 'KG', 'Head', 'Bags', 'Pieces', 'Boxes', 'Tons'];

  // Customer options
  const customerOptions = [
    '[CASH IN HAND] (111)',
    'Dairy Processing Plant',
    'Local Market - ABC',
    'Restaurant Chain',
    'Individual Customer - John',
    'Wholesale Buyer',
    'Export Company',
    'Retail Store',
    'Other Customer'
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
      curQty: '0',
      unit: '',
      rate: '0',
      qty: '',
      total: '0'
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
        
        // Auto-calculate total when rate or qty changes
        if (field === 'rate' || field === 'qty') {
          const rate = parseFloat(field === 'rate' ? value : updatedRow.rate) || 0;
          const qty = parseFloat(field === 'qty' ? value : updatedRow.qty) || 0;
          updatedRow.total = (rate * qty).toString();
        }
        
        return updatedRow;
      }
      return row;
    }));
  };

  // Handle save
  const handleSave = async () => {
    if (!transactionDate) {
      setSnackbar({ open: true, message: 'Please fill in Transaction Date', severity: 'error' });
      return;
    }

    if (stockRows.some(row => !row.selectType || !row.selectProduct || !row.rate || !row.qty)) {
      setSnackbar({ open: true, message: 'Please fill in all stock information', severity: 'error' });
      return;
    }

    try {
      const cash = accounts.find(a => a.account_code === '1110') || accounts.find(a => a.account_type === 'asset');
      const revenue = accounts.find(a => a.account_code === '4100') || accounts.find(a => a.account_type === 'revenue');
      if (!cash || !revenue) {
        setSnackbar({ open: true, message: 'Cash or revenue account not configured.', severity: 'error' });
        return;
      }
      // Sales return reverses a sale: Dr Revenue, Cr Cash
      await createTransaction({
        debit_account_id: Number(revenue.id),
        credit_account_id: Number(cash.id),
        amount: grandTotal,
        transaction_type: 'expense',
        transaction_date: transactionDate,
        description: narration || `Sales Return ${invoiceNo}`.trim(),
        payment_method: 'cash'
      });
      setSnackbar({ open: true, message: 'Sales return transaction saved successfully!', severity: 'success' });
      handleReset();
    } catch (e) {
      console.error('Failed to save sales return', e);
      setSnackbar({ open: true, message: 'Failed to save sales return.', severity: 'error' });
    }
  };

  // Handle reset
  const handleReset = () => {
    setInvoiceNo('');
    setTransactionDate('');
    setNarration('');
    setCustomer('[CASH IN HAND] (111)');
    setStockRows([
      { id: 1, selectType: '', selectProduct: '', curQty: '0', unit: '', rate: '0', qty: '', total: '0' }
    ]);
    setDiscount('0');
  };

  // Handle print
  const handlePrint = () => {
    const printContent = `
      <html>
        <head>
          <title>Sales Return Transaction</title>
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
            <h2>Sales Return Transaction</h2>
            <p>Sr #: ${Math.floor(Math.random() * 100000)}</p>
            <p>Generated on ${new Date().toLocaleDateString()}</p>
          </div>
          <div class="details">
            <div class="row"><span class="label">Invoice No:</span><span class="value">${invoiceNo}</span></div>
            <div class="row"><span class="label">Transaction Date:</span><span class="value">${transactionDate}</span></div>
            <div class="row"><span class="label">Customer:</span><span class="value">${customer}</span></div>
            <div class="row"><span class="label">Narration:</span><span class="value">${narration}</span></div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Type</th>
                <th>Product</th>
                <th>Current Qty</th>
                <th>Unit</th>
                <th>Rate</th>
                <th>Return Qty</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${stockRows.map(row => `
                <tr>
                  <td>${row.selectType}</td>
                  <td>${row.selectProduct}</td>
                  <td>${row.curQty}</td>
                  <td>${row.unit}</td>
                  <td>${row.rate}</td>
                  <td>${row.qty}</td>
                  <td>${row.total}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="totals">
            <div class="total-row">Subtotal: ${subtotal}</div>
            <div class="total-row">Discount (${discount}%): ${discountAmount.toFixed(2)}</div>
            <div class="total-row grand-total">Grand Total: ${grandTotal.toFixed(2)}</div>
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
    <PageContainer title="Sales Return Transaction">
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
              <Box component="span" sx={{ mr: 1 }}>🔄</Box>
              Sales Return Transaction
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="body2" sx={{ color: '#005f73', fontWeight: 600 }}>
                Sr #: {Math.floor(Math.random() * 100)}
              </Typography>
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
                label="Invoice No"
                value={invoiceNo}
                onChange={(e) => setInvoiceNo(e.target.value)}
                size="small"
                sx={{ flex: 1 }}
              />
              <TextField
                label="Transaction Date"
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
                label="Narration"
                value={narration}
                onChange={(e) => setNarration(e.target.value)}
                multiline
                rows={1}
                size="small"
                sx={{ flex: 2 }}
              />
              <FormControl size="small" sx={{ flex: 1 }}>
                <InputLabel>Customer</InputLabel>
                <Select
                  value={customer}
                  onChange={(e) => setCustomer(e.target.value)}
                  label="Customer"
                >
                  {customerOptions.map((cust, index) => (
                    <MenuItem key={index} value={cust}>{cust}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>

            {/* Stock Information Section */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ color: '#005f73', mb: 2, display: 'flex', alignItems: 'center', fontWeight: 'bold' }}>
                📦 Stock Information
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
                  Add more items...
                </Button>
              </Box>

              {/* Table Header */}
              <Box sx={{ display: 'flex', bgcolor: '#F5F5F5', p: 1, borderRadius: '4px 4px 0 0', border: '1px solid #E0E0E0' }}>
                <Typography variant="body2" fontWeight={600} sx={{ flex: 1, px: 1 }}>Select Type</Typography>
                <Typography variant="body2" fontWeight={600} sx={{ flex: 2, px: 1 }}>Select Product</Typography>
                <Typography variant="body2" fontWeight={600} sx={{ flex: 1, px: 1 }}>Cur Qty</Typography>
                <Typography variant="body2" fontWeight={600} sx={{ flex: 1, px: 1 }}>Unit</Typography>
                <Typography variant="body2" fontWeight={600} sx={{ flex: 1, px: 1 }}>Rate</Typography>
                <Typography variant="body2" fontWeight={600} sx={{ flex: 1, px: 1 }}>Qty</Typography>
                <Typography variant="body2" fontWeight={600} sx={{ flex: 1, px: 1 }}>Total</Typography>
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
                      <MenuItem value="">Select Type</MenuItem>
                      {productTypes.map((type, index) => (
                        <MenuItem key={index} value={type}>{type}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  
                  <FormControl size="small" sx={{ flex: 2, mr: 1 }}>
                    <Select
                      value={row.selectProduct}
                      onChange={(e) => updateStockRow(row.id, 'selectProduct', e.target.value)}
                      displayEmpty
                    >
                      <MenuItem value="">Select Product</MenuItem>
                      {row.selectType && products[row.selectType as keyof typeof products]?.map((product, index) => (
                        <MenuItem key={index} value={product}>{product}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  
                  <TextField
                    size="small"
                    type="number"
                    value={row.curQty}
                    onChange={(e) => updateStockRow(row.id, 'curQty', e.target.value)}
                    sx={{ flex: 1, mr: 1 }}
                  />
                  
                  <FormControl size="small" sx={{ flex: 1, mr: 1 }}>
                    <Select
                      value={row.unit}
                      onChange={(e) => updateStockRow(row.id, 'unit', e.target.value)}
                      displayEmpty
                    >
                      <MenuItem value="">Unit</MenuItem>
                      {units.map((unit, index) => (
                        <MenuItem key={index} value={unit}>{unit}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  
                  <TextField
                    size="small"
                    type="number"
                    value={row.rate}
                    onChange={(e) => updateStockRow(row.id, 'rate', e.target.value)}
                    sx={{ flex: 1, mr: 1 }}
                  />
                  
                  <TextField
                    size="small"
                    type="number"
                    value={row.qty}
                    onChange={(e) => updateStockRow(row.id, 'qty', e.target.value)}
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
                    Total: {subtotal}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2">Discount:</Typography>
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
                    Grand Total: {grandTotal.toFixed(2)}
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
                💾 Save Changes
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
                🔄 Reset
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
