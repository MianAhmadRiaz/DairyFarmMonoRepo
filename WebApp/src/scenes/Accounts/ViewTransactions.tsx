import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  useTheme,
  Stack,
  InputAdornment,
  MenuItem,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Divider,
  Alert,
  Snackbar,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import PrintOutlinedIcon from '@mui/icons-material/PrintOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { useTranslation } from 'react-i18next';
import { tokens } from '../../shared/theme/theme';
import {
  fetchTransactions,
  cancelTransaction,
  FinancialTransaction
} from '../../shared/services/finance.service';
import PageContainer from '../../shared/components/Layout/PageContainer';

interface Transaction {
  id: number;
  date: string;
  cpv: string;
  amount: number;
  userName: string;
  entryDate: string;
}

const formatDate = (d: string) => {
  if (!d) return '';
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return d;
  return dt.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

const mapTransaction = (t: FinancialTransaction): Transaction => ({
  id: t.id,
  date: formatDate(t.transaction_date),
  cpv: t.description || t.debitAccount?.account_name || t.transaction_number,
  amount: Number(t.amount) || 0,
  userName: t.transaction_source || '-',
  entryDate: formatDate(t.transaction_date)
});

const ENTRIES_OPTIONS = [10, 25, 50, 100, 1500];
const TRANSACTION_TYPES = [
  'Cash Payment Voucher',
  'Cash Receipt Voucher', 
  'Bank Payment Voucher',
  'Bank Receipt Voucher',
  'Journal Voucher'
];

export default function ViewTransactions() {
  const { t } = useTranslation();
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const pageBg = theme.palette.mode === 'dark' ? colors.primary[500] : '#F5FAF7';

  // State management
  const [search, setSearch] = useState('');
  const [entriesPerPage, setEntriesPerPage] = useState(1500);
  const [currentPage, setCurrentPage] = useState(1);
  const [transactionType, setTransactionType] = useState('Cash Payment Voucher');
  const [startingDate, setStartingDate] = useState('2025-03-01');
  const [endingDate, setEndingDate] = useState('2025-04-30');
  
  // Modal states
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [editFormData, setEditFormData] = useState<Transaction | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const loadTransactions = async (params: Record<string, string | number> = {}) => {
    try {
      const res = await fetchTransactions({ limit: 1500, ...params });
      setTransactions((res.items || []).map(mapTransaction));
      setCurrentPage(1);
      return res.items?.length || 0;
    } catch (e) {
      console.error('Failed to load transactions', e);
      return 0;
    }
  };

  useEffect(() => {
    loadTransactions();
  }, []);
  
  // Notification state
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  // Filter and pagination logic
  const filtered = useMemo(() => {
    return transactions.filter(transaction =>
      transaction.cpv.toLowerCase().includes(search.toLowerCase()) ||
      transaction.userName.toLowerCase().includes(search.toLowerCase()) ||
      transaction.date.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, transactions]);

  const totalPages = Math.ceil(filtered.length / entriesPerPage);
  const startIndex = (currentPage - 1) * entriesPerPage;
  const paginatedData = filtered.slice(startIndex, startIndex + entriesPerPage);

  const showingStart = filtered.length === 0 ? 0 : startIndex + 1;
  const showingEnd = Math.min(startIndex + entriesPerPage, filtered.length);

  // Table styles matching your theme
  const th = {
    backgroundColor: '#E8F4F8',
    color: '#2C3E50',
    fontWeight: 700,
    padding: '12px',
    textAlign: 'left' as const,
    borderBottom: '2px solid #D1E7DD',
    fontSize: '0.875rem',
  };

  const td = {
    padding: '12px',
    borderBottom: '1px solid #E9ECEF',
    fontSize: '0.875rem',
    color: '#495057',
  };

  // Action button styles matching the screenshot colors
  const actionButtonStyle = (bgColor: string) => ({
    minWidth: '32px',
    width: '32px',
    height: '32px',
    mr: 0.5,
    bgcolor: bgColor,
    color: '#fff',
    '&:hover': {
      bgcolor: bgColor,
      opacity: 0.8,
    }
  });

  // Action handlers
  const handleView = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setViewModalOpen(true);
  };

  const handleEdit = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setEditFormData({ ...transaction });
    setEditModalOpen(true);
  };

  const handleSaveEdit = () => {
    if (editFormData) {
      setTransactions(prev => 
        prev.map(t => t.id === editFormData.id ? editFormData : t)
      );
      setEditModalOpen(false);
      setSnackbar({ open: true, message: t('accounts.viewTransactions.updateSuccess'), severity: 'success' });
    }
  };

  const handlePrint = (transaction: Transaction) => {
    // Create a printable content
    const printContent = `
      <html>
        <head>
          <title>${t('accounts.viewTransactions.transactionDetails')}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #005f73; padding-bottom: 10px; }
            .details { margin: 20px 0; }
            .row { display: flex; margin-bottom: 10px; }
            .label { font-weight: bold; width: 150px; }
            .value { color: #333; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>${t('accounts.viewTransactions.transactionDetails')}</h2>
            <p>${t('accounts.common.generatedOn', { date: new Date().toLocaleDateString() })}</p>
          </div>
          <div class="details">
            <div class="row"><span class="label">${t('accounts.viewTransactions.transactionId')}:</span><span class="value">${transaction.id}</span></div>
            <div class="row"><span class="label">${t('accounts.common.columns.date')}:</span><span class="value">${transaction.date}</span></div>
            <div class="row"><span class="label">${t('accounts.viewTransactions.columns.cpv')}:</span><span class="value">${transaction.cpv}</span></div>
            <div class="row"><span class="label">${t('accounts.common.amount')}:</span><span class="value">${transaction.amount.toLocaleString()}</span></div>
            <div class="row"><span class="label">${t('accounts.viewTransactions.columns.userName')}:</span><span class="value">${transaction.userName}</span></div>
            <div class="row"><span class="label">${t('accounts.viewTransactions.columns.entryDate')}:</span><span class="value">${transaction.entryDate}</span></div>
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

  const handleDelete = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (selectedTransaction) {
      try {
        await cancelTransaction(selectedTransaction.id);
        await loadTransactions();
        setDeleteDialogOpen(false);
        setSnackbar({ open: true, message: t('accounts.viewTransactions.cancelSuccess'), severity: 'success' });
      } catch (e) {
        console.error('Failed to cancel transaction', e);
        setDeleteDialogOpen(false);
        setSnackbar({ open: true, message: t('accounts.viewTransactions.cancelError'), severity: 'error' });
      }
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleGetResult = async () => {
    const count = await loadTransactions({
      startDate: startingDate,
      endDate: endingDate
    });
    setSnackbar({
      open: true,
      message: t('accounts.viewTransactions.foundTransactions', { count }),
      severity: 'success'
    });
  };

  return (
    <PageContainer title={t('accounts.viewTransactions.title')}>
        {/* Filter Section matching screenshot */}
        <Paper elevation={0} sx={{ p: 2.5, mb: 2, borderRadius: 2, border: `1px solid ${theme.palette.divider}`, bgcolor: 'background.paper' }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems="center">
            <Stack direction="row" spacing={2} alignItems="center">
              <Typography variant="body2" fontWeight={600} sx={{ color: '#005f73', minWidth: '80px' }}>
                {t('accounts.viewTransactions.selectTypeLabel')}
              </Typography>
              <TextField
                select
                size="small"
                value={transactionType}
                onChange={(e) => setTransactionType(e.target.value)}
                sx={{ 
                  minWidth: 200,
                  '& .MuiOutlinedInput-root': {
                    bgcolor: '#fff',
                  }
                }}
              >
                {TRANSACTION_TYPES.map(type => (
                  <MenuItem key={type} value={type}>{t(`accounts.viewTransactions.transactionTypes.${type}`, type)}</MenuItem>
                ))}
              </TextField>
            </Stack>

            <Stack direction="row" spacing={2} alignItems="center">
              <Typography variant="body2" fontWeight={600} sx={{ color: '#005f73', minWidth: '90px' }}>
                {t('accounts.common.startingDate')}
              </Typography>
              <TextField
                size="small"
                type="date"
                value={startingDate}
                onChange={(e) => setStartingDate(e.target.value)}
                sx={{ 
                  width: 150,
                  '& .MuiOutlinedInput-root': {
                    bgcolor: '#fff',
                  }
                }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                    </InputAdornment>
                  ),
                }}
              />
            </Stack>

            <Stack direction="row" spacing={2} alignItems="center">
              <Typography variant="body2" fontWeight={600} sx={{ color: '#005f73', minWidth: '85px' }}>
                {t('accounts.common.endingDate')}
              </Typography>
              <TextField
                size="small"
                type="date"
                value={endingDate}
                onChange={(e) => setEndingDate(e.target.value)}
                sx={{ 
                  width: 150,
                  '& .MuiOutlinedInput-root': {
                    bgcolor: '#fff',
                  }
                }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                    </InputAdornment>
                  ),
                }}
              />
            </Stack>

            <Button
              variant="contained"
              onClick={handleGetResult}
              sx={{
                backgroundColor: '#4CAF50',
                color: '#fff',
                textTransform: 'none',
                px: 4,
                py: 1,
                fontWeight: 600,
                '&:hover': {
                  backgroundColor: '#45A049',
                }
              }}
            >
              {t('accounts.common.getResult')}
            </Button>
          </Stack>
        </Paper>

        {/* Main Table Card */}
        <Paper elevation={0} sx={{ p: 0, borderRadius: 2, border: `1px solid ${theme.palette.divider}`, bgcolor: 'background.paper' }}>
          
          {/* Controls Section */}
          <Box sx={{ p: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: theme.palette.mode === 'dark' ? colors.primary[400] : '#f8f9fa', borderBottom: `1px solid ${theme.palette.divider}` }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="body2">{t('accounts.common.show')}</Typography>
              <TextField
                select
                size="small"
                value={entriesPerPage}
                onChange={(e) => {
                  setEntriesPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                sx={{ width: 80, bgcolor: '#fff' }}
              >
                {ENTRIES_OPTIONS.map(option => (
                  <MenuItem key={option} value={option}>{option}</MenuItem>
                ))}
              </TextField>
              <Typography variant="body2">{t('accounts.common.entries')}</Typography>
            </Stack>

            <Stack direction="row" spacing={2} alignItems="center">
              <Typography variant="body2">{t('accounts.common.searchLabel')}</Typography>
              <TextField
                size="small"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                sx={{ width: 250, bgcolor: '#fff' }}
              />
            </Stack>
          </Box>

          {/* Table */}
          <Box sx={{ overflow: 'auto' }}>
            <table style={{ borderCollapse: 'separate', width: '100%' }}>
              <thead>
                <tr>
                  <th style={th}>#</th>
                  <th style={{ ...th, minWidth: 120 }}>{t('accounts.common.columns.date')}</th>
                  <th style={{ ...th, minWidth: 150 }}>{t('accounts.viewTransactions.columns.cpv')}</th>
                  <th style={{ ...th, minWidth: 100 }}>{t('accounts.common.amount')}</th>
                  <th style={{ ...th, minWidth: 120 }}>{t('accounts.viewTransactions.columns.userName')}</th>
                  <th style={{ ...th, minWidth: 120 }}>{t('accounts.viewTransactions.columns.entryDate')}</th>
                  <th style={{ ...th, minWidth: 180 }}>{t('accounts.common.actions')}</th>
                </tr>
              </thead>

              <tbody>
                {paginatedData.length === 0 ? (
                  <tr>
                    <td style={{ ...td, textAlign: 'center', padding: '60px 12px', color: '#666' }} colSpan={7}>
                      {t('accounts.common.noDataInTable')}
                    </td>
                  </tr>
                ) : (
                  paginatedData.map((transaction) => (
                    <tr key={transaction.id}>
                      <td style={td}>{transaction.id}</td>
                      <td style={td}>{transaction.date}</td>
                      <td style={td}>{transaction.cpv}</td>
                      <td style={td}>{transaction.amount.toLocaleString()}</td>
                      <td style={td}>{transaction.userName}</td>
                      <td style={td}>{transaction.entryDate}</td>
                      <td style={td}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Tooltip title={t('shared.common.view')}>
                            <IconButton size="small" sx={actionButtonStyle('#4CAF50')} onClick={() => handleView(transaction)}>
                              <VisibilityOutlinedIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title={t('common.edit')}>
                            <IconButton size="small" sx={actionButtonStyle('#2196F3')} onClick={() => handleEdit(transaction)}>
                              <EditOutlinedIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title={t('shared.common.print')}>
                            <IconButton size="small" sx={actionButtonStyle('#FF9800')} onClick={() => handlePrint(transaction)}>
                              <PrintOutlinedIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title={t('common.delete')}>
                            <IconButton size="small" sx={actionButtonStyle('#F44336')} onClick={() => handleDelete(transaction)}>
                              <DeleteOutlineOutlinedIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </Box>

          {/* Footer with pagination */}
          <Box sx={{ p: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: theme.palette.mode === 'dark' ? colors.primary[400] : '#f8f9fa', borderTop: `1px solid ${theme.palette.divider}` }}>
            <Typography variant="body2" color="text.secondary">
              {t('accounts.common.showingEntriesRange', { start: showingStart, end: showingEnd, total: filtered.length })}
            </Typography>
            
            <Stack direction="row" spacing={1} alignItems="center">
              <Button
                size="small"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => prev - 1)}
                sx={{ 
                  textTransform: 'none', 
                  minWidth: 'auto',
                  color: '#6a757d',
                }}
              >
                {t('accounts.common.previous')}
              </Button>
              
              <Button
                size="small"
                disabled={currentPage === totalPages || totalPages === 0}
                onClick={() => setCurrentPage(prev => prev + 1)}
                sx={{ 
                  textTransform: 'none', 
                  minWidth: 'auto',
                  color: '#6a757d',
                }}
              >
                {t('common.next')}
              </Button>
            </Stack>
          </Box>
        </Paper>

        {/* View Transaction Detail Modal */}
        <Dialog open={viewModalOpen} onClose={() => setViewModalOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle sx={{ bgcolor: '#005f73', color: '#fff', fontWeight: 600 }}>
            {t('accounts.viewTransactions.transactionDetails')}
          </DialogTitle>
          <DialogContent sx={{ p: 3 }}>
            {selectedTransaction && (
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="textSecondary">{t('accounts.viewTransactions.transactionId')}</Typography>
                  <Typography variant="h6" sx={{ mb: 2 }}>{selectedTransaction.id}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="textSecondary">{t('accounts.common.columns.date')}</Typography>
                  <Typography variant="h6" sx={{ mb: 2 }}>{selectedTransaction.date}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="textSecondary">{t('accounts.viewTransactions.columns.cpv')}</Typography>
                  <Typography variant="h6" sx={{ mb: 2 }}>{selectedTransaction.cpv}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="textSecondary">{t('accounts.common.amount')}</Typography>
                  <Typography variant="h6" sx={{ mb: 2, color: '#4CAF50', fontWeight: 700 }}>
                    ${selectedTransaction.amount.toLocaleString()}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="textSecondary">{t('accounts.viewTransactions.columns.userName')}</Typography>
                  <Typography variant="h6" sx={{ mb: 2 }}>{selectedTransaction.userName}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="textSecondary">{t('accounts.viewTransactions.columns.entryDate')}</Typography>
                  <Typography variant="h6" sx={{ mb: 2 }}>{selectedTransaction.entryDate}</Typography>
                </Grid>
              </Grid>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setViewModalOpen(false)} sx={{ color: '#005f73' }}>
              {t('common.close')}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Edit Transaction Modal */}
        <Dialog open={editModalOpen} onClose={() => setEditModalOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle sx={{ bgcolor: '#2196F3', color: '#fff', fontWeight: 600 }}>
            {t('accounts.viewTransactions.editTransaction')}
          </DialogTitle>
          <DialogContent sx={{ p: 3 }}>
            {editFormData && (
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label={t('accounts.common.columns.date')}
                    type="date"
                    value={editFormData.date}
                    onChange={(e) => setEditFormData({ ...editFormData, date: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label={t('accounts.common.amount')}
                    type="number"
                    value={editFormData.amount}
                    onChange={(e) => setEditFormData({ ...editFormData, amount: Number(e.target.value) })}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label={t('accounts.viewTransactions.columns.cpv')}
                    value={editFormData.cpv}
                    onChange={(e) => setEditFormData({ ...editFormData, cpv: e.target.value })}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label={t('accounts.viewTransactions.columns.userName')}
                    value={editFormData.userName}
                    onChange={(e) => setEditFormData({ ...editFormData, userName: e.target.value })}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label={t('accounts.viewTransactions.columns.entryDate')}
                    type="date"
                    value={editFormData.entryDate}
                    onChange={(e) => setEditFormData({ ...editFormData, entryDate: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                    size="small"
                  />
                </Grid>
              </Grid>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setEditModalOpen(false)} sx={{ color: '#666' }}>
              {t('common.cancel')}
            </Button>
            <Button 
              onClick={handleSaveEdit} 
              variant="contained" 
              sx={{ bgcolor: '#2196F3', '&:hover': { bgcolor: '#1976D2' } }}
            >
              {t('accounts.common.saveChanges')}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
          <DialogTitle sx={{ color: '#F44336', fontWeight: 600 }}>
            {t('accounts.viewTransactions.deleteTransaction')}
          </DialogTitle>
          <DialogContent>
            <Typography>
              {t('accounts.viewTransactions.deleteConfirm')}
            </Typography>
            {selectedTransaction && (
              <Box sx={{ mt: 2, p: 2, bgcolor: '#FFF3E0', borderRadius: 1 }}>
                <Typography variant="body2"><strong>{t('accounts.viewTransactions.idLabel')}</strong> {selectedTransaction.id}</Typography>
                <Typography variant="body2"><strong>{t('accounts.viewTransactions.amountLabel')}</strong> {selectedTransaction.amount.toLocaleString()}</Typography>
                <Typography variant="body2"><strong>{t('accounts.viewTransactions.userLabel')}</strong> {selectedTransaction.userName}</Typography>
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setDeleteDialogOpen(false)} sx={{ color: '#666' }}>
              {t('common.cancel')}
            </Button>
            <Button
              onClick={confirmDelete}
              variant="contained"
              sx={{ bgcolor: '#F44336', '&:hover': { bgcolor: '#D32F2F' } }}
            >
              {t('common.delete')}
            </Button>
          </DialogActions>
        </Dialog>

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
