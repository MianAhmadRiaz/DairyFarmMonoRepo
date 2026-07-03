import React, { useState, useMemo,useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  TextField,
  Autocomplete,
  useTheme
} from '@mui/material';
import PageContainer from '../../shared/components/Layout/PageContainer';
import { AdvanceSalaryService, AddAdvancePayload, Employee } from '../../shared/services/EmployeeAPI/advanceSalary.service';
import { tokens } from '../../shared/theme/theme';




export default function EmployeeDashboard() {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [employees, setEmployees] = useState<Employee[]>([]);
const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
const [account, setAccount] = useState('');
const [date, setDate] = useState('');
const [amount, setAmount] = useState('');
const [naration, setNaration] = useState('');

useEffect(() => {
  const fetchEmployees = async () => {
    try {
      const data = await AdvanceSalaryService.getEmployees();
      setEmployees(data); // store employees in state
    } catch (error) {
      console.error('Failed to fetch employees:', error);
    }
  };
  fetchEmployees();
}, []);

const handleFieldChange = (fieldLabel: string, value: any) => {
  if (fieldLabel === 'Employee') {
    setSelectedEmployee(value);
    // setAccount(value?.acc_no || ''); // auto-fill account
    setAccount(value?.acc_no ?? '');
  } else if (fieldLabel === 'Date') {
    setDate(value);
  } else if (fieldLabel === 'Advance Amount') {
    setAmount(value);
  } else if (fieldLabel === 'Narration') {
    setNaration(value);
  }
};

const handleSave = async () => {
  if (!selectedEmployee) {
    alert('Please select an employee');
    return;
  }

  const payload: AddAdvancePayload = {
    userId: selectedEmployee.uuid,
    date,
    account,
    amount: Number(amount),
    naration
  };

  try {
    const response = await AdvanceSalaryService.addAdvanceSalary(payload);
    console.log('Advance saved:', response);
    alert('Advance Salary saved successfully');

    // Optionally, reset form
    setSelectedEmployee(null);
    setAccount('');
    setDate('');
    setAmount('');
    setNaration('');

  } catch (error) {
    console.error('Failed to save advance:', error);
    alert('Failed to save advance');
  }
};

const fieldsArray = [
  { label: 'Date', placeholder: 'Select', type: 'date' },
  { label: 'Employee', placeholder: 'Employee', type: 'text' },
  { label: 'Account', placeholder: 'Account', type: 'text' },
  { label: 'Advance Amount', placeholder: 'Amount', type: 'number' },
  { label: 'Narration', placeholder: 'Narration', type: 'text' }
];



  return (
    <PageContainer title="Advance Salary">
      <Card
        sx={{
          mb: 3,
          boxShadow: 3,
          borderRadius: 4,
          mt: 4,
          width: {xs:'100%',md:'880px'}
        }}
      >
        <CardContent>
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 3,
              
            }}
          >
          
         
          {[...fieldsArray].map((field, index) => (
  <Box key={index} sx={{ width: { xs: '126px', md: 'calc(33.33% - 16px)' }, display: 'flex', flexDirection: 'column' }}>
    <label style={{ marginBottom: '4px', fontWeight: 'bold' }}>{field.label}</label>

    {field.label === 'Employee' ? (
      <Autocomplete
        options={employees}
        getOptionLabel={(option) => option.name}
        value={selectedEmployee}
        onChange={(_, value) => handleFieldChange('Employee', value)} // call handler
        renderInput={(params) => (
          <TextField {...params}  size="small" 
          placeholder="Select Employee" 
          />
        )}
      />
    ) : (
      <TextField
        size="small"
        type={field.type}
        placeholder={field.placeholder}
        variant="outlined"
        InputLabelProps={{ shrink: field.type === 'date' }}
        value={
          field.label === 'Date'
            ? date
            : field.label === 'Account'
            ? account
            : field.label === 'Advance Amount'
            ? amount
            : field.label === 'Narration'
            ? naration
            : ''
        }
        onChange={(e) => handleFieldChange(field.label, e.target.value)} // call handler
        // InputProps={field.label === 'Account' ? { readOnly: true } : {}}
         InputProps={{}}

        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
      />
    )}
  </Box>
))}

          </Box>

          <Box sx={{ mt: 2, ml: 1 }}>
            <Button
              variant="contained"
                onClick={handleSave}
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
              Save Advance Salary
            </Button>
          </Box>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
