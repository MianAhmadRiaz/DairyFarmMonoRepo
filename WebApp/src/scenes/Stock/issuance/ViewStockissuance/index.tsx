import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Container,
  Paper,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Card,
  CardContent,
  Grid,
  InputAdornment,
  Stack,
  Typography,
  TablePagination,
  CircularProgress,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import PageContainer from '../../../../shared/components/Layout/PageContainer';
import {
  getStockTransactions,
  StockTransaction
} from '../../../../shared/services/stockModule.services';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ViewStockissuance = () => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [transactions, setTransactions] = useState<StockTransaction[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [loading, setLoading] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const loadTransactions = useCallback(async () => {
    try {
      setLoading(true);
      // The backend supports filtering by transaction_type; issuances are 'usage'.
      const data = await getStockTransactions({
        page: page + 1,
        limit: rowsPerPage,
        transaction_type: 'usage'
      });
      setTransactions(data.transactions || []);
      setTotalCount(data.totalCount || 0);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to fetch stock issuances.');
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage]);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  const filteredData = transactions.filter(tx => {
    const matchesSearch =
      !searchQuery ||
      (tx.item_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (tx.note || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStart = !startDate || tx.date >= startDate;
    const matchesEnd = !endDate || tx.date <= endDate;
    return matchesSearch && matchesStart && matchesEnd;
  });

  const rowAmount = (tx: StockTransaction) =>
    (Number(tx.quantity) || 0) * (Number(tx.price) || 0);

  return (
    <PageContainer title="View Stock Issuance" subtitle="Stock usage transactions">
      <Container maxWidth="lg" sx={{ px: isMobile ? '11px' : undefined }}>
        {isMobile ? (
          <Box sx={{ width: '100%' }}>
            {filteredData.map(tx => (
              <Card key={tx.uuid} sx={{ mb: 2, boxShadow: 3 }}>
                <CardContent>
                  <Stack spacing={1}>
                    <Typography variant="subtitle1">{tx.item_name || '-'}</Typography>
                    <Typography variant="body2">Date: {tx.date}</Typography>
                    <Typography variant="body2">
                      Qty: {Number(tx.quantity).toFixed(2)}
                    </Typography>
                    <Typography variant="body2">
                      Rate: {Number(tx.price || 0).toFixed(2)}
                    </Typography>
                    <Typography variant="body2">
                      Amount: {rowAmount(tx).toFixed(2)}
                    </Typography>
                    {tx.note && <Typography variant="body2">Note: {tx.note}</Typography>}
                  </Stack>
                </CardContent>
              </Card>
            ))}
            {filteredData.length === 0 && !loading && (
              <Typography sx={{ p: 2, color: '#666' }}>No issuances found.</Typography>
            )}
          </Box>
        ) : (
          <Paper
            elevation={3}
            sx={{
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}
          >
            <Box sx={{ p: 2 }}>
              <CardContent>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} md={3}>
                    <TextField
                      type="date"
                      label="Starting Date"
                      size="small"
                      fullWidth
                      value={startDate}
                      onChange={e => setStartDate(e.target.value)}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <TextField
                      type="date"
                      label="Ending Date"
                      size="small"
                      fullWidth
                      value={endDate}
                      onChange={e => setEndDate(e.target.value)}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      size="small"
                      placeholder="Search item or note..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon />
                          </InputAdornment>
                        )
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={2}>
                    {loading && <CircularProgress size={24} sx={{ color: '#005f73' }} />}
                  </Grid>
                </Grid>
              </CardContent>
            </Box>

            <Paper
              elevation={3}
              sx={{ width: '100%', borderRadius: '8px', overflowX: 'auto' }}
            >
              <TableContainer sx={{ padding: 0 }}>
                <Table size={isMobile ? 'small' : 'medium'}>
                  <TableHead>
                    <TableRow>
                      {['Date', 'Item', 'Qty', 'Rate', 'Amount', 'Note'].map(label => (
                        <TableCell
                          key={label}
                          sx={{
                            bgcolor: '#f8f9fA',
                            fontWeight: 600,
                            borderBottom: '2px solid #e0e0e0',
                            py: 1
                          }}
                        >
                          {label}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {filteredData.length === 0 && !loading ? (
                      <TableRow>
                        <TableCell colSpan={6} align="center">
                          No issuances found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredData.map(tx => (
                        <TableRow
                          key={tx.uuid}
                          sx={{ '&:hover': { backgroundColor: '#f8f9fa' } }}
                        >
                          <TableCell>{tx.date}</TableCell>
                          <TableCell>{tx.item_name || '-'}</TableCell>
                          <TableCell>{Number(tx.quantity).toFixed(2)}</TableCell>
                          <TableCell>{Number(tx.price || 0).toFixed(2)}</TableCell>
                          <TableCell>{rowAmount(tx).toFixed(2)}</TableCell>
                          <TableCell>{tx.note || '-'}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                component="div"
                count={totalCount}
                page={page}
                onPageChange={(_e, newPage) => setPage(newPage)}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={e => {
                  setRowsPerPage(parseInt(e.target.value, 10));
                  setPage(0);
                }}
                rowsPerPageOptions={[10, 20, 50]}
              />
            </Paper>
          </Paper>
        )}
      </Container>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </PageContainer>
  );
};

export default ViewStockissuance;
