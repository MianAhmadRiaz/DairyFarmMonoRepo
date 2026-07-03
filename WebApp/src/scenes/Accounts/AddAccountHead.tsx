import React, { useMemo, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  MenuItem,
  Button,
  useTheme,
  Stack,
  Divider,
} from '@mui/material';
import { tokens } from '../../shared/theme/theme';
import { createAccount } from '../../shared/services/finance.service';

const TYPE_TO_BACKEND: Record<string, 'asset' | 'liability' | 'equity' | 'revenue' | 'expense'> = {
  'Cash-In-Hand': 'asset',
  Bank: 'asset',
  Receivable: 'asset',
  Payable: 'liability',
  Expense: 'expense',
  Revenue: 'revenue',
  Equity: 'equity',
};

type AcctType =
  | 'Cash-In-Hand'
  | 'Bank'
  | 'Receivable'
  | 'Payable'
  | 'Expense'
  | 'Revenue'
  | 'Equity';

const TYPES: AcctType[] = [
  'Cash-In-Hand',
  'Bank',
  'Receivable',
  'Payable',
  'Expense',
  'Revenue',
  'Equity',
];

export default function AddAccountHead() {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const pageBg = theme.palette.mode === 'dark' ? colors.primary[500] : '#F5FAF7';

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [type, setType] = useState<AcctType>('Cash-In-Hand');
  const [openingBalance, setOpeningBalance] = useState<string>('');

  const errors = useMemo(() => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = 'Required';
    if (!type) e.type = 'Required';
    return e;
  }, [name, type]);

  const reset = () => {
    setName('');
    setCode('');
    setType('Cash-In-Hand');
    setOpeningBalance('');
  };

  const save = async () => {
    if (Object.keys(errors).length) {
      alert('Please fill required fields.');
      return;
    }
    try {
      await createAccount({
        account_code: code.trim() || undefined,
        account_name: name.trim(),
        account_type: TYPE_TO_BACKEND[type] || 'asset',
        opening_balance: openingBalance === '' ? 0 : Number(openingBalance),
      } as any);
      alert('Account created successfully!');
      reset();
    } catch (e) {
      console.error('Failed to create account', e);
      alert('Failed to create account.');
    }
  };

  return (
    <Box
      sx={{
        bgcolor: pageBg,
        minHeight: '100vh',
        py: 6,
        pl: { md: '330px', xs: 0 }, // reserve space for your sidebar without causing horizontal scroll
        overflowX: 'hidden',
      }}
    >
      <Box sx={{ maxWidth: 980, px: 2, mx: 'auto' }}>
        {/* Centered modal-like card */}
        <Paper
          elevation={0}
          sx={{
            borderRadius: 2,
            border: `1px solid ${theme.palette.divider}`,
            overflow: 'hidden',
            bgcolor: 'background.paper',
          }}
        >
          {/* header bar (brown like screenshot) */}
          <Box
            sx={{
              bgcolor: '#6b4f3b',
              color: '#fff',
              px: 2.5,
              py: 1.2,
            }}
          >
            <Typography variant="subtitle1" fontWeight={700}>
              Add Account Head
            </Typography>
          </Box>

          {/* body */}
          <Box sx={{ p: { xs: 2, sm: 3 } }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  size="small"
                  label="Account Name"
                  placeholder="Account Head Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  error={!!errors.name}
                  helperText={errors.name || ' '}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Account Code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  helperText=" "
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Choose Type"
                  value={type}
                  onChange={(e) => setType(e.target.value as AcctType)}
                  error={!!errors.type}
                  helperText={errors.type || ' '}
                >
                  {TYPES.map((t) => (
                    <MenuItem key={t} value={t}>
                      {t}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Opening Balance"
                  type="number"
                  value={openingBalance}
                  onChange={(e) => setOpeningBalance(e.target.value)}
                  inputProps={{ step: 0.01, min: 0 }}
                  helperText=" "
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 1 }} />

            {/* actions (same styling as your other screens) */}
            <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 1 }}>
              <Button
                variant="contained"
                onClick={save}
                sx={{
                  backgroundColor: '#005f73',
                  color: '#ffffff',
                  textTransform: 'none',
                  px: 3,
                }}
              >
                Save Changes
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
                Reset
              </Button>
            </Stack>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}
