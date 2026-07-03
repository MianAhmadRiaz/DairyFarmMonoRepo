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

const EmployeeProfile: React.FC = () => {
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
        <Typography variant="h6">Employee not found.</Typography>
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
            Employee Id: {employee.uuid}
          </Typography>
        </Box>

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mt: 2 }}>
          <Tabs value={selectedTab} onChange={handleTabChange}>
            <Tab label="Profile" />
            <Tab label="Bank Info and Salary" />
            <Tab label="Attendance" />
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
                    <Typography variant="h6">Basic Info</Typography>
                    <IconButton
                      size="small"
                      onClick={() => setEditModalOpen(true)}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Box>
                  <Typography>Name: {employee.name}</Typography>
                  <Typography>Father Name: {employee.father_name || '-'}</Typography>
                  <Typography>Phone: {employee.phone || '-'}</Typography>
                  <Typography>City: {employee.city || '-'}</Typography>
                  <Typography>Address: {employee.address || '-'}</Typography>
                </CardContent>
              </Card>

              {/* Professional Details */}
              <Card sx={{ flex: 1, minWidth: 300 }}>
                <CardContent>
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="h6">Professional Details</Typography>
                    <IconButton
                      size="small"
                      onClick={() => setEditProfessionalOpen(true)}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Box>
                  <Typography>Role: {employee.designation || '-'}</Typography>
                  <Typography>Department: {employee.department || '-'}</Typography>
                  <Typography>
                    Joining Date:{' '}
                    {employee.doj ? employee.doj.slice(0, 10) : '-'}
                  </Typography>
                  <Typography>Monthly Salary: {employee.salary ?? '-'}</Typography>
                  <Typography>
                    Leave Allowed: {employee.leave_allow ?? '-'}
                  </Typography>
                  <Typography>Status: {employee.status || '-'}</Typography>
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
