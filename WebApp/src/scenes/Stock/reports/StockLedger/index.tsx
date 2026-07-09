import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Paper,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CardContent,
  Grid,
  Typography,
  TablePagination,
  CircularProgress,
  Chip,
  useTheme,
  useMediaQuery
} from '@mui/material';
import TableControls from '../../../../shared/components/TableControls';
import { exportToCSV } from '../../../../shared/utils/exportUtils';
import PageContainer from '../../../../shared/components/Layout/PageContainer';
import { tokens } from '../../../../shared/theme/theme';
import {
  getStockTransactions,
  StockTransaction
} from '../../../../shared/services/stockModule.services';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useTranslation } from 'react-i18next';

interface LedgerRow {
  id: number;
  date: string;
  itemName: string;
  type: string;
  qty: number;
  rate: number;
  amount: number;
  balance: number;
}

const toLedgerRow = (tx: StockTransaction, index: number): LedgerRow => {
  const qty = Number(tx.quantity) || 0;
  const rate = Number(tx.price) || 0;
  const lastQty = Number(tx.last_quantity) || 0;
  const isIncoming = tx.transaction_type === 'purchase';
  return {
    id: index + 1,
    date: tx.date,
    itemName: tx.item_name || '-',
    type: tx.transaction_type,
    qty,
    rate,
    amount: Number((qty * rate).toFixed(2)),
    balance: Number((isIncoming ? lastQty + qty : lastQty - qty).toFixed(2))
  };
};

const StockLedger: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [transactions, setTransactions] = useState<StockTransaction[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [loading, setLoading] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [itemNameFilter, setItemNameFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [localStartDate, setLocalStartDate] = useState('');
  const [localEndDate, setLocalEndDate] = useState('');

  const loadTransactions = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getStockTransactions({ page: page + 1, limit: rowsPerPage });
      setTransactions(data.transactions || []);
      setTotalCount(data.totalCount || 0);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || t('stock.stockLedger.fetchError'));
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage]);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  const uniqueItemNames = Array.from(
    new Set(transactions.map(tx => tx.item_name || '-'))
  );

  const ledgerRows = transactions
    .filter(tx => {
      const matchesSearch =
        !searchTerm ||
        (tx.item_name || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesItem = !itemNameFilter || (tx.item_name || '-') === itemNameFilter;
      const matchesType = !typeFilter || tx.transaction_type === typeFilter;
      const matchesStart = !localStartDate || tx.date >= localStartDate;
      const matchesEnd = !localEndDate || tx.date <= localEndDate;
      return matchesSearch && matchesItem && matchesType && matchesStart && matchesEnd;
    })
    .map(toLedgerRow);

  const [columns, setColumns] = useState([
    { id: 'id', label: '#', visible: true },
    { id: 'date', label: t('stock.common.date'), visible: true },
    { id: 'itemName', label: t('stock.common.itemName'), visible: true },
    { id: 'type', label: t('stock.stockLedger.type'), visible: true },
    { id: 'qty', label: t('stock.common.quantity'), visible: true },
    { id: 'rate', label: t('stock.common.rate'), visible: true },
    { id: 'amount', label: t('stock.common.amount'), visible: true },
    { id: 'balance', label: t('stock.stockLedger.balanceAfter'), visible: true }
  ]);

  const handleColumnVisibilityChange = (columnId: string) => {
    setColumns(columns.map(col => (col.id === columnId ? { ...col, visible: !col.visible } : col)));
  };

  const handleCSV = () => {
    exportToCSV(ledgerRows, 'stock_ledger_report');
  };

  const noop = () => undefined;

  return (
    <PageContainer title={t('stock.stockLedger.title')} subtitle={t('stock.stockLedger.subtitle')}>
      <Paper
        elevation={3}
        sx={{
          borderRadius: '8px',
          backgroundColor: theme.palette.background.paper,
          boxShadow:
            theme.palette.mode === 'dark'
              ? '0 4px 12px rgba(0,0,0,0.3)'
              : '0 2px 8px rgba(0,0,0,0.1)',
          overflowX: 'auto'
        }}
      >
        <Box sx={{ p: { xs: 1, sm: 2 } }}>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={4}>
                <TextField
                  type="date"
                  label={t('stock.common.startDate')}
                  size="small"
                  fullWidth
                  value={localStartDate}
                  onChange={e => setLocalStartDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  type="date"
                  label={t('stock.common.endDate')}
                  size="small"
                  fullWidth
                  value={localEndDate}
                  onChange={e => setLocalEndDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                {loading && <CircularProgress size={24} sx={{ color: '#005f73' }} />}
              </Grid>
            </Grid>
          </CardContent>
        </Box>

        <Box
          sx={{
            mb: 3,
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 2,
            flexWrap: 'wrap'
          }}
        >
          <FormControl size="small" sx={{ width: { xs: '84%', sm: '20%' }, ml: { xs: 2, md: 4 } }}>
            <InputLabel>{t('stock.common.itemName')}</InputLabel>
            <Select
              value={itemNameFilter}
              label={t('stock.common.itemName')}
              onChange={e => setItemNameFilter(e.target.value)}
            >
              <MenuItem value="">{t('stock.common.all')}</MenuItem>
              {uniqueItemNames.map(name => (
                <MenuItem key={name} value={name}>
                  {name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ width: { xs: '84%', sm: '20%' }, ml: { xs: 2, md: 0 } }}>
            <InputLabel>{t('stock.stockLedger.type')}</InputLabel>
            <Select value={typeFilter} label={t('stock.stockLedger.type')} onChange={e => setTypeFilter(e.target.value)}>
              <MenuItem value="">{t('stock.common.all')}</MenuItem>
              <MenuItem value="purchase">{t('stock.stockLedger.transactionType.purchase')}</MenuItem>
              <MenuItem value="usage">{t('stock.stockLedger.transactionType.usage')}</MenuItem>
              <MenuItem value="sale">{t('stock.stockLedger.transactionType.sale')}</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Box
          sx={{
            mb: 3,
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 1,
            alignItems: { xs: 'stretch', sm: 'center' },
            p: 1,
            borderBottom: '1px solid #e0e0e0'
          }}
        >
          <TableControls
            columns={columns}
            onColumnVisibilityChange={handleColumnVisibilityChange}
            onCopy={noop}
            onCSV={handleCSV}
            onPDF={noop}
            onPrint={noop}
          />
          <Box
            sx={{
              flexGrow: 1,
              display: 'flex',
              alignItems: 'center',
              mt: { xs: 2, sm: 0 }
            }}
          >
            <Box
              component="span"
              sx={{
                mr: 1,
                color: '#666',
                display: { xs: 'none', sm: 'block' }
              }}
            >
              {t('stock.common.searchLabel')}
            </Box>
            <TextField
              size="small"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder={t('stock.common.searchPlaceholder')}
              fullWidth
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '4px',
                  backgroundColor: '#fff'
                }
              }}
            />
          </Box>
        </Box>

        <TableContainer
          sx={{
            maxHeight: { xs: '400px', sm: 'none' },
            overflowX: 'auto'
          }}
        >
          <Table size={isMobile ? 'small' : 'medium'}>
            <TableHead>
              <TableRow
                sx={{
                  backgroundColor:
                    theme.palette.mode === 'dark' ? colors.primary[400] : '#F8F9FA'
                }}
              >
                {columns.map(
                  column =>
                    column.visible && (
                      <TableCell
                        key={column.id}
                        sx={{
                          color: 'black',
                          fontWeight: 'bold',
                          minWidth: { xs: '50px', sm: 'auto' }
                        }}
                      >
                        {column.label}
                      </TableCell>
                    )
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {ledgerRows.length === 0 && !loading ? (
                <TableRow>
                  <TableCell colSpan={columns.filter(c => c.visible).length} align="center">
                    {t('stock.stockLedger.noTransactions')}
                  </TableCell>
                </TableRow>
              ) : (
                ledgerRows.map(row => (
                  <TableRow
                    key={`${row.id}-${row.date}`}
                    sx={{
                      '&:hover': { backgroundColor: '#f5f5f5' },
                      '& td': {
                        py: 1.5,
                        borderBottom: '1px solid #e0e0e0',
                        fontSize: { xs: '0.75rem', sm: '0.875rem' }
                      }
                    }}
                  >
                    {columns.map(
                      column =>
                        column.visible && (
                          <TableCell key={column.id}>
                            {column.id === 'type' ? (
                              <Chip
                                label={t('stock.stockLedger.transactionType.' + row.type, row.type)}
                                size="small"
                                color={
                                  row.type === 'purchase'
                                    ? 'success'
                                    : row.type === 'sale'
                                    ? 'info'
                                    : 'warning'
                                }
                              />
                            ) : (
                              row[column.id as keyof LedgerRow]
                            )}
                          </TableCell>
                        )
                    )}
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
          rowsPerPageOptions={[10, 20, 50, 100]}
        />
      </Paper>

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

export default StockLedger;
