import React, { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import EditBasicInfoModal from './EditBasicInfoModal';
import EditProfessionalInfoModal from './EditProfessionalInfoModal';
import BankInfoAndSalary from './EmployeeBankInfoAndSalary';

import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Tabs,
  Tab,
  IconButton,
  CircularProgress,
  useTheme
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import Attendance from './EmployeeAttendence';
import { tokens } from '../../shared/theme/theme';
import {
  getEmployeeById,
  updateEmployee,
  GetEmployeeResponse
} from '../../shared/services/EmployeeAPI/viewemployee.service';
import { useTranslation } from 'react-i18next';

const EmployeeProfile: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const [employee, setEmployee] = useState<GetEmployeeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editProfessionalOpen, setEditProfessionalOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState(0);
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const fetchEmployee = useCallback(async () => {
    if (!id) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await getEmployeeById(id);
      setEmployee(data);
    } catch (error) {
      console.error('Failed to load employee profile', error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchEmployee();
  }, [fetchEmployee]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  const handleSaveBasicInfo = async (data: {
    name: string;
    phone: string;
    city: string;
    address: string;
  }) => {
    if (!employee) return;
    await updateEmployee(employee.uuid, {
      name: data.name,
      phone: data.phone,
      city: data.city,
      address: data.address
    });
    await fetchEmployee();
  };

  const handleSaveProfessionalInfo = async (data: {
    role: string;
    joiningDate: string;
    salary: string;
    workingDays: string;
  }) => {
    if (!employee) return;
    await updateEmployee(employee.uuid, {
      designation: data.role,
      doj: data.joiningDate || employee.doj,
      salary: Number(data.salary) || employee.salary,
      leave_allow: data.workingDays || employee.leave_allow
    });
    await fetchEmployee();
  };

  if (loading) {
    return (
      <Box
        sx={{
          p: 4,
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!employee) {
    return (
      <Box sx={{ p: 4, minHeight: '100vh' }}>
        <Typography variant="h6">{t('employee.employeeProfile.notFound')}</Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        p: 4,
        backgroundColor: '#f4f9f8',
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'flex-end'
      }}
    >
      <Box sx={{ maxWidth: 1100, width: '100%' }}>
        {/* Header */}
        <Box>
          <Typography variant="h5" fontWeight="bold">
            {employee.name}
            {employee.designation && (
              <Chip
                label={employee.designation}
                color="warning"
                size="small"
                sx={{ mx: 1 }}
              />
            )}
            {employee.department && (
              <Chip label={employee.department} color="primary" size="small" />
            )}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {t('employee.employeeProfile.employeeId')}: {employee.uuid}
          </Typography>
        </Box>

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mt: 2 }}>
          <Tabs value={selectedTab} onChange={handleTabChange}>
            <Tab label={t('employee.employeeProfile.tabs.profile')} />
            <Tab label={t('employee.employeeProfile.tabs.bankInfoAndSalary')} />
            <Tab label={t('employee.common.attendance')} />
          </Tabs>
        </Box>

        {/* Tab Panel: Profile */}
        {selectedTab === 0 && (
          <>
            {/* Info Cards */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', mt: 3, gap: 2 }}>
              {/* Basic Info */}
              <Card sx={{ width: 320 }}>
                <CardContent>
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="h6">{t('employee.employeeProfile.basicInfo')}</Typography>
                    <IconButton
                      size="small"
                      onClick={() => setEditModalOpen(true)}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Box>
                  <Typography>{t('employee.addNewEmployee.fields.name')}: {employee.name}</Typography>
                  <Typography>{t('employee.addNewEmployee.fields.fatherName')}: {employee.father_name || '-'}</Typography>
                  <Typography>{t('employee.addNewEmployee.fields.phone')}: {employee.phone || '-'}</Typography>
                  <Typography>{t('employee.addNewEmployee.fields.city')}: {employee.city || '-'}</Typography>
                  <Typography>{t('employee.addNewEmployee.fields.address')}: {employee.address || '-'}</Typography>
                </CardContent>
              </Card>

              {/* Professional Details */}
              <Card sx={{ flex: 1, minWidth: 300 }}>
                <CardContent>
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="h6">{t('employee.employeeProfile.professionalDetails')}</Typography>
                    <IconButton
                      size="small"
                      onClick={() => setEditProfessionalOpen(true)}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Box>
                  <Typography>{t('employee.editProfessionalInfo.role')}: {employee.designation || '-'}</Typography>
                  <Typography>{t('employee.addNewEmployee.fields.department')}: {employee.department || '-'}</Typography>
                  <Typography>
                    {t('employee.editProfessionalInfo.joiningDate')}:{' '}
                    {employee.doj ? employee.doj.slice(0, 10) : '-'}
                  </Typography>
                  <Typography>{t('employee.editProfessionalInfo.monthlySalary')}: {employee.salary ?? '-'}</Typography>
                  <Typography>
                    {t('employee.employeeProfile.leaveAllowed')}: {employee.leave_allow ?? '-'}
                  </Typography>
                  <Typography>{t('employee.employeeProfile.status')}: {employee.status || '-'}</Typography>
                </CardContent>
              </Card>
            </Box>
          </>
        )}

        {/* Tab Panel: Bank Info and Salary */}
        {selectedTab === 1 && (
          <BankInfoAndSalary employeeId={employee.uuid} />
        )}

        {/* Tab Panel: Attendance */}
        {selectedTab === 2 && <Attendance employeeId={employee.uuid} />}
      </Box>

      {/* Modals */}
      <EditBasicInfoModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        initialValues={{
          name: employee.name,
          phone: employee.phone,
          city: employee.city,
          address: employee.address
        }}
        onSave={handleSaveBasicInfo}
      />
      <EditProfessionalInfoModal
        isOpen={editProfessionalOpen}
        onClose={() => setEditProfessionalOpen(false)}
        initialValues={{
          role: employee.designation,
          joiningDate: employee.doj,
          salary: String(employee.salary ?? ''),
          workingDays: String(employee.leave_allow ?? '')
        }}
        onSave={handleSaveProfessionalInfo}
      />
    </Box>
  );
};

export default EmployeeProfile;
