

import React, { useState, useEffect } from 'react';
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
import { AdvanceSalaryService, Employee, UpdateAdvancePayload,AddAdvancePayload } from '../../shared/services/EmployeeAPI/advanceSalary.service';
import { tokens } from '../../shared/theme/theme';

export default function EmployeeDashboard() {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [date, setDate] = useState('');
  const [account, setAccount] = useState('');
  const [amount, setAmount] = useState('');
  const [naration, setNaration] = useState('');
  const [farmId, setFarmId] = useState('');


  const [advanceId, setAdvanceId] = useState('');


  const handleFieldChange = async (fieldLabel: string, value: any) => {
 if (fieldLabel === 'Employee') {
  setSelectedEmployee(value);
  setAccount(value?.acc_no ?? '');

  if (value) {
    try {
      const response = await AdvanceSalaryService.getAdvanceSalaries(value.uuid);
      console.log("Employee advances API response:", response);

   
      const advanceArray = response?.data?.invoices ?? [];

      if (advanceArray.length > 0) {
        
        const lastAdvance = advanceArray[advanceArray.length - 1];
        console.log("Last advance record:", lastAdvance);

        setAmount(lastAdvance.amount?.toString() ?? '');
        setNaration(lastAdvance.naration ?? '');
      } else {
        setAmount('');
        setNaration('');
      }
    } catch (error) {
      console.error('Error fetching employee advances:', error);
    }
  }
}

  else if (fieldLabel === 'Date') {
    setDate(value);
  } 
  else if (fieldLabel === 'Advance Amount') {
    setAmount(value);
  } 
  else if (fieldLabel === 'Naration') {
    setNaration(value);
  }
};
 
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const data = await AdvanceSalaryService.getEmployees();
        setEmployees(data);
      } catch (error) {
        console.error('Failed to fetch employees:', error);
        alert('Failed to load employees');
      }
    };
    fetchEmployees();
  }, []);

  useEffect(() => {
    if (!advanceId || employees.length === 0) return;

    const fetchAdvance = async () => {
      try {
        const allAdvances = await AdvanceSalaryService.getAdvanceSalaries();
        const record = allAdvances.find((r: any) => r.uuid === advanceId);

        if (record) {
          setAdvanceId(record.uuid);
          setFarmId(record.farmId);
          setDate(record.date.slice(0, 10));
          setAmount(record.amount?? '');
          setAccount(record.account);
          setNaration(record.naration ?? '');

          const emp = employees.find(e => e.uuid === record.employee_id);
          setSelectedEmployee(emp ?? null);
        }
      } catch (error) {
        console.error('Failed to load advance record:', error);
        alert('Failed to load advance');
      }
    };

    fetchAdvance();
  }, [advanceId, employees]);
const handleSave = async () => {
  if (!selectedEmployee) {
    alert('Please select an employee');
    return;
  }

  try {
    if (advanceId) {
      // Update existing advance
      const payload: UpdateAdvancePayload = {
        uuid: advanceId,
        farmId,
        employee_id: selectedEmployee.uuid,
        date,
        amount: Number(amount),
        account,
        naration
      };
      await AdvanceSalaryService.updateAdvanceSalary(payload);
      alert('Advance updated successfully');
    } else {
      // Create new advance
      const payload: AddAdvancePayload = {
        userId: selectedEmployee.uuid, 
        // farmId,
        date,
        amount: Number(amount),
        account,
        naration
      };
      await AdvanceSalaryService.addAdvanceSalary(payload);
      alert('Advance added successfully');
    }
  } catch (error) {
    console.error('Failed to save advance:', error);
    alert('Failed to save advance');
  }
};


  return (
    <PageContainer title="Edit Advance">
      <Card sx={{ mb: 3, boxShadow: 3, borderRadius: 4, mt: 4, width: { xs: '100%', md: '880px' } }}>
        <CardContent>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
            {[
              { label: 'Date', type: 'date' },
              { label: 'Employee', type: 'text' },
              { label: 'Account', type: 'text' },
              { label: 'Advance Amount', type: 'number' },
              // { label: 'Naration', type: 'text' }
            ].map((field, index) => (
              <Box key={index} sx={{ width: { xs: '126px', md: 'calc(33.33% - 16px)' }, display: 'flex', flexDirection: 'column' }}>
                <label style={{ marginBottom: '4px', fontWeight: 'bold' }}>{field.label}</label>

                {field.label === 'Employee' ? (
                  <Autocomplete
                    options={employees}
                    getOptionLabel={(option) => option.name}
                    value={selectedEmployee}
                    onChange={(_, value) => handleFieldChange('Employee', value)}
                    renderInput={(params) => <TextField {...params} size="small" placeholder="Select Employee" />}
                  />
                  
                ) : (
                  <TextField
                    size="small"
                    type={field.type}
                    value={
                      field.label === 'Date' ? date :
                      field.label === 'Account' ? account :
                      field.label === 'Advance Amount' ? amount :
                      field.label === 'Naration' ? naration : ''
                    }
                    onChange={(e) => handleFieldChange(field.label, e.target.value)}
                    InputProps={{ readOnly: field.label === 'Account' }}
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
                '&:hover': { backgroundColor: '#007f91' }
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
