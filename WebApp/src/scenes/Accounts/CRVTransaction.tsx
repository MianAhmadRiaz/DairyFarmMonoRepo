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
  Divider,
  Alert,
  Snackbar,
} from '@mui/material';
import PrintIcon from '@mui/icons-material/Print';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import { tokens } from '../../shared/theme/theme';
import {
  fetchChartOfAccounts,
  createTransaction,
  ChartAccount
} from '../../shared/services/finance.service';
import PageContainer from '../../shared/components/Layout/PageContainer';

interface AccountRow {
  id: number;
  selectAccount: string;
  curBalance: string;
  accountType: string;
  amount: string;
  narration: string;
}

export default function CRVTransaction() {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const pageBg = theme.palette.mode === 'dark' ? colors.primary[500] : '#F5FAF7';

  // State management
  const [transactionDate, setTransactionDate] = useState('');
  const [invoiceNo, setInvoiceNo] = useState('');
  const [receiveIn, setReceiveIn] = useState('');
  const [accounts, setAccounts] = useState<ChartAccount[]>([]);
  const [accountRows, setAccountRows] = useState<AccountRow[]>([
    { id: 1, selectAccount: '', curBalance: '-', accountType: '', amount: '', narration: '' }
  ]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  const cashBankAccounts = accounts.filter(
    a => a.account_type === 'asset' && ['1110', '1120', '1130'].includes(a.account_code)
  );

  useEffect(() => {
    (async () => {
      try {
        const list = await fetchChartOfAccounts({ isActive: 'true' });
        setAccounts(list);
        const cash = list.find(a => a.account_code === '1110') || list.find(a => a.account_type === 'asset');
        if (cash) setReceiveIn(String(cash.id));
      } catch (e) {
        console.error('Failed to load accounts', e);
      }
    })();
  }, []);

  // Calculate total
  const total = accountRows.reduce((sum, row) => {
    const amount = parseFloat(row.amount) || 0;
    return sum + amount;
  }, 0);

  // Add new account row
  const addAccountRow = () => {
    const newRow: AccountRow = {
      id: Date.now(),
      selectAccount: '',
      curBalance: '-',
      accountType: '',
      amount: '',
      narration: ''
    };
    setAccountRows([...accountRows, newRow]);
  };

  // Remove account row
  const removeAccountRow = (id: number) => {
    if (accountRows.length > 1) {
      setAccountRows(accountRows.filter(row => row.id !== id));
    }
  };

  // Update account row
  const updateAccountRow = (id: number, field: keyof AccountRow, value: string) => {
    setAccountRows(accountRows.map(row => {
      if (row.id !== id) return row;
      if (field === 'selectAccount') {
        const acc = accounts.find(a => String(a.id) === value);
        return {
          ...row,
          selectAccount: value,
          curBalance: acc ? String(acc.current_balance ?? 0) : '-',
          accountType: acc ? acc.account_type : ''
        };
      }
      return { ...row, [field]: value };
    }));
  };

  // Handle save
  const handleSave = async () => {
    if (!transactionDate) {
      setSnackbar({ open: true, message: 'Please fill in Transaction Date', severity: 'error' });
      return;
    }
    if (!receiveIn) {
      setSnackbar({ open: true, message: 'Please select a Receive In account', severity: 'error' });
      return;
    }
    if (accountRows.some(row => !row.selectAccount || !row.amount)) {
      setSnackbar({ open: true, message: 'Please fill in all account details', severity: 'error' });
      return;
    }

    try {
      for (const row of accountRows) {
        await createTransaction({
          debit_account_id: Number(receiveIn),
          credit_account_id: Number(row.selectAccount),
          amount: parseFloat(row.amount) || 0,
          transaction_type: 'income',
          transaction_date: transactionDate,
          description: row.narration || `Cash Receipt Voucher ${invoiceNo}`.trim(),
          payment_method: 'cash'
        });
      }
      setSnackbar({ open: true, message: 'Cash receive transaction saved successfully!', severity: 'success' });
      handleReset();
    } catch (e) {
      console.error('Failed to save voucher', e);
      setSnackbar({ open: true, message: 'Failed to save transaction.', severity: 'error' });
    }
  };

  // Handle reset
  const handleReset = () => {
    setTransactionDate('');
    setInvoiceNo('');
    setAccountRows([
      { id: 1, selectAccount: '', curBalance: '-', accountType: '', amount: '', narration: '' }
    ]);
  };

  // Handle print
  const handlePrint = () => {
    const printContent = `
      <html>
        <head>
          <title>Cash Receive Voucher</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #4CAF50; padding-bottom: 10px; }
            .details { margin: 20px 0; }
            .row { display: flex; margin-bottom: 10px; }
            .label { font-weight: bold; width: 150px; }
            .value { color: #333; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .total { font-weight: bold; font-size: 18px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>Cash Receive Voucher/Transaction</h2>
            <p>Generated on ${new Date().toLocaleDateString()}</p>
          </div>
          <div class="details">
            <div class="row"><span class="label">Transaction Date:</span><span class="value">${transactionDate}</span></div>
            <div class="row"><span class="label">Invoice No:</span><span class="value">${invoiceNo}</span></div>
            <div class="row"><span class="label">Receive In:</span><span class="value">${receiveIn}</span></div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Account</th>
                <th>Balance</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Narration</th>
              </tr>
            </thead>
            <tbody>
              ${accountRows.map(row => `
                <tr>
                  <td>${row.selectAccount}</td>
                  <td>${row.curBalance}</td>
                  <td>${row.accountType}</td>
                  <td>${row.amount}</td>
                  <td>${row.narration}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="total">Total: ${total}</div>
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
    <PageContainer title="Cash Receive Voucher/Transaction">
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
              <Box component="span" sx={{ mr: 1 }}>💰</Box>
              Cash Receive Voucher/Transaction
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
          <Box sx={{ p: 3, bgcolor: theme.palette.mode === 'dark' ? colors.primary[400] : '#F4F8F7' }}>
            {/* Top Row Fields */}
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} sx={{ mb: 3 }}>
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
              <TextField
                label="Invoice No"
                value={invoiceNo}
                onChange={(e) => setInvoiceNo(e.target.value)}
                placeholder="Enter Unique In"
                size="small"
                sx={{ flex: 1 }}
              />
              <FormControl size="small" sx={{ flex: 1 }}>
                <InputLabel>Receive In</InputLabel>
                <Select
                  value={receiveIn}
                  onChange={(e) => setReceiveIn(e.target.value)}
                  label="Receive In"
                >
                  {(cashBankAccounts.length ? cashBankAccounts : accounts).map((a) => (
                    <MenuItem key={a.id} value={String(a.id)}>
                      {a.account_code} - {a.account_name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>

            {/* Select Accounts Section */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ color: '#005f73', mb: 2, display: 'flex', alignItems: 'center', fontWeight: 'bold' }}>
                🛒 Select Accounts
              </Typography>

              {/* Table Header */}
              <Box sx={{ display: 'flex', bgcolor: theme.palette.mode === 'dark' ? colors.primary[400] : '#F5F5F5', p: 1, borderRadius: '4px 4px 0 0', border: `1px solid ${theme.palette.divider}` }}>
                <Typography variant="body2" fontWeight={600} sx={{ flex: 2, px: 1 }}>Select Account</Typography>
                <Typography variant="body2" fontWeight={600} sx={{ flex: 1, px: 1 }}>Cur Balance</Typography>
                <Typography variant="body2" fontWeight={600} sx={{ flex: 1, px: 1 }}>Account Type</Typography>
                <Typography variant="body2" fontWeight={600} sx={{ flex: 1, px: 1 }}>Amount</Typography>
                <Typography variant="body2" fontWeight={600} sx={{ flex: 2, px: 1 }}>Narration</Typography>
                <Box sx={{ width: 40 }}></Box>
              </Box>

              {/* Account Rows */}
              {accountRows.map((row, index) => (
                <Box key={row.id} sx={{ display: 'flex', alignItems: 'center', border: `1px solid ${theme.palette.divider}`, borderTop: 'none', p: 1 }}>
                  <FormControl size="small" sx={{ flex: 2, mr: 1 }}>
                    <Select
                      value={row.selectAccount}
                      onChange={(e) => updateAccountRow(row.id, 'selectAccount', e.target.value)}
                      displayEmpty
                    >
                      <MenuItem value="" disabled>Select account</MenuItem>
                      {accounts.map((a) => (
                        <MenuItem key={a.id} value={String(a.id)}>
                          {a.account_code} - {a.account_name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  
                  <TextField
                    size="small"
                    value={row.curBalance}
                    disabled
                    sx={{ flex: 1, mr: 1 }}
                  />
                  
                  <FormControl size="small" sx={{ flex: 1, mr: 1 }}>
                    <Select
                      value={row.accountType}
                      onChange={(e) => updateAccountRow(row.id, 'accountType', e.target.value)}
                      displayEmpty
                    >
                      <MenuItem value="" disabled>Type</MenuItem>
                      <MenuItem value="asset">Asset</MenuItem>
                      <MenuItem value="liability">Liability</MenuItem>
                      <MenuItem value="equity">Equity</MenuItem>
                      <MenuItem value="revenue">Revenue</MenuItem>
                      <MenuItem value="expense">Expense</MenuItem>
                    </Select>
                  </FormControl>
                  
                  <TextField
                    size="small"
                    type="number"
                    value={row.amount}
                    onChange={(e) => updateAccountRow(row.id, 'amount', e.target.value)}
                    sx={{ flex: 1, mr: 1 }}
                  />
                  
                  <TextField
                    size="small"
                    value={row.narration}
                    onChange={(e) => updateAccountRow(row.id, 'narration', e.target.value)}
                    multiline
                    rows={1}
                    sx={{ flex: 2, mr: 1 }}
                  />
                  
                  <IconButton 
                    size="small" 
                    onClick={() => removeAccountRow(row.id)}
                    disabled={accountRows.length === 1}
                    sx={{ color: '#F44336' }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              ))}

              {/* Add Row Button */}
              <Box sx={{ border: `1px solid ${theme.palette.divider}`, borderTop: 'none', p: 1, bgcolor: theme.palette.mode === 'dark' ? colors.primary[400] : '#FAFAFA' }}>
                <Button 
                  size="small" 
                  onClick={addAccountRow}
                  sx={{ color: '#005f73' }}
                >
                  + Add Account Row
                </Button>
              </Box>

              {/* Total */}
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                <Typography variant="h6" fontWeight={700}>
                  Total: {total}
                </Typography>
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
                  backgroundColor: theme.palette.mode === 'dark' ? colors.primary[400] : '#CECECE',
                  '&:hover': {
                    backgroundColor: theme.palette.mode === 'dark' ? colors.primary[300] : '#BDBDBD',
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
