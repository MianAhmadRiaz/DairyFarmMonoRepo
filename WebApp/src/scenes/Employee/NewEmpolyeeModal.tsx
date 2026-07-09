// components/AddEmployeeModal.tsx
import React, { useState } from 'react';
import {
  Modal, Box, Typography, TextField, Button, IconButton, MenuItem, Divider
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();
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
          <Typography variant="h6" fontWeight="bold">{t('employee.newEmployeeModal.title')}</Typography>
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
          <TextField label={t('employee.addNewEmployee.placeholders.employeeName')} value={form.name} onChange={e => handleChange('name', e.target.value)} />
          <TextField label={t('employee.editProfessionalInfo.joiningDate')} type="date" InputLabelProps={{ shrink: true }} value={form.joiningDate} onChange={e => handleChange('joiningDate', e.target.value)} />
          <TextField label={t('employee.editProfessionalInfo.role')} select value={form.role} onChange={e => handleChange('role', e.target.value)}>
            <MenuItem value="Farm Manager">{t('employee.newEmployeeModal.roles.farmManager')}</MenuItem>
            <MenuItem value="Milker">{t('employee.newEmployeeModal.roles.milker')}</MenuItem>
          </TextField>
          <TextField label={t('employee.newEmployeeModal.email')} value={form.email} onChange={e => handleChange('email', e.target.value)} />
          <TextField label={t('employee.common.phoneNumber')} value={form.phone} onChange={e => handleChange('phone', e.target.value)} />
          <TextField label={t('employee.newEmployeeModal.country')} select value={form.country} onChange={e => handleChange('country', e.target.value)}>
            <MenuItem value="USA">USA</MenuItem>
            <MenuItem value="UK">UK</MenuItem>
            <MenuItem value="Canada">Canada</MenuItem>
          </TextField>
          <TextField label={t('employee.addNewEmployee.fields.city')} select value={form.city} onChange={e => handleChange('city', e.target.value)}>
            <MenuItem value="New York">New York</MenuItem>
            <MenuItem value="London">London</MenuItem>
          </TextField>
          <TextField label={t('employee.addNewEmployee.fields.address')} value={form.address} onChange={e => handleChange('address', e.target.value)} />
          <TextField label={t('employee.newEmployeeModal.monthlySalaryUsd')} value={form.salary} onChange={e => handleChange('salary', e.target.value)} />
          <TextField label={t('employee.newEmployeeModal.workingHours')} value={form.workingHours} onChange={e => handleChange('workingHours', e.target.value)} />
          <TextField label={t('employee.newEmployeeModal.unit')} select value={form.workingUnit} onChange={e => handleChange('workingUnit', e.target.value)}>
            <MenuItem value="week">{t('employee.attendanceSheet.filter.week')}</MenuItem>
            <MenuItem value="month">{t('employee.attendanceSheet.filter.month')}</MenuItem>
          </TextField>
        </Box>

        {/* Bank Details Section */}
        <Box mt={5}>
          <Typography variant="subtitle1" fontWeight="bold" mb={2}>{t('employee.common.bankDetails')}</Typography>
          <Box
            display="grid"
            gridTemplateColumns="repeat(auto-fill, minmax(240px, 1fr))"
            gap={2}
          >
            <TextField label={t('employee.common.bankName')} value={form.bankName} onChange={e => handleChange('bankName', e.target.value)} />
            <TextField label={t('employee.addNewEmployee.fields.accountNumber')} value={form.accountNumber} onChange={e => handleChange('accountNumber', e.target.value)} />
            <TextField label={t('employee.common.accountTitle')} value={form.accountTitle} onChange={e => handleChange('accountTitle', e.target.value)} />
          </Box>
        </Box>

        {/* Buttons Centered */}
        <Box display="flex" justifyContent="center" mt={5} gap={2}>
          <Button onClick={onClose} variant="outlined" sx={{ minWidth: 120 }}>{t('common.cancel')}</Button>
          <Button onClick={handleSave} variant="contained" sx={{ backgroundColor: '#005f73', minWidth: 120, '&:hover': { backgroundColor: '#007f91' } }}>
            {t('common.add')}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default AddEmployeeModal;
