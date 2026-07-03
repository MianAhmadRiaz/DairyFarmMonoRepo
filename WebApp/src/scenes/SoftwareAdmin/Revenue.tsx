import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Grid,
  MenuItem,
  Pagination,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography
} from '@mui/material';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import {
  FarmPayment,
  RevenueDashboard,
  getRevenueDashboard,
  getRevenuePayments
} from '../../shared/services/SoftwareAdminAPI/softwareAdmin.service';

const StatCard = ({ label, value, color }: { label: string; value: React.ReactNode; color: string }) => (
  <Card sx={{ borderRadius: 3, borderTop: `4px solid ${color}`, height: '100%' }}>
    <CardContent>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="h5" fontWeight={700}>
        {value}
      </Typography>
    </CardContent>
  </Card>
);

const statusColor: Record<string, any> = {
  paid: 'success',
  pending: 'warning',
  failed: 'error',
  refunded: 'default'
};

const statusFilters = ['', 'paid', 'pending', 'failed', 'refunded'];

const Revenue: React.FC = () => {
  const [dashboard, setDashboard] = useState<RevenueDashboard | null>(null);
  const [loading, setLoading] = useState(true);

  // payments ledger
  const [payments, setPayments] = useState<FarmPayment[]>([]);
  const [payLoading, setPayLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [status, setStatus] = useState('');

  useEffect(() => {
    (async () => {
      try {
        setDashboard(await getRevenueDashboard());
      } catch (err: any) {
        toast.error(err?.response?.data?.message || 'Failed to load revenue');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const loadPayments = async () => {
    setPayLoading(true);
    try {
      const res = await getRevenuePayments(page, 20, status || undefined);
      setPayments(res.payments);
      setTotalPages(res.totalPages || 1);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to load payments');
    } finally {
      setPayLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, status]);

  const cur = dashboard?.currency || '';
  const money = (n: number | undefined) => `${cur} ${n ?? 0}`;

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={8}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} mb={3}>
        Revenue
      </Typography>

      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <StatCard label="MRR" value={money(dashboard?.mrr)} color="#22c55e" />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <StatCard label="ARR" value={money(dashboard?.arr)} color="#3b82f6" />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <StatCard label="Collected This Month" value={money(dashboard?.collectedThisMonth)} color="#8b5cf6" />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <StatCard label="Total Collected" value={money(dashboard?.collectedTotal)} color="#0ea5e9" />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <StatCard label="Pending" value={money(dashboard?.pendingPayments)} color="#f59e0b" />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <StatCard label="Outstanding" value={money(dashboard?.outstanding)} color="#ef4444" />
        </Grid>
      </Grid>

      <Grid container spacing={2} mb={3}>
        {/* Trend chart */}
        <Grid item xs={12} md={7}>
          <Paper sx={{ borderRadius: 3, p: 2, height: 340 }}>
            <Typography variant="h6" fontWeight={700} mb={1}>
              Revenue Trend (6 months)
            </Typography>
            {dashboard?.trend && dashboard.trend.length > 0 ? (
              <ResponsiveContainer width="100%" height={270}>
                <BarChart data={dashboard.trend}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip formatter={(v: any) => `${cur} ${v}`} />
                  <Bar dataKey="total" fill="#22c55e" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Typography color="text.secondary">No trend data.</Typography>
            )}
          </Paper>
        </Grid>

        {/* Revenue by plan */}
        <Grid item xs={12} md={5}>
          <Paper sx={{ borderRadius: 3, height: 340, overflow: 'auto' }}>
            <Box p={2}>
              <Typography variant="h6" fontWeight={700}>
                Revenue by Plan
              </Typography>
            </Box>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Plan</TableCell>
                  <TableCell align="right">Farms</TableCell>
                  <TableCell align="right">Total</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(!dashboard?.revenueByPlan || dashboard.revenueByPlan.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={3}>No data.</TableCell>
                  </TableRow>
                )}
                {dashboard?.revenueByPlan?.map(row => (
                  <TableRow key={row.plan_name}>
                    <TableCell>{row.plan_name}</TableCell>
                    <TableCell align="right">{row.farmCount}</TableCell>
                    <TableCell align="right">
                      {cur} {row.totalAmount}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        </Grid>
      </Grid>

      {/* All-farm payments ledger */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6" fontWeight={700}>
          Payments Ledger
        </Typography>
        <TextField
          select
          size="small"
          label="Status"
          value={status}
          onChange={e => {
            setPage(1);
            setStatus(e.target.value);
          }}
          sx={{ minWidth: 180 }}
        >
          {statusFilters.map(s => (
            <MenuItem key={s || 'all'} value={s}>
              {s === '' ? 'All' : s}
            </MenuItem>
          ))}
        </TextField>
      </Box>

      <Paper sx={{ borderRadius: 3 }}>
        {payLoading ? (
          <Box display="flex" justifyContent="center" p={4}>
            <CircularProgress />
          </Box>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Invoice</TableCell>
                <TableCell>Farm</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Method</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {payments.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6}>No payments found.</TableCell>
                </TableRow>
              )}
              {payments.map(p => (
                <TableRow key={p.uuid}>
                  <TableCell>{p.invoice_number}</TableCell>
                  <TableCell>{p.farm?.name || p.farmId}</TableCell>
                  <TableCell>
                    {p.amount} {p.currency}
                  </TableCell>
                  <TableCell>{p.method}</TableCell>
                  <TableCell>{p.payment_date}</TableCell>
                  <TableCell>
                    <Chip size="small" label={p.status} color={statusColor[p.status]} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        <Stack alignItems="center" p={2}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, v) => setPage(v)}
            color="primary"
          />
        </Stack>
      </Paper>
      <ToastContainer position="top-right" autoClose={4000} />
    </Box>
  );
};

export default Revenue;
