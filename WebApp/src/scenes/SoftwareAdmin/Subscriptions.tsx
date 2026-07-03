import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  MenuItem,
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
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import {
  FarmSubscription,
  TrueUpResult,
  cancelSubscription,
  extendSubscription,
  getSubscriptions,
  reactivateSubscription,
  suspendSubscription,
  trueUpSubscription
} from '../../shared/services/SoftwareAdminAPI/softwareAdmin.service';

const statusColor: Record<string, any> = {
  active: 'success',
  trialing: 'info',
  past_due: 'warning',
  suspended: 'error',
  cancelled: 'default'
};

const statusFilters = ['', 'active', 'trialing', 'past_due', 'suspended', 'cancelled'];

const Subscriptions: React.FC = () => {
  const [subscriptions, setSubscriptions] = useState<FarmSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');

  // extend dialog
  const [extendOpen, setExtendOpen] = useState(false);
  const [extendSub, setExtendSub] = useState<FarmSubscription | null>(null);
  const [extendDays, setExtendDays] = useState('30');
  const [saving, setSaving] = useState(false);

  // true-up result dialog
  const [trueUpOpen, setTrueUpOpen] = useState(false);
  const [trueUpResult, setTrueUpResult] = useState<TrueUpResult | null>(null);
  const [trueUpBusy, setTrueUpBusy] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await getSubscriptions(1, 100, status || undefined);
      setSubscriptions(res.subscriptions);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to load subscriptions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const act = async (fn: (id: string) => Promise<void>, sub: FarmSubscription, msg: string) => {
    try {
      await fn(sub.uuid);
      toast.success(msg);
      load();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Action failed');
    }
  };

  const openExtend = (sub: FarmSubscription) => {
    setExtendSub(sub);
    setExtendDays('30');
    setExtendOpen(true);
  };

  const handleExtend = async () => {
    if (!extendSub) return;
    const days = Number(extendDays);
    if (!days || isNaN(days) || days <= 0) {
      toast.error('Enter a valid number of days');
      return;
    }
    setSaving(true);
    try {
      await extendSubscription(extendSub.uuid, { days });
      toast.success('Due date extended');
      setExtendOpen(false);
      load();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to extend');
    } finally {
      setSaving(false);
    }
  };

  const handleTrueUp = async (sub: FarmSubscription) => {
    setTrueUpBusy(sub.uuid);
    try {
      const result = await trueUpSubscription(sub.uuid);
      setTrueUpResult(result);
      setTrueUpOpen(true);
      load();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'True-up failed');
    } finally {
      setTrueUpBusy(null);
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight={700}>
          Subscriptions
        </Typography>
        <TextField
          select
          size="small"
          label="Status"
          value={status}
          onChange={e => setStatus(e.target.value)}
          sx={{ minWidth: 180 }}
        >
          {statusFilters.map(s => (
            <MenuItem key={s || 'all'} value={s}>
              {s === '' ? 'All' : s}
            </MenuItem>
          ))}
        </TextField>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" mt={8}>
          <CircularProgress />
        </Box>
      ) : (
        <Paper sx={{ borderRadius: 3 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Farm</TableCell>
                <TableCell>Plan</TableCell>
                <TableCell>Pricing</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Discount</TableCell>
                <TableCell>Next Due</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {subscriptions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8}>No subscriptions found.</TableCell>
                </TableRow>
              )}
              {subscriptions.map(sub => (
                <TableRow key={sub.uuid}>
                  <TableCell>{sub.farm?.name || sub.farmId}</TableCell>
                  <TableCell>{sub.plan_name}</TableCell>
                  <TableCell>
                    {sub.pricing_model === 'per_animal' ? (
                      <>
                        <Chip size="small" label="Per-Animal" color="secondary" />
                        <Typography variant="caption" display="block" color="text.secondary">
                          {sub.billed_animal_count ?? 0} billed @ {sub.per_animal_rate}
                        </Typography>
                      </>
                    ) : (
                      <Chip size="small" label="Flat" />
                    )}
                  </TableCell>
                  <TableCell>
                    {sub.amount} {sub.currency}/{sub.billing_cycle}
                    {sub.gross_amount != null && sub.gross_amount !== sub.amount && (
                      <Typography variant="caption" display="block" color="text.secondary">
                        gross {sub.gross_amount}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    {sub.discount_type && sub.discount_type !== 'none' ? (
                      <Chip
                        size="small"
                        color="secondary"
                        label={`${sub.discount_value}${sub.discount_type === 'percentage' ? '%' : ''}`}
                      />
                    ) : (
                      '—'
                    )}
                  </TableCell>
                  <TableCell>{sub.next_due_date}</TableCell>
                  <TableCell>
                    <Chip size="small" label={sub.status} color={statusColor[sub.status]} />
                  </TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} justifyContent="flex-end" flexWrap="wrap" useFlexGap>
                      <Button size="small" variant="outlined" onClick={() => openExtend(sub)}>
                        Extend
                      </Button>
                      {sub.pricing_model === 'per_animal' && (
                        <Button
                          size="small"
                          color="secondary"
                          variant="outlined"
                          disabled={trueUpBusy === sub.uuid}
                          onClick={() => handleTrueUp(sub)}
                        >
                          {trueUpBusy === sub.uuid ? 'True-Up…' : 'True-Up'}
                        </Button>
                      )}
                      {sub.status !== 'suspended' && sub.status !== 'cancelled' && (
                        <Button
                          size="small"
                          color="warning"
                          variant="outlined"
                          onClick={() => act(suspendSubscription, sub, 'Subscription suspended')}
                        >
                          Suspend
                        </Button>
                      )}
                      {(sub.status === 'suspended' || sub.status === 'past_due') && (
                        <Button
                          size="small"
                          color="success"
                          variant="outlined"
                          onClick={() => act(reactivateSubscription, sub, 'Subscription reactivated')}
                        >
                          Reactivate
                        </Button>
                      )}
                      {sub.status !== 'cancelled' && (
                        <Button
                          size="small"
                          color="error"
                          variant="outlined"
                          onClick={() => act(cancelSubscription, sub, 'Subscription cancelled')}
                        >
                          Cancel
                        </Button>
                      )}
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      )}

      {/* Extend dialog */}
      <Dialog open={extendOpen} onClose={() => setExtendOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>Extend Due Date — {extendSub?.farm?.name || extendSub?.farmId}</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 1 }}>
            Current due date: {extendSub?.next_due_date}
          </DialogContentText>
          <TextField
            fullWidth
            margin="normal"
            label="Extend by (days)"
            type="number"
            value={extendDays}
            onChange={e => setExtendDays(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExtendOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleExtend} disabled={saving}>
            {saving ? 'Extending…' : 'Extend'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* True-up result dialog */}
      <Dialog open={trueUpOpen} onClose={() => setTrueUpOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>True-Up Result</DialogTitle>
        <DialogContent>
          {trueUpResult ? (
            <Stack spacing={1} sx={{ mt: 1 }}>
              <Typography variant="h5" fontWeight={700} color="primary">
                Prorated charge: {trueUpResult.proratedCharge} {trueUpResult.currency}
              </Typography>
              <Typography variant="body2">Added animals: {trueUpResult.addedAnimals}</Typography>
              <Typography variant="body2">Current count: {trueUpResult.currentCount}</Typography>
              <Typography variant="body2">Billed count: {trueUpResult.billedCount}</Typography>
              <Typography variant="body2">Remaining days: {trueUpResult.remainingDays}</Typography>
            </Stack>
          ) : (
            <Typography>No result.</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button variant="contained" onClick={() => setTrueUpOpen(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
      <ToastContainer position="top-right" autoClose={4000} />
    </Box>
  );
};

export default Subscriptions;
