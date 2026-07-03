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
      setSnackbar({ open: true, message: 'Transaction updated successfully!', severity: 'success' });
    }
  };

  const handlePrint = (transaction: Transaction) => {
    // Create a printable content
    const printContent = `
      <html>
        <head>
          <title>Transaction Details</title>
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
            <h2>Transaction Details</h2>
            <p>Generated on ${new Date().toLocaleDateString()}</p>
          </div>
          <div class="details">
            <div class="row"><span class="label">Transaction ID:</span><span class="value">${transaction.id}</span></div>
            <div class="row"><span class="label">Date:</span><span class="value">${transaction.date}</span></div>
            <div class="row"><span class="label">CPV:</span><span class="value">${transaction.cpv}</span></div>
            <div class="row"><span class="label">Amount:</span><span class="value">${transaction.amount.toLocaleString()}</span></div>
            <div class="row"><span class="label">User Name:</span><span class="value">${transaction.userName}</span></div>
            <div class="row"><span class="label">Entry Date:</span><span class="value">${transaction.entryDate}</span></div>
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
        setSnackbar({ open: true, message: 'Transaction cancelled successfully!', severity: 'success' });
      } catch (e) {
        console.error('Failed to cancel transaction', e);
        setDeleteDialogOpen(false);
        setSnackbar({ open: true, message: 'Failed to cancel transaction.', severity: 'error' });
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
      message: `Found ${count} transactions for the selected criteria`,
      severity: 'success'
    });
  };

  return (
    <PageContainer title="View Transactions">
        {/* Filter Section matching screenshot */}
        <Paper elevation={0} sx={{ p: 2.5, mb: 2, borderRadius: 2, border: `1px solid ${theme.palette.divider}`, bgcolor: 'background.paper' }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems="center">
            <Stack direction="row" spacing={2} alignItems="center">
              <Typography variant="body2" fontWeight={600} sx={{ color: '#005f73', minWidth: '80px' }}>
                Select Type:
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
                  <MenuItem key={type} value={type}>{type}</MenuItem>
                ))}
              </TextField>
            </Stack>

            <Stack direction="row" spacing={2} alignItems="center">
              <Typography variant="body2" fontWeight={600} sx={{ color: '#005f73', minWidth: '90px' }}>
                Starting Date:
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
                Ending Date:
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
              GET Result
            </Button>
          </Stack>
        </Paper>

        {/* Main Table Card */}
        <Paper elevation={0} sx={{ p: 0, borderRadius: 2, border: `1px solid ${theme.palette.divider}`, bgcolor: 'background.paper' }}>
          
          {/* Controls Section */}
          <Box sx={{ p: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: theme.palette.mode === 'dark' ? colors.primary[400] : '#f8f9fa', borderBottom: `1px solid ${theme.palette.divider}` }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="body2">Show</Typography>
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
              <Typography variant="body2">entries</Typography>
            </Stack>

            <Stack direction="row" spacing={2} alignItems="center">
              <Typography variant="body2">Search:</Typography>
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
                  <th style={{ ...th, minWidth: 120 }}>Date</th>
                  <th style={{ ...th, minWidth: 150 }}>CPV</th>
                  <th style={{ ...th, minWidth: 100 }}>Amount</th>
                  <th style={{ ...th, minWidth: 120 }}>User Name</th>
                  <th style={{ ...th, minWidth: 120 }}>Entry Date</th>
                  <th style={{ ...th, minWidth: 180 }}>Actions</th>
                </tr>
              </thead>

              <tbody>
                {paginatedData.length === 0 ? (
                  <tr>
                    <td style={{ ...td, textAlign: 'center', padding: '60px 12px', color: '#666' }} colSpan={7}>
                      No data available in table
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
                          <Tooltip title="View">
                            <IconButton size="small" sx={actionButtonStyle('#4CAF50')} onClick={() => handleView(transaction)}>
                              <VisibilityOutlinedIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit">
                            <IconButton size="small" sx={actionButtonStyle('#2196F3')} onClick={() => handleEdit(transaction)}>
                              <EditOutlinedIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Print">
                            <IconButton size="small" sx={actionButtonStyle('#FF9800')} onClick={() => handlePrint(transaction)}>
                              <PrintOutlinedIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
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
              Showing {showingStart} to {showingEnd} of {filtered.length} entries
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
                Previous
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
                Next
              </Button>
            </Stack>
          </Box>
        </Paper>

        {/* View Transaction Detail Modal */}
        <Dialog open={viewModalOpen} onClose={() => setViewModalOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle sx={{ bgcolor: '#005f73', color: '#fff', fontWeight: 600 }}>
            Transaction Details
          </DialogTitle>
          <DialogContent sx={{ p: 3 }}>
            {selectedTransaction && (
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="textSecondary">Transaction ID</Typography>
                  <Typography variant="h6" sx={{ mb: 2 }}>{selectedTransaction.id}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="textSecondary">Date</Typography>
                  <Typography variant="h6" sx={{ mb: 2 }}>{selectedTransaction.date}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="textSecondary">CPV</Typography>
                  <Typography variant="h6" sx={{ mb: 2 }}>{selectedTransaction.cpv}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="textSecondary">Amount</Typography>
                  <Typography variant="h6" sx={{ mb: 2, color: '#4CAF50', fontWeight: 700 }}>
                    ${selectedTransaction.amount.toLocaleString()}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="textSecondary">User Name</Typography>
                  <Typography variant="h6" sx={{ mb: 2 }}>{selectedTransaction.userName}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="textSecondary">Entry Date</Typography>
                  <Typography variant="h6" sx={{ mb: 2 }}>{selectedTransaction.entryDate}</Typography>
                </Grid>
              </Grid>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setViewModalOpen(false)} sx={{ color: '#005f73' }}>
              Close
            </Button>
          </DialogActions>
        </Dialog>

        {/* Edit Transaction Modal */}
        <Dialog open={editModalOpen} onClose={() => setEditModalOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle sx={{ bgcolor: '#2196F3', color: '#fff', fontWeight: 600 }}>
            Edit Transaction
          </DialogTitle>
          <DialogContent sx={{ p: 3 }}>
            {editFormData && (
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Date"
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
                    label="Amount"
                    type="number"
                    value={editFormData.amount}
                    onChange={(e) => setEditFormData({ ...editFormData, amount: Number(e.target.value) })}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="CPV"
                    value={editFormData.cpv}
                    onChange={(e) => setEditFormData({ ...editFormData, cpv: e.target.value })}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="User Name"
                    value={editFormData.userName}
                    onChange={(e) => setEditFormData({ ...editFormData, userName: e.target.value })}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Entry Date"
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
              Cancel
            </Button>
            <Button 
              onClick={handleSaveEdit} 
              variant="contained" 
              sx={{ bgcolor: '#2196F3', '&:hover': { bgcolor: '#1976D2' } }}
            >
              Save Changes
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
          <DialogTitle sx={{ color: '#F44336', fontWeight: 600 }}>
            Delete Transaction
          </DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete this transaction? This action cannot be undone.
            </Typography>
            {selectedTransaction && (
              <Box sx={{ mt: 2, p: 2, bgcolor: '#FFF3E0', borderRadius: 1 }}>
                <Typography variant="body2"><strong>ID:</strong> {selectedTransaction.id}</Typography>
                <Typography variant="body2"><strong>Amount:</strong> {selectedTransaction.amount.toLocaleString()}</Typography>
                <Typography variant="body2"><strong>User:</strong> {selectedTransaction.userName}</Typography>
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setDeleteDialogOpen(false)} sx={{ color: '#666' }}>
              Cancel
            </Button>
            <Button 
              onClick={confirmDelete} 
              variant="contained" 
              sx={{ bgcolor: '#F44336', '&:hover': { bgcolor: '#D32F2F' } }}
            >
              Delete
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
