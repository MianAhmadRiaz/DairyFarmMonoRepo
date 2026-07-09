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
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { tokens } from '../../shared/theme/theme';
import PageContainer from '../../shared/components/Layout/PageContainer';


// ------- Faux source options (replace with API) -------
const COMPANY_OPTIONS = [
  'Nestle (0A3400)',
  'Haleeb Foods',
  'Engro Foods',
  'Nurpur',
];

const PRODUCT_OPTIONS = ['Milk', 'Skim Milk', 'Cream'];

// i18n label keys for product options (values stay in English for the API)
const PRODUCT_LABEL_KEYS: Record<string, string> = {
  Milk: 'milk',
  'Skim Milk': 'skimMilk',
  Cream: 'cream',
};

// ------- Types -------
interface FormState {
  company: string;
  product: string;
  date: string; // yyyy-mm-dd
  currentMilk: number; // read-only fetched value
  volume: number | '';
  fat: number | '';
  lr: number | '';
  snf: number | '';
  adjustedVolume: number | '';
}

// ------- Helpers -------
const cardRadius = 16;

const isNumber = (v: unknown): v is number => typeof v === 'number' && !Number.isNaN(v);

export default function MilkDispatch() {
  const { t } = useTranslation();
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const pageBg = theme.palette.mode === 'dark' ? colors.primary[500] : '#F5FAF7';

  // Pretend fetch for Current Milk
  const fetchedCurrentMilk = 1785.0; // litres

  const [form, setForm] = useState<FormState>({
    company: '',
    product: 'Milk',
    date: '',
    currentMilk: fetchedCurrentMilk,
    volume: '',
    fat: '',
    lr: '',
    snf: '',
    adjustedVolume: '',
  });

  const errors = useMemo(() => {
    const e: Partial<Record<keyof FormState, string>> = {};
    if (!form.company) e.company = t('accounts.common.required');
    if (!form.product) e.product = t('accounts.common.required');
    if (!form.date) e.date = t('accounts.common.required');
    return e;
  }, [form.company, form.product, form.date, t]);

  const onChange = (
    key: keyof FormState,
    value: string | number | ''
  ) => setForm(prev => ({ ...prev, [key]: value }));

  const reset = () =>
    setForm({
      company: '',
      product: 'Milk',
      date: '',
      currentMilk: fetchedCurrentMilk,
      volume: '',
      fat: '',
      lr: '',
      snf: '',
      adjustedVolume: '',
    });

  const save = () => {
    if (Object.keys(errors).length) return alert(t('accounts.common.fillRequiredFields'));
    // Replace with API call
    console.log('Saving dispatch...', form);
    alert(t('accounts.milkDispatch.savedDemo'));
  };

  return (
    <PageContainer title={t('accounts.milkDispatch.title')}>
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
          {/* Fields in 3 columns, sharp corners, small size */}
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <TextField
                select
                fullWidth
                size="small"
                label={t('accounts.milkDispatch.chooseCompany')}
                value={form.company}
                error={!!errors.company}
                helperText={errors.company || ' '}
                onChange={(e) => onChange('company', e.target.value)}
              >
                {COMPANY_OPTIONS.map((c) => (
                  <MenuItem key={c} value={c}>{c}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                select
                fullWidth
                size="small"
                label={t('accounts.milkDispatch.milkProduct')}
                value={form.product}
                error={!!errors.product}
                helperText={errors.product || ' '}
                onChange={(e) => onChange('product', e.target.value)}
              >
                {PRODUCT_OPTIONS.map((p) => (
                  <MenuItem key={p} value={p}>{t(`accounts.milkDispatch.products.${PRODUCT_LABEL_KEYS[p]}`, p)}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                size="small"
                type="date"
                label={t('accounts.milkDispatch.date')}
                value={form.date}
                error={!!errors.date}
                helperText={errors.date || ' '}
                onChange={(e) => onChange('date', e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                size="small"
                label={t('accounts.milkDispatch.currentMilk')}
                value={form.currentMilk}
                InputProps={{ readOnly: true }}
                helperText={t('accounts.milkDispatch.litresAvailable')}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                size="small"
                label={t('accounts.milkDispatch.volume')}
                type="number"
                value={form.volume}
                onChange={(e) => onChange('volume', e.target.value === '' ? '' : Number(e.target.value))}
                inputProps={{ min: 0, step: 0.1 }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                size="small"
                label={t('accounts.milkDispatch.fat')}
                type="number"
                value={form.fat}
                onChange={(e) => onChange('fat', e.target.value === '' ? '' : Number(e.target.value))}
                inputProps={{ min: 0, step: 0.1 }}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                size="small"
                label={t('accounts.milkDispatch.lr')}
                type="number"
                value={form.lr}
                onChange={(e) => onChange('lr', e.target.value === '' ? '' : Number(e.target.value))}
                inputProps={{ min: 0, step: 0.1 }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                size="small"
                label={t('accounts.milkDispatch.snf')}
                type="number"
                value={form.snf}
                onChange={(e) => onChange('snf', e.target.value === '' ? '' : Number(e.target.value))}
                inputProps={{ min: 0, step: 0.1 }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                size="small"
                label={t('accounts.milkDispatch.adjustedVolume')}
                type="number"
                value={form.adjustedVolume}
                onChange={(e) => onChange('adjustedVolume', e.target.value === '' ? '' : Number(e.target.value))}
                inputProps={{ min: 0, step: 0.1 }}
              />
            </Grid>
          </Grid>

          {/* Section divider + mini caption (Figma vibe) */}
          <Divider sx={{ my: 3 }} />
         

          {/* Actions */}
          <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
            <Button
              variant="contained"
              color="success"
              onClick={save}
                 sx={{ backgroundColor: "#005f73", color: "#ffffff", marginTop: "20px",padding:"5px 20px" }}

            >
              {t('accounts.common.saveChanges')}
            </Button>
            <Button
              variant="outlined"
              onClick={reset}
sx={{
    marginTop: "20px",
    padding: "6px 25px",
    marginLeft: "15px",
    color: '#6a757d',
    borderColor: '#d6d6d6',
    textTransform: 'none',
    backgroundColor: '#CECECE'
  }}            >
              {t('accounts.common.reset')}
            </Button>
          </Stack>
        </Paper>
    </PageContainer>
  );
}
