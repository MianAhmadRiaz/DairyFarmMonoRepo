// CompanyMilkPayments.tsx
import React, { useMemo, useState } from 'react';
import {
  Box,
  Grid,
  Typography,
  TextField,
  MenuItem,
  Button,
  useTheme,
  Divider,
  Stack,
  Paper,
  IconButton,
  Tooltip,
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { useTranslation } from 'react-i18next';
import { tokens } from '../../shared/theme/theme';
import PageContainer from '../../shared/components/Layout/PageContainer';

// ------- Faux source options (replace with API) -------
const COMPANY_OPTIONS = ['Nestle (0A3400)', 'Haleeb Foods', 'Engro Foods', 'Nurpur'];
const PRODUCT_OPTIONS = ['Milk', 'Skim Milk', 'Cream']; // if needed later
const INCENTIVE_OPTIONS = [
  'Milk Incentive - CHILLING',
  'Milk Incentive - QUALITY',
  'Logistics Rebate',
  'Special Discount',
];
const INCOME_ACCOUNTS = ['Milk Sales', 'Other Operating Income'];
const CASH_BANK_ACCOUNTS = ['Cash in Hand', 'Meezan Bank', 'HBL Current', 'UBL'];

// ------- Types -------
type Num = number | '';
interface IncentiveRow {
  id: string;
  incentive: string;
  amount: Num;
  week: Num;
}
interface FormState {
  paymentDate: string; // yyyy-mm-dd
  company: string;
  startDate: string; // yyyy-mm-dd
  endDate: string; // yyyy-mm-dd
  weekNo: Num;

  volume: Num;
  adjustedVolume: Num;
  rate: Num;

  incomeAccount: string;
  cashBankAccount: string;

  incentives: IncentiveRow[];
}

// ------- Helpers -------
const isEmpty = (v: any) => v === '' || v === undefined || v === null;
const toNum = (v: Num) => (isEmpty(v) ? 0 : Number(v));

export default function MilkingPayments() {
  const { t } = useTranslation();
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const pageBg = theme.palette.mode === 'dark' ? colors.primary[500] : '#F5FAF7';

  const [form, setForm] = useState<FormState>({
    paymentDate: '',
    company: '',
    startDate: '',
    endDate: '',
    weekNo: '',

    volume: '',
    adjustedVolume: '',
    rate: '',

    incomeAccount: '',
    cashBankAccount: '',

    incentives: [
      // start empty; add via button
    ],
  });

  // ---- Derived totals (like the screenshot fields) ----
  const billTotal = useMemo(() => {
    // Prefer Adjusted Volume if entered, otherwise Volume
    const qty = !isEmpty(form.adjustedVolume) ? form.adjustedVolume : form.volume;
    return +(toNum(qty) * toNum(form.rate)).toFixed(2);
  }, [form.volume, form.adjustedVolume, form.rate]);

  const totalIncentive = useMemo(
    () =>
      +form.incentives.reduce((sum, r) => sum + toNum(r.amount), 0).toFixed(2),
    [form.incentives]
  );

  const grandTotal = useMemo(
    () => +(billTotal + totalIncentive).toFixed(2),
    [billTotal, totalIncentive]
  );

  // ---- Validation (required like your previous screen) ----
  const errors: Partial<Record<keyof FormState, string>> = {};
  if (!form.company) errors.company = t('accounts.common.required');
  if (!form.paymentDate) errors.paymentDate = t('accounts.common.required');
  if (!form.startDate) errors.startDate = t('accounts.common.required');
  if (!form.endDate) errors.endDate = t('accounts.common.required');

  // ---- Handlers ----
  const onChange = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((p) => ({ ...p, [key]: value }));

  const addIncentive = () =>
    setForm((p) => ({
      ...p,
      incentives: [
        ...p.incentives,
        { id: `${Date.now()}-${p.incentives.length + 1}`, incentive: '', amount: '', week: '' },
      ],
    }));

  const updateIncentive = (id: string, patch: Partial<IncentiveRow>) =>
    setForm((p) => ({
      ...p,
      incentives: p.incentives.map((r) => (r.id === id ? { ...r, ...patch } : r)),
    }));

  const removeIncentive = (id: string) =>
    setForm((p) => ({ ...p, incentives: p.incentives.filter((r) => r.id !== id) }));

  const reset = () =>
    setForm({
      paymentDate: '',
      company: '',
      startDate: '',
      endDate: '',
      weekNo: '',
      volume: '',
      adjustedVolume: '',
      rate: '',
      incomeAccount: '',
      cashBankAccount: '',
      incentives: [],
    });

  const save = () => {
    if (Object.keys(errors).length) {
      alert(t('accounts.common.fillRequiredFields'));
      return;
    }
    const payload = {
      ...form,
      billTotal,
      totalIncentive,
      grandTotal,
    };
    console.log('Saving company payment...', payload);
    alert(t('accounts.milkingPayments.savedDemo'));
  };

  return (
    <PageContainer title={t('accounts.milkingPayments.title')}>
        {/* Card */}
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2, sm: 3 },
            borderRadius: 2,
            border: `1px solid ${theme.palette.divider}`,
            bgcolor: 'background.paper',
          }}
        >
          {/* Top row (3 columns, small size like your style) */}
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                size="small"
                type="date"
                label={t('accounts.milkingPayments.paymentReceivingDate')}
                value={form.paymentDate}
                error={!!errors.paymentDate}
                helperText={errors.paymentDate || ' '}
                onChange={(e) => onChange('paymentDate', e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                select
                fullWidth
                size="small"
                label={t('accounts.milkingPayments.chooseCompany')}
                value={form.company}
                error={!!errors.company}
                helperText={errors.company || ' '}
                onChange={(e) => onChange('company', e.target.value)}
              >
                {COMPANY_OPTIONS.map((c) => (
                  <MenuItem key={c} value={c}>
                    {c}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                size="small"
                type="number"
                label={t('accounts.milkingPayments.weekNo')}
                value={form.weekNo}
                onChange={(e) =>
                  onChange('weekNo', e.target.value === '' ? '' : Number(e.target.value))
                }
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                size="small"
                type="date"
                label={t('accounts.milkingPayments.startDate')}
                value={form.startDate}
                error={!!errors.startDate}
                helperText={errors.startDate || ' '}
                onChange={(e) => onChange('startDate', e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                size="small"
                type="date"
                label={t('accounts.milkingPayments.endDate')}
                value={form.endDate}
                error={!!errors.endDate}
                helperText={errors.endDate || ' '}
                onChange={(e) => onChange('endDate', e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            {/* Spacing cell for alignment */}
            <Grid item xs={12} md={4} />

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                size="small"
                type="number"
                label={t('accounts.milkingPayments.volume')}
                value={form.volume}
                onChange={(e) =>
                  onChange('volume', e.target.value === '' ? '' : Number(e.target.value))
                }
                inputProps={{ min: 0, step: 0.1 }}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                size="small"
                type="number"
                label={t('accounts.milkingPayments.adjustedVolume')}
                value={form.adjustedVolume}
                onChange={(e) =>
                  onChange('adjustedVolume', e.target.value === '' ? '' : Number(e.target.value))
                }
                inputProps={{ min: 0, step: 0.1 }}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                size="small"
                type="number"
                label={t('accounts.milkingPayments.rate')}
                value={form.rate}
                onChange={(e) => onChange('rate', e.target.value === '' ? '' : Number(e.target.value))}
                inputProps={{ min: 0, step: 0.1 }}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                size="small"
                label={t('accounts.milkingPayments.billTotal')}
                value={billTotal}
                InputProps={{ readOnly: true }}
              />
            </Grid>

            {/* right-side spacer to keep 3-column rhythm */}
            <Grid item xs={12} md={4} />
          </Grid>

          {/* --- Incentives Section --- */}
          <Divider sx={{ my: 3 }} />
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
            <Typography variant="subtitle2" fontWeight={800}>
              {t('accounts.milkingPayments.selectIncentives')}
            </Typography>
            <Button
              size="small"
              startIcon={<AddCircleOutlineIcon />}
              onClick={addIncentive}
              sx={{
                textTransform: 'none',
                borderRadius: 2,
                px: 1.5,
                backgroundColor: '#E6F4EF',
                color: '#0F7C8F',
                '&:hover': { backgroundColor: '#d7efe6' },
              }}
            >
              {t('accounts.milkingPayments.addIncentives')}
            </Button>
          </Stack>

          {form.incentives.length === 0 && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              {t('accounts.milkingPayments.noIncentives')}
            </Typography>
          )}

          {form.incentives.map((row) => (
            <Grid container spacing={2} key={row.id} sx={{ mb: 1 }}>
              <Grid item xs={12} md={6}>
                <TextField
                  select
                  fullWidth
                  size="small"
                  label={t('accounts.milkingPayments.incentive')}
                  value={row.incentive}
                  onChange={(e) => updateIncentive(row.id, { incentive: e.target.value })}
                >
                  {INCENTIVE_OPTIONS.map((opt) => (
                    <MenuItem key={opt} value={opt}>
                      {opt}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  label={t('accounts.milkingPayments.amount')}
                  value={row.amount}
                  onChange={(e) =>
                    updateIncentive(row.id, {
                      amount: e.target.value === '' ? '' : Number(e.target.value),
                    })
                  }
                  inputProps={{ min: 0, step: 0.1 }}
                />
              </Grid>
              <Grid item xs={10} md={2.5}>
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  label={t('accounts.milkingPayments.week')}
                  value={row.week}
                  onChange={(e) =>
                    updateIncentive(row.id, {
                      week: e.target.value === '' ? '' : Number(e.target.value),
                    })
                  }
                  inputProps={{ min: 1 }}
                />
              </Grid>
              <Grid item xs={2} md={0.5} sx={{ display: 'flex', alignItems: 'center' }}>
                <Tooltip title={t('accounts.milkingPayments.remove')}>
                  <IconButton onClick={() => removeIncentive(row.id)} size="small">
                    <DeleteOutlineIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Grid>
            </Grid>
          ))}

          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                size="small"
                label={t('accounts.milkingPayments.totalIncentive')}
                value={totalIncentive}
                InputProps={{ readOnly: true }}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                select
                fullWidth
                size="small"
                label={t('accounts.milkingPayments.incomeAccount')}
                value={form.incomeAccount}
                onChange={(e) => onChange('incomeAccount', e.target.value)}
              >
                {INCOME_ACCOUNTS.map((a) => (
                  <MenuItem key={a} value={a}>
                    {a}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                select
                fullWidth
                size="small"
                label={t('accounts.milkingPayments.cashBankAccount')}
                value={form.cashBankAccount}
                onChange={(e) => onChange('cashBankAccount', e.target.value)}
              >
                {CASH_BANK_ACCOUNTS.map((a) => (
                  <MenuItem key={a} value={a}>
                    {a}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                size="small"
                label={t('accounts.milkingPayments.grandTotal')}
                value={grandTotal}
                InputProps={{ readOnly: true }}
              />
            </Grid>
          </Grid>

          {/* Bottom Actions (optional duplicate of header buttons) */}
          <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
            <Button
              variant="contained"
              onClick={save}
              sx={{ backgroundColor: '#005f73', color: '#ffffff', textTransform: 'none', px: 3 }}
            >
              {t('accounts.common.saveChanges')}
            </Button>
            <Button
              variant="outlined"
              onClick={reset}
              sx={{
                color: '#6a757d',
                borderColor: '#d6d6d6',
                textTransform: 'none',
                backgroundColor: '#CECECE',
                px: 3,
              }}
            >
              {t('accounts.common.reset')}
            </Button>
          </Stack>
        </Paper>
    </PageContainer>
  );
}
