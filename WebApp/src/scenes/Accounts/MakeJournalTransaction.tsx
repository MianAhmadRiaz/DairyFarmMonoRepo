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
  Tooltip,
} from '@mui/material';
import PrintIcon from '@mui/icons-material/Print';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import { useTranslation } from 'react-i18next';
import { tokens } from '../../shared/theme/theme';
import {
  fetchChartOfAccounts,
  createJournalEntry,
  postJournalEntry,
  ChartAccount
} from '../../shared/services/finance.service';
import { usePermissions } from '../../shared/rbac/usePermissions';
import { PERMISSIONS } from '../../shared/rbac/permissions';
import PageContainer from '../../shared/components/Layout/PageContainer';

interface AccountRow {
  id: number;
  selectAccount: string;
  curBalance: string;
  accountType: string;
  debit: string;
  credit: string;
  narration: string;
}

export default function MakeJournalTransaction() {
  const { t } = useTranslation();
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const { can } = usePermissions();
  const canManageFinance = can(PERMISSIONS.FINANCE_MANAGE);
  const pageBg = theme.palette.mode === 'dark' ? colors.primary[500] : '#F5FAF7';

  // State management
  const [invoiceNo, setInvoiceNo] = useState('');
  const [transactionDate, setTransactionDate] = useState('');
  const [narration, setNarration] = useState('');
  const [accounts, setAccounts] = useState<ChartAccount[]>([]);
  const [accountRows, setAccountRows] = useState<AccountRow[]>([
    { id: 1, selectAccount: '', curBalance: '-', accountType: '', debit: '', credit: '', narration: '' },
    { id: 2, selectAccount: '', curBalance: '-', accountType: '', debit: '', credit: '', narration: '' }
  ]);
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

  // Account type options
  const accountTypes = [
    'Assets',
    'Liabilities',
    'Equity',
    'Revenue',
    'Expense',
    'Debtors / Customers',
    'Creditors / Suppliers',
    'Cash & Bank',
    'Fixed Assets',
    'Current Assets',
    'Current Liabilities'
  ];

  // Calculate totals
  const totalDebit = accountRows.reduce((sum, row) => {
    const debit = parseFloat(row.debit) || 0;
    return sum + debit;
  }, 0);

  const totalCredit = accountRows.reduce((sum, row) => {
    const credit = parseFloat(row.credit) || 0;
    return sum + credit;
  }, 0);

  // Add new account row
  const addAccountRow = () => {
    const newRow: AccountRow = {
      id: Date.now(),
      selectAccount: '',
      curBalance: '-',
      accountType: '',
      debit: '',
      credit: '',
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
      setSnackbar({ open: true, message: t('accounts.makeJournalTransaction.fillDateError'), severity: 'error' });
      return;
    }

    if (accountRows.some(row => !row.selectAccount)) {
      setSnackbar({ open: true, message: t('accounts.makeJournalTransaction.selectAllAccountsError'), severity: 'error' });
      return;
    }

    if (totalDebit !== totalCredit) {
      setSnackbar({ open: true, message: t('accounts.makeJournalTransaction.balanceError'), severity: 'error' });
      return;
    }

    if (totalDebit === 0 || totalCredit === 0) {
      setSnackbar({ open: true, message: t('accounts.makeJournalTransaction.amountsError'), severity: 'error' });
      return;
    }

    try {
      const lineItems = accountRows.map(row => ({
        account_id: Number(row.selectAccount),
        debit_amount: parseFloat(row.debit) || 0,
        credit_amount: parseFloat(row.credit) || 0,
        description: row.narration || narration
      }));
      const entry = await createJournalEntry({
        entry_date: transactionDate,
        description: narration || `Journal entry ${invoiceNo}`.trim(),
        lineItems
      });
      if (entry?.id) {
        await postJournalEntry(entry.id);
      }
      setSnackbar({ open: true, message: t('accounts.makeJournalTransaction.saveSuccess'), severity: 'success' });
      handleReset();
    } catch (e) {
      console.error('Failed to save journal entry', e);
      setSnackbar({ open: true, message: t('accounts.makeJournalTransaction.saveError'), severity: 'error' });
    }
  };

  // Handle reset
  const handleReset = () => {
    setInvoiceNo('');
    setTransactionDate('');
    setNarration('');
    setAccountRows([
      { id: 1, selectAccount: '', curBalance: '-', accountType: '', debit: '', credit: '', narration: '' },
      { id: 2, selectAccount: '', curBalance: '-', accountType: '', debit: '', credit: '', narration: '' }
    ]);
  };

  // Handle print
  const handlePrint = () => {
    const printContent = `
      <html>
        <head>
          <title>${t('accounts.makeJournalTransaction.title')}</title>
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
            .total { font-weight: bold; font-size: 16px; margin-top: 20px; }
            .balanced { color: green; }
            .unbalanced { color: red; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>${t('accounts.makeJournalTransaction.title')}</h2>
            <p>${t('accounts.common.generatedOn', { date: new Date().toLocaleDateString() })}</p>
          </div>
          <div class="details">
            <div class="row"><span class="label">${t('accounts.makeJournalTransaction.invoiceNo')}:</span><span class="value">${invoiceNo}</span></div>
            <div class="row"><span class="label">${t('accounts.makeJournalTransaction.transactionDate')}:</span><span class="value">${transactionDate}</span></div>
            <div class="row"><span class="label">${t('accounts.common.columns.narration')}:</span><span class="value">${narration}</span></div>
          </div>
          <table>
            <thead>
              <tr>
                <th>${t('accounts.common.columns.account')}</th>
                <th>${t('accounts.common.columns.balance')}</th>
                <th>${t('accounts.common.columns.type')}</th>
                <th>${t('accounts.common.columns.debit')}</th>
                <th>${t('accounts.common.columns.credit')}</th>
                <th>${t('accounts.common.columns.narration')}</th>
              </tr>
            </thead>
            <tbody>
              ${accountRows.map(row => `
                <tr>
                  <td>${row.selectAccount}</td>
                  <td>${row.curBalance}</td>
                  <td>${row.accountType}</td>
                  <td>${row.debit}</td>
                  <td>${row.credit}</td>
                  <td>${row.narration}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="total">
            <div>${t('accounts.makeJournalTransaction.totalDebit', { amount: totalDebit })}</div>
            <div>${t('accounts.makeJournalTransaction.totalCredit', { amount: totalCredit })}</div>
            <div class="${totalDebit === totalCredit ? 'balanced' : 'unbalanced'}">
              ${totalDebit === totalCredit ? t('accounts.makeJournalTransaction.balanced') : t('accounts.makeJournalTransaction.unbalanced')}
            </div>
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
    <PageContainer title={t('accounts.makeJournalTransaction.title')}>
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
              <Box component="span" sx={{ mr: 1 }}>📋</Box>
              {t('accounts.makeJournalTransaction.title')}
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
                label={t('accounts.makeJournalTransaction.invoiceNo')}
                value={invoiceNo}
                onChange={(e) => setInvoiceNo(e.target.value)}
                size="small"
                sx={{ flex: 1 }}
              />
              <TextField
                label={t('accounts.makeJournalTransaction.transactionDate')}
                type="date"
                value={transactionDate}
                onChange={(e) => setTransactionDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                placeholder="DD-MM-YY"
                size="small"
                sx={{ flex: 1 }}
              />
              <TextField
                label={t('accounts.common.columns.narration')}
                value={narration}
                onChange={(e) => setNarration(e.target.value)}
                multiline
                rows={1}
                size="small"
                sx={{ flex: 2 }}
              />
            </Stack>

            {/* Select Accounts Section */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ color: '#005f73', mb: 2, display: 'flex', alignItems: 'center', fontWeight: 'bold' }}>
                🛒 {t('accounts.makeJournalTransaction.selectAccounts')}
              </Typography>

              {/* Add Items Button */}
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                <Button 
                  variant="contained"
                  onClick={addAccountRow}
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
                  {t('accounts.makeJournalTransaction.addItems')}
                </Button>
              </Box>

              {/* Table Header */}
              <Box sx={{ display: 'flex', bgcolor: theme.palette.mode === 'dark' ? colors.primary[400] : '#F5F5F5', p: 1, borderRadius: '4px 4px 0 0', border: `1px solid ${theme.palette.divider}` }}>
                <Typography variant="body2" fontWeight={600} sx={{ flex: 2, px: 1 }}>{t('accounts.common.selectAccount')}</Typography>
                <Typography variant="body2" fontWeight={600} sx={{ flex: 1, px: 1 }}>{t('accounts.makeJournalTransaction.curBalance')}</Typography>
                <Typography variant="body2" fontWeight={600} sx={{ flex: 1, px: 1 }}>{t('accounts.makeJournalTransaction.accountType')}</Typography>
                <Typography variant="body2" fontWeight={600} sx={{ flex: 1, px: 1 }}>{t('accounts.common.columns.debit')}</Typography>
                <Typography variant="body2" fontWeight={600} sx={{ flex: 1, px: 1 }}>{t('accounts.common.columns.credit')}</Typography>
                <Typography variant="body2" fontWeight={600} sx={{ flex: 2, px: 1 }}>{t('accounts.common.columns.narration')}</Typography>
                <Box sx={{ width: 40 }}></Box>
              </Box>

              {/* Account Rows */}
              {accountRows.map((row) => (
                <Box key={row.id} sx={{ display: 'flex', alignItems: 'center', border: `1px solid ${theme.palette.divider}`, borderTop: 'none', p: 1 }}>
                  <FormControl size="small" sx={{ flex: 2, mr: 1 }}>
                    <Select
                      value={row.selectAccount}
                      onChange={(e) => updateAccountRow(row.id, 'selectAccount', e.target.value)}
                      displayEmpty
                    >
                      <MenuItem value="" disabled>{t('accounts.common.selectAccount')}</MenuItem>
                      {accounts.map((account) => (
                        <MenuItem key={account.id} value={String(account.id)}>
                          {account.account_code} - {account.account_name}
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
                    >
                      {accountTypes.map((type, index) => (
                        <MenuItem key={index} value={type}>{t(`accounts.common.accountTypes.${type}`, type)}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  
                  <TextField
                    size="small"
                    type="number"
                    value={row.debit}
                    onChange={(e) => updateAccountRow(row.id, 'debit', e.target.value)}
                    sx={{ flex: 1, mr: 1 }}
                  />
                  
                  <TextField
                    size="small"
                    type="number"
                    value={row.credit}
                    onChange={(e) => updateAccountRow(row.id, 'credit', e.target.value)}
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

              {/* Totals */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2, px: 2 }}>
                <Typography variant="h6" fontWeight={700}>
                  {t('accounts.makeJournalTransaction.totalDebit', { amount: totalDebit })}
                </Typography>
                <Typography variant="h6" fontWeight={700}>
                  {t('accounts.makeJournalTransaction.totalCredit', { amount: totalCredit })}
                </Typography>
                <Typography 
                  variant="h6" 
                  fontWeight={700}
                  sx={{ 
                    color: totalDebit === totalCredit && totalDebit > 0 ? 'green' : 'red' 
                  }}
                >
                  {totalDebit === totalCredit && totalDebit > 0 ? t('accounts.makeJournalTransaction.balanced') : t('accounts.makeJournalTransaction.unbalanced')}
                </Typography>
              </Box>
            </Box>

            {/* Action Buttons - matching AddAnimal screen */}
            <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: 2, mt: 4 }}>
              <Tooltip title={canManageFinance ? '' : t('accounts.common.noPermission')}>
                <span>
              <Button
                variant="contained"
                onClick={handleSave}
                disabled={!canManageFinance}
                sx={{
                  backgroundColor: "#005f73",
                  color: "#ffffff",
                  padding: "7px 50px",
                  textTransform: 'none'
                }}
              >
                💾 {t('accounts.common.saveChanges')}
              </Button>
                </span>
              </Tooltip>
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
