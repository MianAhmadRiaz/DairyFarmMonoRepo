import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  MenuItem,
  Paper,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Stack,
  CircularProgress,
  Divider,
  LinearProgress
} from '@mui/material';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useTranslation, Trans } from 'react-i18next';

import {
  Farm,
  FarmUsage,
  FeatureFlag,
  SubscriptionPlan,
  approveOrRejectFarm,
  assignSubscription,
  blockUnblockFarm,
  getFarms,
  getFarmUsage,
  getFeatureFlags,
  getPlans,
  impersonateFarm,
  revokeFarm,
  setFarmDiscount,
  setFeatureFlag
} from '../../shared/services/SoftwareAdminAPI/softwareAdmin.service';

const statusColor: Record<string, any> = {
  APPROVED: 'success',
  PENDING: 'warning',
  REJECTED: 'error'
};

const Farms: React.FC = () => {
  const { t } = useTranslation();
  const [farms, setFarms] = useState<Farm[]>([]);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);

  // assign subscription dialog
  const [assignOpen, setAssignOpen] = useState(false);
  const [assignFarm, setAssignFarm] = useState<Farm | null>(null);
  const [planId, setPlanId] = useState('');
  const [graceDays, setGraceDays] = useState('7');
  const [saving, setSaving] = useState(false);

  // feature flags dialog
  const [flagsOpen, setFlagsOpen] = useState(false);
  const [flagsFarm, setFlagsFarm] = useState<Farm | null>(null);
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [flagsLoading, setFlagsLoading] = useState(false);

  // revoke dialog
  const [revokeOpen, setRevokeOpen] = useState(false);
  const [revokeFarmTarget, setRevokeFarmTarget] = useState<Farm | null>(null);
  const [revokeReason, setRevokeReason] = useState('');

  // discount dialog
  const [discountOpen, setDiscountOpen] = useState(false);
  const [discountFarm, setDiscountFarm] = useState<Farm | null>(null);
  const [discountType, setDiscountType] = useState<'none' | 'percentage' | 'flat'>('none');
  const [discountValue, setDiscountValue] = useState('');
  const [discountNote, setDiscountNote] = useState('');

  // usage dialog
  const [usageOpen, setUsageOpen] = useState(false);
  const [usageFarm, setUsageFarm] = useState<Farm | null>(null);
  const [usage, setUsage] = useState<FarmUsage | null>(null);
  const [usageLoading, setUsageLoading] = useState(false);

  // impersonate dialog
  const [impOpen, setImpOpen] = useState(false);
  const [impFarm, setImpFarm] = useState<Farm | null>(null);
  const [impToken, setImpToken] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const [farmRes, planRes] = await Promise.all([getFarms(1, 100), getPlans(true)]);
      setFarms(farmRes.farms);
      setPlans(planRes);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || t('softwareAdmin.farms.loadFailed'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleApproval = async (farm: Farm, status: 'APPROVED' | 'REJECTED') => {
    try {
      await approveOrRejectFarm(farm.uuid, status);
      toast.success(
        status === 'APPROVED'
          ? t('softwareAdmin.farms.toast.approved')
          : t('softwareAdmin.farms.toast.rejected')
      );
      load();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || t('softwareAdmin.farms.actionFailed'));
    }
  };

  const handleBlock = async (farm: Farm) => {
    try {
      await blockUnblockFarm(farm.uuid);
      toast.success(farm.isBlocked ? t('softwareAdmin.farms.toast.unblocked') : t('softwareAdmin.farms.toast.blocked'));
      load();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || t('softwareAdmin.farms.actionFailed'));
    }
  };

  const openAssign = (farm: Farm) => {
    setAssignFarm(farm);
    setPlanId('');
    setGraceDays('7');
    setAssignOpen(true);
  };

  const handleAssign = async () => {
    if (!assignFarm || !planId) {
      toast.error(t('softwareAdmin.farms.selectPlan'));
      return;
    }
    setSaving(true);
    try {
      await assignSubscription({
        farmId: assignFarm.uuid,
        planId,
        grace_days: Number(graceDays) || 7
      });
      toast.success(t('softwareAdmin.farms.toast.subscriptionAssigned'));
      setAssignOpen(false);
      load();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || t('softwareAdmin.farms.failedAssign'));
    } finally {
      setSaving(false);
    }
  };

  const openFlags = async (farm: Farm) => {
    setFlagsFarm(farm);
    setFlagsOpen(true);
    setFlagsLoading(true);
    try {
      setFlags(await getFeatureFlags(farm.uuid));
    } catch (err: any) {
      toast.error(err?.response?.data?.message || t('softwareAdmin.farms.failedLoadModules'));
    } finally {
      setFlagsLoading(false);
    }
  };

  const toggleFlag = async (moduleKey: string, value: boolean) => {
    if (!flagsFarm) return;
    setFlags(prev => prev.map(f => (f.module_key === moduleKey ? { ...f, is_enabled: value } : f)));
    try {
      await setFeatureFlag(flagsFarm.uuid, moduleKey, value);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || t('softwareAdmin.farms.failedUpdateModule'));
      // revert on error
      setFlags(prev => prev.map(f => (f.module_key === moduleKey ? { ...f, is_enabled: !value } : f)));
    }
  };

  // ---- Revoke / Restore ----
  const openRevoke = (farm: Farm) => {
    setRevokeFarmTarget(farm);
    setRevokeReason('');
    setRevokeOpen(true);
  };

  const handleRevoke = async () => {
    if (!revokeFarmTarget) return;
    setSaving(true);
    try {
      await revokeFarm(revokeFarmTarget.uuid, true, revokeReason || undefined);
      toast.success(t('softwareAdmin.farms.toast.accessRevoked'));
      setRevokeOpen(false);
      load();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || t('softwareAdmin.farms.failedRevoke'));
    } finally {
      setSaving(false);
    }
  };

  const handleRestore = async (farm: Farm) => {
    try {
      await revokeFarm(farm.uuid, false);
      toast.success(t('softwareAdmin.farms.toast.accessRestored'));
      load();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || t('softwareAdmin.farms.failedRestore'));
    }
  };

  // ---- Discount ----
  const openDiscount = (farm: Farm) => {
    setDiscountFarm(farm);
    setDiscountType(farm.discount_type || 'none');
    setDiscountValue(farm.discount_value != null ? String(farm.discount_value) : '');
    setDiscountNote(farm.discount_note || '');
    setDiscountOpen(true);
  };

  const handleDiscount = async () => {
    if (!discountFarm) return;
    if (discountType !== 'none' && (discountValue === '' || isNaN(Number(discountValue)))) {
      toast.error(t('softwareAdmin.farms.enterValidDiscount'));
      return;
    }
    setSaving(true);
    try {
      await setFarmDiscount({
        farmId: discountFarm.uuid,
        discount_type: discountType,
        discount_value: discountType === 'none' ? 0 : Number(discountValue),
        discount_note: discountNote || undefined
      });
      toast.success(t('softwareAdmin.farms.toast.discountUpdated'));
      setDiscountOpen(false);
      load();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || t('softwareAdmin.farms.failedUpdateDiscount'));
    } finally {
      setSaving(false);
    }
  };

  // ---- Usage ----
  const openUsage = async (farm: Farm) => {
    setUsageFarm(farm);
    setUsage(null);
    setUsageOpen(true);
    setUsageLoading(true);
    try {
      setUsage(await getFarmUsage(farm.uuid));
    } catch (err: any) {
      toast.error(err?.response?.data?.message || t('softwareAdmin.farms.failedLoadUsage'));
    } finally {
      setUsageLoading(false);
    }
  };

  // ---- Impersonate ----
  const handleImpersonate = async (farm: Farm) => {
    try {
      const res = await impersonateFarm(farm.uuid);
      // Open the farm app in a new tab carrying the impersonation token.
      window.open('/?impersonate=' + encodeURIComponent(res.token), '_blank');
      // Also surface a copyable token dialog as a fallback.
      setImpFarm(farm);
      setImpToken(res.token);
      setImpOpen(true);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || t('softwareAdmin.farms.failedImpersonate'));
    }
  };

  const copyToken = async () => {
    try {
      await navigator.clipboard.writeText(impToken);
      toast.success(t('softwareAdmin.farms.toast.tokenCopied'));
    } catch {
      toast.error(t('softwareAdmin.farms.copyFailed'));
    }
  };

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
        {t('softwareAdmin.farms.title')}
      </Typography>

      <Paper sx={{ borderRadius: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{t('softwareAdmin.farms.columns.name')}</TableCell>
              <TableCell>{t('softwareAdmin.farms.columns.approval')}</TableCell>
              <TableCell>{t('softwareAdmin.farms.columns.access')}</TableCell>
              <TableCell align="right">{t('softwareAdmin.farms.columns.actions')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {farms.length === 0 && (
              <TableRow>
                <TableCell colSpan={4}>{t('softwareAdmin.farms.noFarms')}</TableCell>
              </TableRow>
            )}
            {farms.map(farm => (
              <TableRow key={farm.uuid}>
                <TableCell>
                  <Typography fontWeight={600}>{farm.name}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {farm.location}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip size="small" label={t('softwareAdmin.farms.status.' + farm.status, farm.status)} color={statusColor[farm.status] || 'default'} />
                </TableCell>
                <TableCell>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    <Chip
                      size="small"
                      label={farm.is_active ? t('softwareAdmin.farms.active') : t('softwareAdmin.farms.inactive')}
                      color={farm.is_active ? 'success' : 'default'}
                    />
                    {farm.isBlocked && <Chip size="small" label={t('softwareAdmin.farms.blocked')} color="error" />}
                    {farm.is_revoked && <Chip size="small" label={t('softwareAdmin.farms.revoked')} color="error" variant="outlined" />}
                    {farm.discount_type && farm.discount_type !== 'none' && (
                      <Chip
                        size="small"
                        color="secondary"
                        label={t('softwareAdmin.farms.discountChip', { value: `${farm.discount_value}${farm.discount_type === 'percentage' ? '%' : ''}` })}
                      />
                    )}
                  </Stack>
                </TableCell>
                <TableCell align="right">
                  <Stack direction="row" spacing={1} justifyContent="flex-end" flexWrap="wrap" useFlexGap>
                    {farm.status === 'PENDING' && (
                      <>
                        <Button size="small" color="success" variant="outlined" onClick={() => handleApproval(farm, 'APPROVED')}>
                          {t('softwareAdmin.farms.actions.approve')}
                        </Button>
                        <Button size="small" color="error" variant="outlined" onClick={() => handleApproval(farm, 'REJECTED')}>
                          {t('softwareAdmin.farms.actions.reject')}
                        </Button>
                      </>
                    )}
                    <Button size="small" variant="outlined" onClick={() => openAssign(farm)}>
                      {t('softwareAdmin.farms.actions.assignPlan')}
                    </Button>
                    <Button size="small" variant="outlined" onClick={() => openFlags(farm)}>
                      {t('softwareAdmin.farms.actions.modules')}
                    </Button>
                    <Button
                      size="small"
                      color={farm.isBlocked ? 'success' : 'warning'}
                      variant="outlined"
                      onClick={() => handleBlock(farm)}
                    >
                      {farm.isBlocked ? t('softwareAdmin.farms.actions.unblock') : t('softwareAdmin.farms.actions.block')}
                    </Button>
                    <Button size="small" variant="outlined" onClick={() => openUsage(farm)}>
                      {t('softwareAdmin.farms.actions.usage')}
                    </Button>
                    <Button size="small" variant="outlined" onClick={() => openDiscount(farm)}>
                      {t('softwareAdmin.farms.actions.discount')}
                    </Button>
                    <Button size="small" color="info" variant="outlined" onClick={() => handleImpersonate(farm)}>
                      {t('softwareAdmin.farms.actions.impersonate')}
                    </Button>
                    {farm.is_revoked ? (
                      <Button size="small" color="success" variant="outlined" onClick={() => handleRestore(farm)}>
                        {t('softwareAdmin.farms.actions.restore')}
                      </Button>
                    ) : (
                      <Button size="small" color="error" variant="outlined" onClick={() => openRevoke(farm)}>
                        {t('softwareAdmin.farms.actions.revoke')}
                      </Button>
                    )}
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      {/* Assign subscription dialog */}
      <Dialog open={assignOpen} onClose={() => setAssignOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>{t('softwareAdmin.farms.assignDialog.title', { name: assignFarm?.name })}</DialogTitle>
        <DialogContent>
          <TextField
            select
            fullWidth
            margin="normal"
            label={t('softwareAdmin.farms.assignDialog.plan')}
            value={planId}
            onChange={e => setPlanId(e.target.value)}
          >
            {plans.length === 0 && <MenuItem disabled value="">{t('softwareAdmin.farms.assignDialog.noActivePlans')}</MenuItem>}
            {plans.map(p => (
              <MenuItem key={p.uuid} value={p.uuid}>
                {p.name} — {p.price} {p.currency}/{p.billing_cycle}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            fullWidth
            margin="normal"
            label={t('softwareAdmin.farms.assignDialog.graceDays')}
            type="number"
            value={graceDays}
            onChange={e => setGraceDays(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignOpen(false)}>{t('common.cancel')}</Button>
          <Button variant="contained" onClick={handleAssign} disabled={saving}>
            {saving ? t('softwareAdmin.farms.assignDialog.assigning') : t('softwareAdmin.farms.assignDialog.assign')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Feature flags dialog */}
      <Dialog open={flagsOpen} onClose={() => setFlagsOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>{t('softwareAdmin.farms.modulesDialog.title', { name: flagsFarm?.name })}</DialogTitle>
        <DialogContent>
          {flagsLoading ? (
            <Box display="flex" justifyContent="center" p={3}>
              <CircularProgress />
            </Box>
          ) : (
            flags.map(flag => (
              <FormControlLabel
                key={flag.module_key}
                sx={{ display: 'flex', justifyContent: 'space-between', ml: 0 }}
                labelPlacement="start"
                control={
                  <Switch
                    checked={flag.is_enabled}
                    onChange={e => toggleFlag(flag.module_key, e.target.checked)}
                  />
                }
                label={<Typography textTransform="capitalize">{t('softwareAdmin.farms.modules.' + flag.module_key, flag.module_key)}</Typography>}
              />
            ))
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFlagsOpen(false)}>{t('common.close')}</Button>
        </DialogActions>
      </Dialog>

      {/* Revoke dialog */}
      <Dialog open={revokeOpen} onClose={() => setRevokeOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>{t('softwareAdmin.farms.revokeDialog.title', { name: revokeFarmTarget?.name })}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            {t('softwareAdmin.farms.revokeDialog.description')}
          </Typography>
          <TextField
            fullWidth
            margin="normal"
            label={t('softwareAdmin.farms.revokeDialog.reason')}
            multiline
            rows={2}
            value={revokeReason}
            onChange={e => setRevokeReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRevokeOpen(false)}>{t('common.cancel')}</Button>
          <Button color="error" variant="contained" onClick={handleRevoke} disabled={saving}>
            {saving ? t('softwareAdmin.farms.revokeDialog.revoking') : t('softwareAdmin.farms.revokeDialog.revoke')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Discount dialog */}
      <Dialog open={discountOpen} onClose={() => setDiscountOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>{t('softwareAdmin.farms.discountDialog.title', { name: discountFarm?.name })}</DialogTitle>
        <DialogContent>
          <TextField
            select
            fullWidth
            margin="normal"
            label={t('softwareAdmin.farms.discountDialog.type')}
            value={discountType}
            onChange={e => setDiscountType(e.target.value as any)}
          >
            <MenuItem value="none">{t('softwareAdmin.farms.discountDialog.none')}</MenuItem>
            <MenuItem value="percentage">{t('softwareAdmin.farms.discountDialog.percentage')}</MenuItem>
            <MenuItem value="flat">{t('softwareAdmin.farms.discountDialog.flat')}</MenuItem>
          </TextField>
          {discountType !== 'none' && (
            <TextField
              fullWidth
              margin="normal"
              label={discountType === 'percentage' ? t('softwareAdmin.farms.discountDialog.percentageLabel') : t('softwareAdmin.farms.discountDialog.flatLabel')}
              type="number"
              value={discountValue}
              onChange={e => setDiscountValue(e.target.value)}
            />
          )}
          <TextField
            fullWidth
            margin="normal"
            label={t('softwareAdmin.farms.discountDialog.note')}
            value={discountNote}
            onChange={e => setDiscountNote(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDiscountOpen(false)}>{t('common.cancel')}</Button>
          <Button variant="contained" onClick={handleDiscount} disabled={saving}>
            {saving ? t('softwareAdmin.farms.discountDialog.saving') : t('common.save')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Usage dialog */}
      <Dialog open={usageOpen} onClose={() => setUsageOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>{t('softwareAdmin.farms.usageDialog.title', { name: usageFarm?.name })}</DialogTitle>
        <DialogContent>
          {usageLoading ? (
            <Box display="flex" justifyContent="center" p={3}>
              <CircularProgress />
            </Box>
          ) : usage ? (
            <Box>
              {([['animals', t('softwareAdmin.farms.usageDialog.animals'), usage.animals], ['employees', t('softwareAdmin.farms.usageDialog.employees'), usage.employees]] as const).map(([key, label, m]) => {
                const limit = m.limit;
                const pct = limit ? Math.min(100, (m.used / limit) * 100) : 0;
                return (
                  <Box key={key} sx={{ mb: 2 }}>
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="body2" fontWeight={600}>
                        {label}
                      </Typography>
                      <Typography variant="body2" color={m.overLimit ? 'error' : 'text.secondary'}>
                        {m.used} / {limit ?? '∞'}
                        {m.overLimit ? ` ${t('softwareAdmin.farms.usageDialog.overLimit')}` : ''}
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={limit ? pct : 0}
                      color={m.overLimit ? 'error' : 'primary'}
                      sx={{ height: 8, borderRadius: 4, mt: 0.5 }}
                    />
                  </Box>
                );
              })}
              <Divider sx={{ my: 1 }} />
              <Typography variant="body2" color="text.secondary">
                {t('softwareAdmin.farms.usageDialog.plan', { plan: usage.subscription?.plan_name || '—', status: usage.subscription?.status || '—' })}
              </Typography>
              {usage.subscription?.pricing_model === 'per_animal' && (
                <Typography variant="body2" color="text.secondary">
                  {t('softwareAdmin.farms.usageDialog.perAnimalRate', { rate: usage.subscription?.per_animal_rate, count: usage.subscription?.billed_animal_count })}
                </Typography>
              )}
            </Box>
          ) : (
            <Typography>{t('softwareAdmin.farms.usageDialog.noData')}</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUsageOpen(false)}>{t('common.close')}</Button>
        </DialogActions>
      </Dialog>

      {/* Impersonate token dialog */}
      <Dialog open={impOpen} onClose={() => setImpOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{t('softwareAdmin.farms.impersonateDialog.title', { name: impFarm?.name })}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            <Trans i18nKey="softwareAdmin.farms.impersonateDialog.description" components={{ code: <code /> }} />
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            value={impToken}
            InputProps={{ readOnly: true }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={copyToken}>{t('softwareAdmin.farms.impersonateDialog.copyToken')}</Button>
          <Button variant="contained" onClick={() => setImpOpen(false)}>
            {t('softwareAdmin.farms.impersonateDialog.done')}
          </Button>
        </DialogActions>
      </Dialog>
      <ToastContainer position="top-right" autoClose={4000} />
    </Box>
  );
};

export default Farms;
