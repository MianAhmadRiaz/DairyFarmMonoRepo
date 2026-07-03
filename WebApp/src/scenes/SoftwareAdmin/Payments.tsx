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
      toast.error(err?.response?.data?.message || 'Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleRecord = async () => {
    if (!form.farmId) {
      toast.error('Select a farm');
      return;
    }
    if (form.amount === '' || isNaN(Number(form.amount)) || Number(form.amount) <= 0) {
      toast.error('Enter a valid amount');
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
      toast.success('Payment recorded');
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
      toast.error(err?.response?.data?.message || 'Failed to record payment');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight={700}>
          Payments & Invoices
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpen(true)}>
          Record Payment
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
                <TableCell>Invoice</TableCell>
                <TableCell>Farm</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Method</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {payments.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6}>No payments recorded yet.</TableCell>
                </TableRow>
              )}
              {payments.map(p => (
                <TableRow key={p.uuid}>
                  <TableCell>{p.invoice_number}</TableCell>
                  <TableCell>{p.farm?.name || p.farmId}</TableCell>
                  <TableCell>
                    {p.amount} {p.currency}
                  </TableCell>
                  <TableCell>{p.method}</TableCell>
                  <TableCell>{p.payment_date}</TableCell>
                  <TableCell>
                    <Chip size="small" label={p.status} color={statusColor[p.status]} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      )}

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Record Payment</DialogTitle>
        <DialogContent>
          <TextField
            select
            fullWidth
            margin="normal"
            label="Farm"
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
              label="Amount"
              type="number"
              value={form.amount}
              onChange={e => setForm({ ...form, amount: e.target.value })}
            />
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
              label="Method"
              value={form.method}
              onChange={e => setForm({ ...form, method: e.target.value })}
            >
              {methods.map(m => (
                <MenuItem key={m} value={m}>
                  {m}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              fullWidth
              margin="normal"
              label="Payment Date"
              type="date"
              value={form.payment_date}
              onChange={e => setForm({ ...form, payment_date: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
          </Box>
          <TextField
            fullWidth
            margin="normal"
            label="Reference"
            value={form.reference}
            onChange={e => setForm({ ...form, reference: e.target.value })}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Notes"
            multiline
            rows={2}
            value={form.notes}
            onChange={e => setForm({ ...form, notes: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleRecord} disabled={saving}>
            {saving ? 'Saving…' : 'Record'}
          </Button>
        </DialogActions>
      </Dialog>
      <ToastContainer position="top-right" autoClose={4000} />
    </Box>
  );
};

export default Payments;
