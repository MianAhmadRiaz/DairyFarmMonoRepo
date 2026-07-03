// components/AddEmployeeModal.tsx
import React, { useState } from 'react';
import {
  Modal, Box, Typography, TextField, Button, IconButton, MenuItem, Divider
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const style = {
  position: 'absolute' as const,
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '90%',
  maxWidth: 800,
  bgcolor: 'background.paper',
  borderRadius: 2,
  boxShadow: 24,
  p: 4,
  overflowY: 'auto',
  maxHeight: '90vh',
};

interface AddEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
}

const AddEmployeeModal: React.FC<AddEmployeeModalProps> = ({
  isOpen,
  onClose,
  onSave
}) => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    joiningDate: '',
    role: '',
    country: '',
    city: '',
    address: '',
    salary: '',
    workingHours: '',
    workingUnit: 'week',
    bankName: '',
    accountNumber: '',
    accountTitle: '',
  });

  const handleChange = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    onSave(form);
    onClose();
  };

  return (
    <Modal open={isOpen} onClose={onClose}>
      <Box sx={style}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h6" fontWeight="bold">Add New Employee</Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Employee Info Fields */}
        <Box
          display="grid"
          gridTemplateColumns="repeat(auto-fill, minmax(240px, 1fr))"
          gap={2}
        >
          <TextField label="Employee Name" value={form.name} onChange={e => handleChange('name', e.target.value)} />
          <TextField label="Joining Date" type="date" InputLabelProps={{ shrink: true }} value={form.joiningDate} onChange={e => handleChange('joiningDate', e.target.value)} />
          <TextField label="Role" select value={form.role} onChange={e => handleChange('role', e.target.value)}>
            <MenuItem value="Farm Manager">Farm Manager</MenuItem>
            <MenuItem value="Milker">Milker</MenuItem>
          </TextField>
          <TextField label="Email" value={form.email} onChange={e => handleChange('email', e.target.value)} />
          <TextField label="Phone Number" value={form.phone} onChange={e => handleChange('phone', e.target.value)} />
          <TextField label="Country" select value={form.country} onChange={e => handleChange('country', e.target.value)}>
            <MenuItem value="USA">USA</MenuItem>
            <MenuItem value="UK">UK</MenuItem>
            <MenuItem value="Canada">Canada</MenuItem>
          </TextField>
          <TextField label="City" select value={form.city} onChange={e => handleChange('city', e.target.value)}>
            <MenuItem value="New York">New York</MenuItem>
            <MenuItem value="London">London</MenuItem>
          </TextField>
          <TextField label="Address" value={form.address} onChange={e => handleChange('address', e.target.value)} />
          <TextField label="Monthly Salary ($)" value={form.salary} onChange={e => handleChange('salary', e.target.value)} />
          <TextField label="Working Hours" value={form.workingHours} onChange={e => handleChange('workingHours', e.target.value)} />
          <TextField label="Unit" select value={form.workingUnit} onChange={e => handleChange('workingUnit', e.target.value)}>
            <MenuItem value="week">Week</MenuItem>
            <MenuItem value="month">Month</MenuItem>
          </TextField>
        </Box>

        {/* Bank Details Section */}
        <Box mt={5}>
          <Typography variant="subtitle1" fontWeight="bold" mb={2}>Bank Details</Typography>
          <Box
            display="grid"
            gridTemplateColumns="repeat(auto-fill, minmax(240px, 1fr))"
            gap={2}
          >
            <TextField label="Bank Name" value={form.bankName} onChange={e => handleChange('bankName', e.target.value)} />
            <TextField label="Account Number" value={form.accountNumber} onChange={e => handleChange('accountNumber', e.target.value)} />
            <TextField label="Account Title" value={form.accountTitle} onChange={e => handleChange('accountTitle', e.target.value)} />
          </Box>
        </Box>

        {/* Buttons Centered */}
        <Box display="flex" justifyContent="center" mt={5} gap={2}>
          <Button onClick={onClose} variant="outlined" sx={{ minWidth: 120 }}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" sx={{ backgroundColor: '#005f73', minWidth: 120, '&:hover': { backgroundColor: '#007f91' } }}>
            Add
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default AddEmployeeModal;
