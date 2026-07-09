import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Modal,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Grid
} from '@mui/material';
import { useTranslation } from 'react-i18next';

interface EditProfessionalInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialValues?: {
    role?: string;
    joiningDate?: string;
    salary?: string;
    workingDays?: string;
  };
  onSave: (data: {
    role: string;
    joiningDate: string;
    salary: string;
    workingDays: string;
    workingPeriod: 'Week' | 'Month'; // Corrected type
  }) => void;
}

const EditProfessionalInfoModal: React.FC<EditProfessionalInfoModalProps> = ({
  isOpen,
  onClose,
  initialValues,
  onSave
}) => {
  const { t } = useTranslation();
  const [role, setRole] = useState('');
  const [joiningDate, setJoiningDate] = useState('');
  const [salary, setSalary] = useState('');
  const [workingDays, setWorkingDays] = useState('');
  const [workingPeriod, setWorkingPeriod] = useState<'Week' | 'Month'>('Week'); // Corrected type

  useEffect(() => {
    if (isOpen) {
      setRole(initialValues?.role || '');
      setJoiningDate((initialValues?.joiningDate || '').slice(0, 10));
      setSalary(initialValues?.salary || '');
      setWorkingDays(initialValues?.workingDays || '');
    }
  }, [isOpen, initialValues]);

  const handleSave = () => {
    onSave({
      role,
      joiningDate,
      salary,
      workingDays,
      workingPeriod
    });
    onClose();
  };

  return (
    <Modal open={isOpen} onClose={onClose}>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: { xs: '90%', sm: 400 },
          bgcolor: 'background.paper',
          borderRadius: 2,
          boxShadow: 24,
          p: 4
        }}
      >
        <Typography variant="h6" fontWeight="bold" mb={3}>
          {t('employee.editProfessionalInfo.title')}
        </Typography>

        {/* Role Dropdown */}
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>{t('employee.editProfessionalInfo.role')}</InputLabel>
          <Select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            label={t('employee.editProfessionalInfo.role')}
          >
            {role &&
              !['Manager', 'Developer', 'Designer', 'Admin'].includes(role) && (
                <MenuItem value={role}>{role}</MenuItem>
              )}
            <MenuItem value="Manager">{t('employee.editProfessionalInfo.roles.manager')}</MenuItem>
            <MenuItem value="Developer">{t('employee.editProfessionalInfo.roles.developer')}</MenuItem>
            <MenuItem value="Designer">{t('employee.editProfessionalInfo.roles.designer')}</MenuItem>
            <MenuItem value="Admin">{t('employee.editProfessionalInfo.roles.admin')}</MenuItem>
            {/* Add more roles as needed */}
          </Select>
        </FormControl>

        {/* Joining Date */}
        <TextField
          fullWidth
          type="date"
          label={t('employee.editProfessionalInfo.joiningDate')}
          InputLabelProps={{ shrink: true }}
          variant="outlined"
          value={joiningDate}
          onChange={(e) => setJoiningDate(e.target.value)}
          sx={{ mb: 2 }}
        />

        {/* Monthly Salary */}
        <TextField
          fullWidth
          label={t('employee.editProfessionalInfo.monthlySalary')}
          variant="outlined"
          value={salary}
          onChange={(e) => setSalary(e.target.value)}
          sx={{ mb: 2 }}
        />

        {/* Working Days and Period (Week/Month) */}
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={8}>
            <TextField
              fullWidth
              label={t('employee.editProfessionalInfo.workingDays')}
              variant="outlined"
              value={workingDays}
              onChange={(e) => setWorkingDays(e.target.value)}
            />
          </Grid>
          <Grid item xs={4}>
            <FormControl fullWidth>
              <InputLabel>{t('employee.editProfessionalInfo.period')}</InputLabel>
              <Select
                value={workingPeriod}
                onChange={(e) => setWorkingPeriod(e.target.value as 'Week' | 'Month')} // Corrected type casting
                label={t('employee.editProfessionalInfo.period')}
              >
                <MenuItem value="Week">{t('employee.attendanceSheet.filter.week')}</MenuItem>
                <MenuItem value="Month">{t('employee.attendanceSheet.filter.month')}</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        <Box display="flex" justifyContent="center" gap={2} mt={3}>
          <Button variant="outlined" sx={{padding:'5px 25px',borderRadius:'8px'}} onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button variant="contained"  sx={{
              backgroundColor: '#005f73',
              color: '#fff',
              borderRadius: '8px',
              textTransform: 'none',
              padding:'5px 40px',
              fontWeight: 'bold',
              '&:hover': {
                backgroundColor: '#007f91'
              }
            }} onClick={handleSave}>
            {t('common.save')}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default EditProfessionalInfoModal;
