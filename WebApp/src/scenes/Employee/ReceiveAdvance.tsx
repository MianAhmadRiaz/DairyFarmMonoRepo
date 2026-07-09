import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  TextField,
  Autocomplete,
  MenuItem,
  Alert,
  useTheme
} from '@mui/material';
import PageContainer from '../../shared/components/Layout/PageContainer';
import { tokens } from '../../shared/theme/theme';
import {
  AdvanceSalaryService,
  Employee
} from '../../shared/services/EmployeeAPI/advanceSalary.service';

export default function ReceiveAdvance() {
  const { t } = useTranslation();
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null
  );
  const [date, setDate] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [remarks, setRemarks] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const data = await AdvanceSalaryService.getEmployees();
        setEmployees(data);
      } catch (error) {
        console.error('Failed to fetch employees:', error);
      }
    };
    fetchEmployees();
  }, []);

  const handleSave = async () => {
    setMessage(null);
    if (!selectedEmployee) {
      setMessage({ type: 'error', text: t('employee.receiveAdvance.selectEmployeeError') });
      return;
    }
    if (!amount || Number(amount) <= 0) {
      setMessage({ type: 'error', text: t('employee.receiveAdvance.validAmountError') });
      return;
    }
    setSaving(true);
    try {
      await AdvanceSalaryService.receiveAdvanceFromEmployee({
        employeeId: selectedEmployee.uuid,
        amount: Number(amount),
        date: date || new Date().toISOString().split('T')[0],
        paymentMethod,
        remarks
      });
      setMessage({
        type: 'success',
        text: t('employee.receiveAdvance.recordedSuccess')
      });
      setSelectedEmployee(null);
      setDate('');
      setAmount('');
      setPaymentMethod('cash');
      setRemarks('');
    } catch (error: any) {
      console.error('Failed to receive advance:', error);
      setMessage({
        type: 'error',
        text:
          error?.response?.data?.message ||
          t('employee.receiveAdvance.recordFailed')
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageContainer title={t('employee.receiveAdvance.title')}>
      <Card
        sx={{
          mb: 3,
          boxShadow: 3,
          borderRadius: 4,
          mt: 4,
          width: { xs: '100%', md: '880px' }
        }}
      >
        <CardContent>
          {message && (
            <Alert severity={message.type} sx={{ mb: 2 }}>
              {message.text}
            </Alert>
          )}
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: { xs: 3, md: 3 }
            }}
          >
            <Box
              sx={{
                width: { xs: '100%', md: 'calc(33.33% - 16px)' },
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <label style={{ marginBottom: '4px', fontWeight: 'bold' }}>
                {t('employee.common.date')}
              </label>
              <TextField
                size="small"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
            </Box>

            <Box
              sx={{
                width: { xs: '100%', md: 'calc(33.33% - 16px)' },
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <label style={{ marginBottom: '4px', fontWeight: 'bold' }}>
                {t('employee.common.employee')}
              </label>
              <Autocomplete
                options={employees}
                getOptionLabel={(option) => option.name}
                value={selectedEmployee}
                onChange={(_, value) => setSelectedEmployee(value)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    size="small"
                    placeholder={t('employee.common.selectEmployee')}
                  />
                )}
              />
            </Box>

            <Box
              sx={{
                width: { xs: '100%', md: 'calc(33.33% - 16px)' },
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <label style={{ marginBottom: '4px', fontWeight: 'bold' }}>
                {t('employee.common.amount')}
              </label>
              <TextField
                size="small"
                type="number"
                placeholder={t('employee.common.amount')}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
            </Box>

            <Box
              sx={{
                width: { xs: '100%', md: 'calc(33.33% - 16px)' },
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <label style={{ marginBottom: '4px', fontWeight: 'bold' }}>
                {t('employee.receiveAdvance.paymentMethod')}
              </label>
              <TextField
                size="small"
                select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              >
                <MenuItem value="cash">{t('employee.receiveAdvance.paymentMethods.cash')}</MenuItem>
                <MenuItem value="bank_transfer">{t('employee.receiveAdvance.paymentMethods.bankTransfer')}</MenuItem>
                <MenuItem value="cheque">{t('employee.receiveAdvance.paymentMethods.cheque')}</MenuItem>
                <MenuItem value="mobile_payment">{t('employee.receiveAdvance.paymentMethods.mobilePayment')}</MenuItem>
                <MenuItem value="other">{t('employee.receiveAdvance.paymentMethods.other')}</MenuItem>
              </TextField>
            </Box>

            <Box
              sx={{
                width: { xs: '100%', md: 'calc(66.66% - 8px)' },
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <label style={{ marginBottom: '4px', fontWeight: 'bold' }}>
                {t('employee.receiveAdvance.narration')}
              </label>
              <TextField
                size="small"
                type="text"
                placeholder={t('employee.receiveAdvance.narration')}
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
            </Box>
          </Box>

          <Box sx={{ mt: 2, ml: 1 }}>
            <Button
              variant="contained"
              onClick={handleSave}
              disabled={saving}
              sx={{
                backgroundColor: '#005f73',
                textTransform: 'none',
                px: 3,
                py: 1,
                borderRadius: 2,
                '&:hover': {
                  backgroundColor: '#007f91'
                }
              }}
            >
              {saving ? t('employee.common.saving') : t('employee.receiveAdvance.receiveAdvance')}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
