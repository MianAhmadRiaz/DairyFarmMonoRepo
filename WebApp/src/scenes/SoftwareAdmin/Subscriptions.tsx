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
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();
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
      toast.error(err?.response?.data?.message || t('softwareAdmin.subscriptions.loadFailed'));
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
      toast.error(err?.response?.data?.message || t('softwareAdmin.subscriptions.actionFailed'));
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
      toast.error(t('softwareAdmin.subscriptions.enterValidDays'));
      return;
    }
    setSaving(true);
    try {
      await extendSubscription(extendSub.uuid, { days });
      toast.success(t('softwareAdmin.subscriptions.toast.dueDateExtended'));
      setExtendOpen(false);
      load();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || t('softwareAdmin.subscriptions.failedExtend'));
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
      toast.error(err?.response?.data?.message || t('softwareAdmin.subscriptions.trueUpFailed'));
    } finally {
      setTrueUpBusy(null);
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight={700}>
          {t('softwareAdmin.subscriptions.title')}
        </Typography>
        <TextField
          select
          size="small"
          label={t('softwareAdmin.subscriptions.statusFilter')}
          value={status}
          onChange={e => setStatus(e.target.value)}
          sx={{ minWidth: 180 }}
        >
          {statusFilters.map(s => (
            <MenuItem key={s || 'all'} value={s}>
              {s === '' ? t('softwareAdmin.subscriptions.all') : t('softwareAdmin.subscriptions.status.' + s, s)}
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
                <TableCell>{t('softwareAdmin.subscriptions.columns.farm')}</TableCell>
                <TableCell>{t('softwareAdmin.subscriptions.columns.plan')}</TableCell>
                <TableCell>{t('softwareAdmin.subscriptions.columns.pricing')}</TableCell>
                <TableCell>{t('softwareAdmin.subscriptions.columns.amount')}</TableCell>
                <TableCell>{t('softwareAdmin.subscriptions.columns.discount')}</TableCell>
                <TableCell>{t('softwareAdmin.subscriptions.columns.nextDue')}</TableCell>
                <TableCell>{t('softwareAdmin.subscriptions.columns.status')}</TableCell>
                <TableCell align="right">{t('softwareAdmin.subscriptions.columns.actions')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {subscriptions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8}>{t('softwareAdmin.subscriptions.noSubscriptions')}</TableCell>
                </TableRow>
              )}
              {subscriptions.map(sub => (
                <TableRow key={sub.uuid}>
                  <TableCell>{sub.farm?.name || sub.farmId}</TableCell>
                  <TableCell>{sub.plan_name}</TableCell>
                  <TableCell>
                    {sub.pricing_model === 'per_animal' ? (
                      <>
                        <Chip size="small" label={t('softwareAdmin.subscriptions.perAnimalChip')} color="secondary" />
                        <Typography variant="caption" display="block" color="text.secondary">
                          {t('softwareAdmin.subscriptions.billedAt', { count: sub.billed_animal_count ?? 0, rate: sub.per_animal_rate })}
                        </Typography>
                      </>
                    ) : (
                      <Chip size="small" label={t('softwareAdmin.subscriptions.flatChip')} />
                    )}
                  </TableCell>
                  <TableCell>
                    {sub.amount} {sub.currency}/{t('softwareAdmin.plans.cycles.' + sub.billing_cycle, sub.billing_cycle)}
                    {sub.gross_amount != null && sub.gross_amount !== sub.amount && (
                      <Typography variant="caption" display="block" color="text.secondary">
                        {t('softwareAdmin.subscriptions.gross', { amount: sub.gross_amount })}
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
                    <Chip size="small" label={t('softwareAdmin.subscriptions.status.' + sub.status, sub.status)} color={statusColor[sub.status]} />
                  </TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} justifyContent="flex-end" flexWrap="wrap" useFlexGap>
                      <Button size="small" variant="outlined" onClick={() => openExtend(sub)}>
                        {t('softwareAdmin.subscriptions.actions.extend')}
                      </Button>
                      {sub.pricing_model === 'per_animal' && (
                        <Button
                          size="small"
                          color="secondary"
                          variant="outlined"
                          disabled={trueUpBusy === sub.uuid}
                          onClick={() => handleTrueUp(sub)}
                        >
                          {trueUpBusy === sub.uuid ? t('softwareAdmin.subscriptions.actions.trueUpBusy') : t('softwareAdmin.subscriptions.actions.trueUp')}
                        </Button>
                      )}
                      {sub.status !== 'suspended' && sub.status !== 'cancelled' && (
                        <Button
                          size="small"
                          color="warning"
                          variant="outlined"
                          onClick={() => act(suspendSubscription, sub, t('softwareAdmin.subscriptions.toast.suspended'))}
                        >
                          {t('softwareAdmin.subscriptions.actions.suspend')}
                        </Button>
                      )}
                      {(sub.status === 'suspended' || sub.status === 'past_due') && (
                        <Button
                          size="small"
                          color="success"
                          variant="outlined"
                          onClick={() => act(reactivateSubscription, sub, t('softwareAdmin.subscriptions.toast.reactivated'))}
                        >
                          {t('softwareAdmin.subscriptions.actions.reactivate')}
                        </Button>
                      )}
                      {sub.status !== 'cancelled' && (
                        <Button
                          size="small"
                          color="error"
                          variant="outlined"
                          onClick={() => act(cancelSubscription, sub, t('softwareAdmin.subscriptions.toast.cancelled'))}
                        >
                          {t('softwareAdmin.subscriptions.actions.cancel')}
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
        <DialogTitle>{t('softwareAdmin.subscriptions.extendDialog.title', { name: extendSub?.farm?.name || extendSub?.farmId })}</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 1 }}>
            {t('softwareAdmin.subscriptions.extendDialog.currentDueDate', { date: extendSub?.next_due_date })}
          </DialogContentText>
          <TextField
            fullWidth
            margin="normal"
            label={t('softwareAdmin.subscriptions.extendDialog.extendByDays')}
            type="number"
            value={extendDays}
            onChange={e => setExtendDays(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExtendOpen(false)}>{t('common.cancel')}</Button>
          <Button variant="contained" onClick={handleExtend} disabled={saving}>
            {saving ? t('softwareAdmin.subscriptions.extendDialog.extending') : t('softwareAdmin.subscriptions.actions.extend')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* True-up result dialog */}
      <Dialog open={trueUpOpen} onClose={() => setTrueUpOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>{t('softwareAdmin.subscriptions.trueUpDialog.title')}</DialogTitle>
        <DialogContent>
          {trueUpResult ? (
            <Stack spacing={1} sx={{ mt: 1 }}>
              <Typography variant="h5" fontWeight={700} color="primary">
                {t('softwareAdmin.subscriptions.trueUpDialog.proratedCharge', { charge: trueUpResult.proratedCharge, currency: trueUpResult.currency })}
              </Typography>
              <Typography variant="body2">{t('softwareAdmin.subscriptions.trueUpDialog.addedAnimals', { count: trueUpResult.addedAnimals })}</Typography>
              <Typography variant="body2">{t('softwareAdmin.subscriptions.trueUpDialog.currentCount', { count: trueUpResult.currentCount })}</Typography>
              <Typography variant="body2">{t('softwareAdmin.subscriptions.trueUpDialog.billedCount', { count: trueUpResult.billedCount })}</Typography>
              <Typography variant="body2">{t('softwareAdmin.subscriptions.trueUpDialog.remainingDays', { count: trueUpResult.remainingDays })}</Typography>
            </Stack>
          ) : (
            <Typography>{t('softwareAdmin.subscriptions.trueUpDialog.noResult')}</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button variant="contained" onClick={() => setTrueUpOpen(false)}>
            {t('common.close')}
          </Button>
        </DialogActions>
      </Dialog>
      <ToastContainer position="top-right" autoClose={4000} />
    </Box>
  );
};

export default Subscriptions;
