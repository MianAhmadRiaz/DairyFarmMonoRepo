import React, { useEffect, useState } from 'react';
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
      setMessage({ type: 'error', text: 'Please select an employee' });
      return;
    }
    if (!amount || Number(amount) <= 0) {
      setMessage({ type: 'error', text: 'Please enter a valid amount' });
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
        text: 'Advance repayment recorded successfully'
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
          'Failed to record advance repayment'
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageContainer title="Receive Advance">
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
                Date
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
                Employee
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
                    placeholder="Select Employee"
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
                Amount
              </label>
              <TextField
                size="small"
                type="number"
                placeholder="Amount"
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
                Payment Method
              </label>
              <TextField
                size="small"
                select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              >
                <MenuItem value="cash">Cash</MenuItem>
                <MenuItem value="bank_transfer">Bank Transfer</MenuItem>
                <MenuItem value="cheque">Cheque</MenuItem>
                <MenuItem value="mobile_payment">Mobile Payment</MenuItem>
                <MenuItem value="other">Other</MenuItem>
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
                Narration
              </label>
              <TextField
                size="small"
                type="text"
                placeholder="Narration"
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
              {saving ? 'Saving...' : 'Receive Advance'}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
