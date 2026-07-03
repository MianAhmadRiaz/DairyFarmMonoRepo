import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Checkbox,
  Divider,
  FormControl,
  FormControlLabel,
  FormLabel,
  IconButton,
  MenuItem,
  Paper,
  Radio,
  RadioGroup,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import {
  SubscriptionPlan,
  createPlan,
  deletePlan,
  getPlans,
  updatePlan
} from '../../shared/services/SoftwareAdminAPI/softwareAdmin.service';

const cycles = ['monthly', 'quarterly', 'half_yearly', 'yearly'];

const MODULE_KEYS = ['herd', 'milking', 'feeding', 'stock', 'employee', 'finance', 'breeding', 'reports'];

const emptyForm = {
  name: '',
  description: '',
  price: '',
  currency: 'USD',
  billing_cycle: 'monthly',
  max_animals: '',
  max_employees: '',
  features: [] as string[],
  trial_days: '0',
  is_active: true,
  pricing_model: 'flat',
  per_animal_rate: '',
  is_trial_plan: false
};

const Plans: React.FC = () => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<SubscriptionPlan | null>(null);
  const [form, setForm] = useState<any>(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      setPlans(await getPlans());
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to load plans');
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  };

  const openEdit = (plan: SubscriptionPlan) => {
    setEditing(plan);
    setForm({
      name: plan.name,
      description: plan.description || '',
      price: String(plan.price),
      currency: plan.currency,
      billing_cycle: plan.billing_cycle,
      max_animals: plan.max_animals ?? '',
      max_employees: plan.max_employees ?? '',
      features: plan.features || [],
      trial_days: String(plan.trial_days ?? 0),
      is_active: plan.is_active,
      pricing_model: plan.pricing_model || 'flat',
      per_animal_rate: plan.per_animal_rate != null ? String(plan.per_animal_rate) : '',
      is_trial_plan: !!plan.is_trial_plan
    });
    setOpen(true);
  };

  const toggleFeature = (key: string) => {
    setForm((prev: any) => {
      const has = prev.features.includes(key);
      return {
        ...prev,
        features: has ? prev.features.filter((f: string) => f !== key) : [...prev.features, key]
      };
    });
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error('Plan name is required');
      return;
    }
    const isPerAnimal = form.pricing_model === 'per_animal';
    if (isPerAnimal) {
      if (form.per_animal_rate === '' || isNaN(Number(form.per_animal_rate))) {
        toast.error('A valid per-animal rate is required');
        return;
      }
    } else if (form.price === '' || isNaN(Number(form.price))) {
      toast.error('A valid price is required');
      return;
    }
    setSaving(true);
    const payload: any = {
      name: form.name.trim(),
      description: form.description,
      // For per-animal plans the flat price is zeroed; billing derives from the rate.
      price: isPerAnimal ? 0 : Number(form.price),
      currency: form.currency,
      billing_cycle: form.billing_cycle,
      max_animals: form.max_animals === '' ? null : Number(form.max_animals),
      max_employees: form.max_employees === '' ? null : Number(form.max_employees),
      features: form.features,
      trial_days: Number(form.trial_days) || 0,
      is_active: form.is_active,
      pricing_model: form.pricing_model,
      per_animal_rate: isPerAnimal ? Number(form.per_animal_rate) : 0,
      is_trial_plan: form.is_trial_plan
    };
    try {
      if (editing) {
        await updatePlan(editing.uuid, payload);
        toast.success('Plan updated');
      } else {
        await createPlan(payload);
        toast.success('Plan created');
      }
      setOpen(false);
      load();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to save plan');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (plan: SubscriptionPlan) => {
    if (!window.confirm(`Delete plan "${plan.name}"?`)) return;
    try {
      await deletePlan(plan.uuid);
      toast.success('Plan deleted');
      load();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to delete plan');
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight={700}>
          Subscription Plans
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
          New Plan
        </Button>
      </Box>

      <Paper sx={{ borderRadius: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Pricing</TableCell>
              <TableCell>Cycle</TableCell>
              <TableCell>Limits</TableCell>
              <TableCell>Trial</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {plans.length === 0 && (
              <TableRow>
                <TableCell colSpan={7}>No plans yet. Create your first plan.</TableCell>
              </TableRow>
            )}
            {plans.map(plan => (
              <TableRow key={plan.uuid}>
                <TableCell>
                  <Typography fontWeight={600}>{plan.name}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {plan.description}
                  </Typography>
                  {plan.is_trial_plan && (
                    <Chip size="small" label="Trial Plan" color="info" sx={{ ml: 0.5 }} />
                  )}
                </TableCell>
                <TableCell>
                  {plan.pricing_model === 'per_animal' ? (
                    <>
                      <Chip size="small" label="Per-Animal" color="secondary" sx={{ mb: 0.5 }} />
                      <Typography variant="body2">
                        {plan.per_animal_rate} {plan.currency}/animal
                      </Typography>
                    </>
                  ) : (
                    <>
                      <Chip size="small" label="Flat" sx={{ mb: 0.5 }} />
                      <Typography variant="body2">
                        {plan.price} {plan.currency}
                      </Typography>
                    </>
                  )}
                </TableCell>
                <TableCell>{plan.billing_cycle}</TableCell>
                <TableCell>
                  {plan.max_animals ?? '∞'} animals / {plan.max_employees ?? '∞'} staff
                </TableCell>
                <TableCell>{plan.trial_days} d</TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    label={plan.is_active ? 'Active' : 'Inactive'}
                    color={plan.is_active ? 'success' : 'default'}
                  />
                </TableCell>
                <TableCell align="right">
                  <IconButton size="small" color="primary" onClick={() => openEdit(plan)}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" color="error" onClick={() => handleDelete(plan)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{editing ? 'Edit Plan' : 'New Plan'}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            margin="normal"
            label="Name"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Description"
            value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
          />
          <FormControl sx={{ mt: 2 }}>
            <FormLabel>Pricing Model</FormLabel>
            <RadioGroup
              row
              value={form.pricing_model}
              onChange={e => setForm({ ...form, pricing_model: e.target.value })}
            >
              <FormControlLabel value="flat" control={<Radio />} label="Flat" />
              <FormControlLabel value="per_animal" control={<Radio />} label="Per-Animal" />
            </RadioGroup>
          </FormControl>
          <Box display="flex" gap={2}>
            {form.pricing_model === 'per_animal' ? (
              <TextField
                fullWidth
                margin="normal"
                label="Per-Animal Rate"
                type="number"
                value={form.per_animal_rate}
                onChange={e => setForm({ ...form, per_animal_rate: e.target.value })}
              />
            ) : (
              <TextField
                fullWidth
                margin="normal"
                label="Price"
                type="number"
                value={form.price}
                onChange={e => setForm({ ...form, price: e.target.value })}
              />
            )}
            <TextField
              fullWidth
              margin="normal"
              label="Currency"
              value={form.currency}
              onChange={e => setForm({ ...form, currency: e.target.value })}
            />
          </Box>
          <Box display="flex" gap={2}>
            <TextField
              select
              fullWidth
              margin="normal"
              label="Billing Cycle"
              value={form.billing_cycle}
              onChange={e => setForm({ ...form, billing_cycle: e.target.value })}
            >
              {cycles.map(c => (
                <MenuItem key={c} value={c}>
                  {c}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              fullWidth
              margin="normal"
              label="Trial Days"
              type="number"
              value={form.trial_days}
              onChange={e => setForm({ ...form, trial_days: e.target.value })}
            />
          </Box>
          <Box display="flex" gap={2}>
            <TextField
              fullWidth
              margin="normal"
              label="Max Animals (blank = unlimited)"
              type="number"
              value={form.max_animals}
              onChange={e => setForm({ ...form, max_animals: e.target.value })}
            />
            <TextField
              fullWidth
              margin="normal"
              label="Max Employees (blank = unlimited)"
              type="number"
              value={form.max_employees}
              onChange={e => setForm({ ...form, max_employees: e.target.value })}
            />
          </Box>
          <Divider sx={{ my: 2 }} />
          <FormLabel>Features / Modules</FormLabel>
          <Box display="flex" flexWrap="wrap">
            {MODULE_KEYS.map(key => (
              <FormControlLabel
                key={key}
                sx={{ width: '48%', textTransform: 'capitalize' }}
                control={
                  <Checkbox
                    checked={form.features.includes(key)}
                    onChange={() => toggleFeature(key)}
                  />
                }
                label={key}
              />
            ))}
          </Box>
          <Divider sx={{ my: 2 }} />
          <FormControlLabel
            control={
              <Checkbox
                checked={form.is_trial_plan}
                onChange={e => setForm({ ...form, is_trial_plan: e.target.checked })}
              />
            }
            label="Trial Plan"
          />
          <FormControlLabel
            control={
              <Switch
                checked={form.is_active}
                onChange={e => setForm({ ...form, is_active: e.target.checked })}
              />
            }
            label="Active"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
      <ToastContainer position="top-right" autoClose={4000} />
    </Box>
  );
};

export default Plans;
