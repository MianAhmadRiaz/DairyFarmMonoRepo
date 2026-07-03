import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography
} from '@mui/material';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { BillingOverview, getBillingOverview } from '../../shared/services/SoftwareAdminAPI/softwareAdmin.service';

const StatCard = ({ label, value, color }: { label: string; value: React.ReactNode; color: string }) => (
  <Card sx={{ borderRadius: 3, borderTop: `4px solid ${color}` }}>
    <CardContent>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="h4" fontWeight={700}>
        {value}
      </Typography>
    </CardContent>
  </Card>
);

const statusColor: Record<string, any> = {
  active: 'success',
  trialing: 'info',
  past_due: 'warning',
  suspended: 'error',
  cancelled: 'default'
};

const Dashboard: React.FC = () => {
  const [overview, setOverview] = useState<BillingOverview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await getBillingOverview();
        setOverview(data);
      } catch (err: any) {
        toast.error(err?.response?.data?.message || 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={8}>
        <CircularProgress />
      </Box>
    );
  }

  if (!overview) return <Typography>No data available.</Typography>;

  const fmt = (n: number) => n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} mb={3}>
        Billing Dashboard
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard label="Total Farms" value={overview.farms.total} color="#3b82f6" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard label="Active Farms" value={overview.farms.active} color="#22c55e" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard label="Suspended Farms" value={overview.farms.suspended} color="#ef4444" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard label="Revenue (This Month)" value={fmt(overview.revenue.thisMonth)} color="#a855f7" />
        </Grid>
      </Grid>

      <Grid container spacing={2} mt={0.5}>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatCard label="Active Subs" value={overview.subscriptions.active} color="#22c55e" />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatCard label="Trialing" value={overview.subscriptions.trialing} color="#3b82f6" />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatCard label="Past Due" value={overview.subscriptions.past_due} color="#f59e0b" />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatCard label="Suspended" value={overview.subscriptions.suspended} color="#ef4444" />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatCard label="Cancelled" value={overview.subscriptions.cancelled} color="#6b7280" />
        </Grid>
      </Grid>

      <Grid container spacing={2} mt={1}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, borderRadius: 3 }}>
            <Typography variant="h6" mb={1}>
              Overdue / Suspended Subscriptions
            </Typography>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Farm</TableCell>
                  <TableCell>Plan</TableCell>
                  <TableCell>Due</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {overview.overdueSubscriptions.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4}>None 🎉</TableCell>
                  </TableRow>
                )}
                {overview.overdueSubscriptions.map(s => (
                  <TableRow key={s.uuid}>
                    <TableCell>{s.farm?.name || s.farmId}</TableCell>
                    <TableCell>{s.plan_name}</TableCell>
                    <TableCell>{s.next_due_date}</TableCell>
                    <TableCell>
                      <Chip size="small" label={s.status} color={statusColor[s.status]} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, borderRadius: 3 }}>
            <Typography variant="h6" mb={1}>
              Recent Payments
            </Typography>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Invoice</TableCell>
                  <TableCell>Farm</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {overview.recentPayments.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4}>No payments yet</TableCell>
                  </TableRow>
                )}
                {overview.recentPayments.map(p => (
                  <TableRow key={p.uuid}>
                    <TableCell>{p.invoice_number}</TableCell>
                    <TableCell>{p.farm?.name || p.farmId}</TableCell>
                    <TableCell>
                      {p.amount} {p.currency}
                    </TableCell>
                    <TableCell>{p.payment_date}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        </Grid>
      </Grid>
      <ToastContainer position="top-right" autoClose={4000} />
    </Box>
  );
};

export default Dashboard;
