import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  List,
  ListItem,
  ListItemText,
  Divider,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Stack,
  CircularProgress
} from '@mui/material';
import {
  TrendingDown,
  Inventory,
  Warning,
  AddCircleOutline,
  EventBusy,
  ShoppingCart,
  Refresh
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import PageContainer from '../../../shared/components/Layout/PageContainer';
import {
  getStockItems,
  getStockItemAlerts,
  getExpiryReport,
  getStockSummaryReport,
  StockAlertRow,
  ExpiryReportData,
  StockSummaryReportRow
} from '../../../shared/services/stockModule.services';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useTranslation } from 'react-i18next';

const EXPIRY_HORIZON_DAYS = 60;
const CONSUMPTION_WINDOW_DAYS = 30;

const formatDate = (d: Date) => d.toISOString().split('T')[0];

const StockDashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [totalItems, setTotalItems] = useState(0);
  const [lowStockCount, setLowStockCount] = useState(0);
  const [lowStockItems, setLowStockItems] = useState<StockAlertRow[]>([]);
  const [expiry, setExpiry] = useState<ExpiryReportData | null>(null);
  const [topConsumed, setTopConsumed] = useState<StockSummaryReportRow[]>([]);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    const endDate = formatDate(new Date());
    const start = new Date();
    start.setDate(start.getDate() - CONSUMPTION_WINDOW_DAYS);
    const startDate = formatDate(start);

    const [itemsRes, alertsRes, expiryRes, summaryRes] = await Promise.allSettled([
      getStockItems({ page: 1, limit: 1 }),
      getStockItemAlerts({ page: 1, limit: 50 }),
      getExpiryReport(EXPIRY_HORIZON_DAYS),
      getStockSummaryReport({ startDate, endDate })
    ]);

    if (itemsRes.status === 'fulfilled') {
      setTotalItems(itemsRes.value.totalCount || 0);
    }
    if (alertsRes.status === 'fulfilled') {
      setLowStockCount(alertsRes.value.totalCount || 0);
      setLowStockItems(alertsRes.value.items || []);
    }
    if (expiryRes.status === 'fulfilled') {
      setExpiry(expiryRes.value);
    }
    if (summaryRes.status === 'fulfilled') {
      const sorted = [...summaryRes.value]
        .filter(row => Number(row.consumption_quantity) > 0)
        .sort((a, b) => Number(b.consumption_quantity) - Number(a.consumption_quantity))
        .slice(0, 5);
      setTopConsumed(sorted);
    }

    const failed = [itemsRes, alertsRes, expiryRes, summaryRes].find(
      r => r.status === 'rejected'
    ) as PromiseRejectedResult | undefined;
    if (failed) {
      const reason: any = failed.reason;
      toast.error(reason?.response?.data?.message || t('stock.stockDashboard.loadError'));
    }
    setLoading(false);
  }, [t]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const kpiCards = [
    {
      label: t('stock.stockDashboard.totalStockItems'),
      value: totalItems,
      icon: <Inventory sx={{ color: '#77B255' }} />
    },
    {
      label: t('stock.stockDashboard.lowStockAlerts'),
      value: lowStockCount,
      icon: <Warning sx={{ color: lowStockCount > 0 ? '#e07a1f' : '#77B255' }} />
    },
    {
      label: t('stock.stockDashboard.expiredBatches'),
      value: expiry?.counts?.expired ?? 0,
      icon: <EventBusy sx={{ color: (expiry?.counts?.expired ?? 0) > 0 ? '#d32f2f' : '#77B255' }} />
    },
    {
      label: t('stock.stockDashboard.expiringInDays', { days: EXPIRY_HORIZON_DAYS }),
      value: expiry?.counts?.expiringSoon ?? 0,
      icon: (
        <TrendingDown
          sx={{ color: (expiry?.counts?.expiringSoon ?? 0) > 0 ? '#e07a1f' : '#77B255' }}
        />
      )
    }
  ];

  const alertEntries: { primary: string; secondary: string }[] = [
    ...lowStockItems.slice(0, 5).map(item => ({
      primary: t('stock.stockDashboard.lowStockEntry', {
        name: item.item_name || item.name || t('stock.common.item')
      }),
      secondary: t('stock.stockDashboard.lowStockDetail', {
        quantity: Number(item.quantity),
        reorderLevel: item.reorder_level
      })
    })),
    ...(expiry?.expired || []).slice(0, 3).map(batch => ({
      primary: t('stock.stockDashboard.expiredEntry', {
        name: batch.item_name || t('stock.common.item')
      }),
      secondary: t('stock.stockDashboard.expiredDetail', {
        batch: batch.batch_number || '-',
        date: batch.expiry_date
      })
    })),
    ...(expiry?.expiringSoon || []).slice(0, 3).map(batch => ({
      primary: t('stock.stockDashboard.expiringEntry', {
        name: batch.item_name || t('stock.common.item')
      }),
      secondary: t('stock.stockDashboard.expiringDetail', {
        batch: batch.batch_number || '-',
        date: batch.expiry_date
      })
    }))
  ];

  return (
    <PageContainer
      title={t('stock.stockDashboard.title')}
      subtitle={t('stock.stockDashboard.subtitle')}
      actions={
        <Stack direction="row" spacing={1} alignItems="center">
          {loading && <CircularProgress size={20} sx={{ color: '#005f73' }} />}
          <Button
            sx={{
              borderColor: '#005f73',
              color: '#005f73',
              display: { xs: 'none', sm: 'flex' }
            }}
            variant="outlined"
            startIcon={<Refresh />}
            onClick={loadDashboard}
            disabled={loading}
          >
            {t('stock.common.refresh')}
          </Button>
        </Stack>
      }
    >
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {kpiCards.map(card => (
          <Grid item xs={12} sm={6} md={3} key={card.label}>
            <Card sx={{ boxShadow: 3, borderRadius: 2, height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: '50%',
                      backgroundColor: '#eefaff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {card.icon}
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: '1.2rem', fontWeight: 600 }}>
                      {card.value}
                    </Typography>
                    <Typography sx={{ fontSize: '0.9rem', color: '#666' }}>
                      {card.label}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Card sx={{ mb: 3, boxShadow: 3, borderRadius: 2 }}>
        <CardContent>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 2
            }}
          >
            <Typography variant="h6" fontWeight="bold">
              {t('stock.stockDashboard.topConsumedItems', { days: CONSUMPTION_WINDOW_DAYS })}
            </Typography>
          </Box>
          <TableContainer>
            <Table>
              <TableHead sx={{ backgroundColor: '#f8f8f8' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>{t('stock.common.item')}</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>{t('stock.stockDashboard.columns.consumedQty')}</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>{t('stock.stockDashboard.columns.avgRate')}</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>{t('stock.stockDashboard.columns.closingQty')}</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>{t('stock.common.status')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {topConsumed.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      {t('stock.stockDashboard.noConsumption')}
                    </TableCell>
                  </TableRow>
                ) : (
                  topConsumed.map(row => {
                    const closingQty = Number(row.closing_quantity) || 0;
                    return (
                      <TableRow key={row.itemid}>
                        <TableCell>{row.itemname}</TableCell>
                        <TableCell>{Number(row.consumption_quantity)}</TableCell>
                        <TableCell>{Number(row.usage_price)}</TableCell>
                        <TableCell>{closingQty}</TableCell>
                        <TableCell>
                          <Chip
                            label={closingQty > 0 ? t('stock.common.inStock') : t('stock.common.outOfStock')}
                            color={closingQty > 0 ? 'success' : 'warning'}
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <Grid container spacing={2}>
        <Grid item xs={12} md={8}>
          <Card sx={{ boxShadow: 3, borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                {t('stock.stockDashboard.stockAlerts')}
              </Typography>
              {alertEntries.length === 0 ? (
                <Alert severity="success">{t('stock.stockDashboard.noAlerts')}</Alert>
              ) : (
                <List>
                  {alertEntries.map((alert, index) => (
                    <React.Fragment key={`${alert.primary}-${index}`}>
                      <ListItem>
                        <ListItemText primary={alert.primary} secondary={alert.secondary} />
                      </ListItem>
                      {index < alertEntries.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ boxShadow: 3, borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                {t('stock.stockDashboard.quickActions')}
              </Typography>
              <Stack spacing={2}>
                <Button
                  variant="contained"
                  startIcon={<ShoppingCart />}
                  fullWidth
                  onClick={() => navigate('/stock/purchases')}
                  sx={{
                    backgroundColor: '#77B255',
                    '&:hover': { backgroundColor: '#5a8a3f' }
                  }}
                >
                  {t('stock.stockDashboard.recordPurchase')}
                </Button>
                <Button
                  variant="contained"
                  startIcon={<Inventory />}
                  fullWidth
                  onClick={() => navigate('/issuance/add-stock-issuance')}
                  sx={{
                    backgroundColor: '#77B255',
                    '&:hover': { backgroundColor: '#5a8a3f' }
                  }}
                >
                  {t('stock.stockDashboard.recordIssuance')}
                </Button>
                <Button
                  variant="contained"
                  startIcon={<AddCircleOutline />}
                  fullWidth
                  onClick={() => navigate('/stock-registration')}
                  sx={{
                    backgroundColor: '#77B255',
                    '&:hover': { backgroundColor: '#5a8a3f' }
                  }}
                >
                  {t('stock.stockDashboard.addNewStock')}
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

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

export default StockDashboard;
