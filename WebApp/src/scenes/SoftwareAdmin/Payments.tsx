import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useTranslation } from 'react-i18next';

import {
  Farm,
  FarmPayment,
  getFarms,
  getPayments,
  recordPayment
} from '../../shared/services/SoftwareAdminAPI/softwareAdmin.service';

const methods = ['cash', 'bank_transfer', 'cheque', 'card', 'mobile_payment', 'other'];

const statusColor: Record<string, any> = {
  paid: 'success',
  pending: 'warning',
  failed: 'error',
  refunded: 'default'
};

const Payments: React.FC = () => {
  const { t } = useTranslation();
  const [payments, setPayments] = useState<FarmPayment[]>([]);
  const [farms, setFarms] = useState<Farm[]>([]);
  const [loading, setLoading] = useState(true);

  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    farmId: '',
    amount: '',
    currency: 'USD',
    method: 'cash',
    payment_date: new Date().toISOString().split('T')[0],
    reference: '',
    notes: ''
  });

  const load = async () => {
    setLoading(true);
    try {
      const [payRes, farmRes] = await Promise.all([getPayments(1, 100), getFarms(1, 100)]);
      setPayments(payRes.payments);
      setFarms(farmRes.farms);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || t('softwareAdmin.payments.loadFailed'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleRecord = async () => {
    if (!form.farmId) {
      toast.error(t('softwareAdmin.payments.selectFarm'));
      return;
    }
    if (form.amount === '' || isNaN(Number(form.amount)) || Number(form.amount) <= 0) {
      toast.error(t('softwareAdmin.payments.enterValidAmount'));
      return;
    }
    setSaving(true);
    try {
      await recordPayment({
        farmId: form.farmId,
        amount: Number(form.amount),
        currency: form.currency,
        method: form.method,
        payment_date: form.payment_date,
        reference: form.reference,
        notes: form.notes
      });
      toast.success(t('softwareAdmin.payments.toast.recorded'));
      setOpen(false);
      setForm({
        farmId: '',
        amount: '',
        currency: 'USD',
        method: 'cash',
        payment_date: new Date().toISOString().split('T')[0],
        reference: '',
        notes: ''
      });
      load();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || t('softwareAdmin.payments.failedRecord'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight={700}>
          {t('softwareAdmin.payments.title')}
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpen(true)}>
          {t('softwareAdmin.payments.recordPayment')}
        </Button>
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
                <TableCell>{t('softwareAdmin.payments.columns.invoice')}</TableCell>
                <TableCell>{t('softwareAdmin.payments.columns.farm')}</TableCell>
                <TableCell>{t('softwareAdmin.payments.columns.amount')}</TableCell>
                <TableCell>{t('softwareAdmin.payments.columns.method')}</TableCell>
                <TableCell>{t('softwareAdmin.payments.columns.date')}</TableCell>
                <TableCell>{t('softwareAdmin.payments.columns.status')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {payments.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6}>{t('softwareAdmin.payments.noPayments')}</TableCell>
                </TableRow>
              )}
              {payments.map(p => (
                <TableRow key={p.uuid}>
                  <TableCell>{p.invoice_number}</TableCell>
                  <TableCell>{p.farm?.name || p.farmId}</TableCell>
                  <TableCell>
                    {p.amount} {p.currency}
                  </TableCell>
                  <TableCell>{t('softwareAdmin.payments.methods.' + p.method, p.method)}</TableCell>
                  <TableCell>{p.payment_date}</TableCell>
                  <TableCell>
                    <Chip size="small" label={t('softwareAdmin.payments.status.' + p.status, p.status)} color={statusColor[p.status]} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      )}

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{t('softwareAdmin.payments.recordPayment')}</DialogTitle>
        <DialogContent>
          <TextField
            select
            fullWidth
            margin="normal"
            label={t('softwareAdmin.payments.columns.farm')}
            value={form.farmId}
            onChange={e => setForm({ ...form, farmId: e.target.value })}
          >
            {farms.map(f => (
              <MenuItem key={f.uuid} value={f.uuid}>
                {f.name}
              </MenuItem>
            ))}
          </TextField>
          <Box display="flex" gap={2}>
            <TextField
              fullWidth
              margin="normal"
              label={t('softwareAdmin.payments.columns.amount')}
              type="number"
              value={form.amount}
              onChange={e => setForm({ ...form, amount: e.target.value })}
            />
            <TextField
              fullWidth
              margin="normal"
              label={t('softwareAdmin.payments.currency')}
              value={form.currency}
              onChange={e => setForm({ ...form, currency: e.target.value })}
            />
          </Box>
          <Box display="flex" gap={2}>
            <TextField
              select
              fullWidth
              margin="normal"
              label={t('softwareAdmin.payments.columns.method')}
              value={form.method}
              onChange={e => setForm({ ...form, method: e.target.value })}
            >
              {methods.map(m => (
                <MenuItem key={m} value={m}>
                  {t('softwareAdmin.payments.methods.' + m, m)}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              fullWidth
              margin="normal"
              label={t('softwareAdmin.payments.paymentDate')}
              type="date"
              value={form.payment_date}
              onChange={e => setForm({ ...form, payment_date: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
          </Box>
          <TextField
            fullWidth
            margin="normal"
            label={t('softwareAdmin.payments.reference')}
            value={form.reference}
            onChange={e => setForm({ ...form, reference: e.target.value })}
          />
          <TextField
            fullWidth
            margin="normal"
            label={t('softwareAdmin.payments.notes')}
            multiline
            rows={2}
            value={form.notes}
            onChange={e => setForm({ ...form, notes: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>{t('common.cancel')}</Button>
          <Button variant="contained" onClick={handleRecord} disabled={saving}>
            {saving ? t('softwareAdmin.payments.saving') : t('softwareAdmin.payments.record')}
          </Button>
        </DialogActions>
      </Dialog>
      <ToastContainer position="top-right" autoClose={4000} />
    </Box>
  );
};

export default Payments;
