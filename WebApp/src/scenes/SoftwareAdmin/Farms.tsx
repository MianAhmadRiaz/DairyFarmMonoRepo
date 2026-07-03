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
      toast.error(err?.response?.data?.message || 'Failed to load farms');
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
      toast.success(`Farm ${status.toLowerCase()}`);
      load();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Action failed');
    }
  };

  const handleBlock = async (farm: Farm) => {
    try {
      await blockUnblockFarm(farm.uuid);
      toast.success(farm.isBlocked ? 'Farm unblocked' : 'Farm blocked');
      load();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Action failed');
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
      toast.error('Select a plan');
      return;
    }
    setSaving(true);
    try {
      await assignSubscription({
        farmId: assignFarm.uuid,
        planId,
        grace_days: Number(graceDays) || 7
      });
      toast.success('Subscription assigned');
      setAssignOpen(false);
      load();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to assign');
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
      toast.error(err?.response?.data?.message || 'Failed to load modules');
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
      toast.error(err?.response?.data?.message || 'Failed to update module');
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
      toast.success('Farm access revoked');
      setRevokeOpen(false);
      load();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to revoke');
    } finally {
      setSaving(false);
    }
  };

  const handleRestore = async (farm: Farm) => {
    try {
      await revokeFarm(farm.uuid, false);
      toast.success('Farm access restored');
      load();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to restore');
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
      toast.error('Enter a valid discount value');
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
      toast.success('Discount updated');
      setDiscountOpen(false);
      load();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to update discount');
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
      toast.error(err?.response?.data?.message || 'Failed to load usage');
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
      toast.error(err?.response?.data?.message || 'Failed to impersonate');
    }
  };

  const copyToken = async () => {
    try {
      await navigator.clipboard.writeText(impToken);
      toast.success('Token copied');
    } catch {
      toast.error('Copy failed — select the token manually');
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
        Farms
      </Typography>

      <Paper sx={{ borderRadius: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Approval</TableCell>
              <TableCell>Access</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {farms.length === 0 && (
              <TableRow>
                <TableCell colSpan={4}>No farms found.</TableCell>
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
                  <Chip size="small" label={farm.status} color={statusColor[farm.status] || 'default'} />
                </TableCell>
                <TableCell>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    <Chip
                      size="small"
                      label={farm.is_active ? 'Active' : 'Inactive'}
                      color={farm.is_active ? 'success' : 'default'}
                    />
                    {farm.isBlocked && <Chip size="small" label="Blocked" color="error" />}
                    {farm.is_revoked && <Chip size="small" label="Revoked" color="error" variant="outlined" />}
                    {farm.discount_type && farm.discount_type !== 'none' && (
                      <Chip
                        size="small"
                        color="secondary"
                        label={`Discount ${farm.discount_value}${farm.discount_type === 'percentage' ? '%' : ''}`}
                      />
                    )}
                  </Stack>
                </TableCell>
                <TableCell align="right">
                  <Stack direction="row" spacing={1} justifyContent="flex-end" flexWrap="wrap" useFlexGap>
                    {farm.status === 'PENDING' && (
                      <>
                        <Button size="small" color="success" variant="outlined" onClick={() => handleApproval(farm, 'APPROVED')}>
                          Approve
                        </Button>
                        <Button size="small" color="error" variant="outlined" onClick={() => handleApproval(farm, 'REJECTED')}>
                          Reject
                        </Button>
                      </>
                    )}
                    <Button size="small" variant="outlined" onClick={() => openAssign(farm)}>
                      Assign Plan
                    </Button>
                    <Button size="small" variant="outlined" onClick={() => openFlags(farm)}>
                      Modules
                    </Button>
                    <Button
                      size="small"
                      color={farm.isBlocked ? 'success' : 'warning'}
                      variant="outlined"
                      onClick={() => handleBlock(farm)}
                    >
                      {farm.isBlocked ? 'Unblock' : 'Block'}
                    </Button>
                    <Button size="small" variant="outlined" onClick={() => openUsage(farm)}>
                      Usage
                    </Button>
                    <Button size="small" variant="outlined" onClick={() => openDiscount(farm)}>
                      Discount
                    </Button>
                    <Button size="small" color="info" variant="outlined" onClick={() => handleImpersonate(farm)}>
                      Impersonate
                    </Button>
                    {farm.is_revoked ? (
                      <Button size="small" color="success" variant="outlined" onClick={() => handleRestore(farm)}>
                        Restore
                      </Button>
                    ) : (
                      <Button size="small" color="error" variant="outlined" onClick={() => openRevoke(farm)}>
                        Revoke
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
        <DialogTitle>Assign Plan — {assignFarm?.name}</DialogTitle>
        <DialogContent>
          <TextField
            select
            fullWidth
            margin="normal"
            label="Plan"
            value={planId}
            onChange={e => setPlanId(e.target.value)}
          >
            {plans.length === 0 && <MenuItem disabled value="">No active plans</MenuItem>}
            {plans.map(p => (
              <MenuItem key={p.uuid} value={p.uuid}>
                {p.name} — {p.price} {p.currency}/{p.billing_cycle}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            fullWidth
            margin="normal"
            label="Grace Days"
            type="number"
            value={graceDays}
            onChange={e => setGraceDays(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAssign} disabled={saving}>
            {saving ? 'Assigning…' : 'Assign'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Feature flags dialog */}
      <Dialog open={flagsOpen} onClose={() => setFlagsOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>Modules — {flagsFarm?.name}</DialogTitle>
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
                label={<Typography textTransform="capitalize">{flag.module_key}</Typography>}
              />
            ))
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFlagsOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Revoke dialog */}
      <Dialog open={revokeOpen} onClose={() => setRevokeOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>Revoke Access — {revokeFarmTarget?.name}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            This hard-revokes the farm's access to the app. You can restore it later.
          </Typography>
          <TextField
            fullWidth
            margin="normal"
            label="Reason (optional)"
            multiline
            rows={2}
            value={revokeReason}
            onChange={e => setRevokeReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRevokeOpen(false)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={handleRevoke} disabled={saving}>
            {saving ? 'Revoking…' : 'Revoke'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Discount dialog */}
      <Dialog open={discountOpen} onClose={() => setDiscountOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>Discount — {discountFarm?.name}</DialogTitle>
        <DialogContent>
          <TextField
            select
            fullWidth
            margin="normal"
            label="Discount Type"
            value={discountType}
            onChange={e => setDiscountType(e.target.value as any)}
          >
            <MenuItem value="none">None</MenuItem>
            <MenuItem value="percentage">Percentage</MenuItem>
            <MenuItem value="flat">Flat</MenuItem>
          </TextField>
          {discountType !== 'none' && (
            <TextField
              fullWidth
              margin="normal"
              label={discountType === 'percentage' ? 'Percentage (%)' : 'Flat Amount'}
              type="number"
              value={discountValue}
              onChange={e => setDiscountValue(e.target.value)}
            />
          )}
          <TextField
            fullWidth
            margin="normal"
            label="Note (optional)"
            value={discountNote}
            onChange={e => setDiscountNote(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDiscountOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleDiscount} disabled={saving}>
            {saving ? 'Saving…' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Usage dialog */}
      <Dialog open={usageOpen} onClose={() => setUsageOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>Usage — {usageFarm?.name}</DialogTitle>
        <DialogContent>
          {usageLoading ? (
            <Box display="flex" justifyContent="center" p={3}>
              <CircularProgress />
            </Box>
          ) : usage ? (
            <Box>
              {([['Animals', usage.animals], ['Employees', usage.employees]] as const).map(([label, m]) => {
                const limit = m.limit;
                const pct = limit ? Math.min(100, (m.used / limit) * 100) : 0;
                return (
                  <Box key={label} sx={{ mb: 2 }}>
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="body2" fontWeight={600}>
                        {label}
                      </Typography>
                      <Typography variant="body2" color={m.overLimit ? 'error' : 'text.secondary'}>
                        {m.used} / {limit ?? '∞'}
                        {m.overLimit ? ' (over limit)' : ''}
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
                Plan: {usage.subscription?.plan_name || '—'} ({usage.subscription?.status || '—'})
              </Typography>
              {usage.subscription?.pricing_model === 'per_animal' && (
                <Typography variant="body2" color="text.secondary">
                  Per-animal rate: {usage.subscription?.per_animal_rate} · billed{' '}
                  {usage.subscription?.billed_animal_count} animals
                </Typography>
              )}
            </Box>
          ) : (
            <Typography>No usage data.</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUsageOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Impersonate token dialog */}
      <Dialog open={impOpen} onClose={() => setImpOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Impersonation Started — {impFarm?.name}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            A new tab was opened logged in as this farm. If it was blocked, copy the token below and
            open <code>/?impersonate=&lt;token&gt;</code> manually.
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
          <Button onClick={copyToken}>Copy Token</Button>
          <Button variant="contained" onClick={() => setImpOpen(false)}>
            Done
          </Button>
        </DialogActions>
      </Dialog>
      <ToastContainer position="top-right" autoClose={4000} />
    </Box>
  );
};

export default Farms;
