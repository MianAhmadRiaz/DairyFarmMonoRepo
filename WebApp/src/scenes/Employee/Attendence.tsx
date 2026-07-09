import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  Avatar,
  TextField,
  InputAdornment,
  Grid
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import { useTranslation } from 'react-i18next';
import AttendanceSheet from './AtendenceSheet';

// Mock data with id and designation for search functionality
const attendance = Array(10).fill({
  name: 'Miron Vitold',
  id: 'EMP001',
  designation: 'Operator',
  punchIn: '9:30 AM',
  punchOut: '6:30 PM',
  production: '8 Hours',
  status: 'PRESENT'
});

const getStatusColor = (status: 'Present' | 'Absent' | 'Leave'): string => {
  switch (status) {
    case 'Absent':
      return 'red';
    case 'Leave':
      return 'orange';
    case 'Present':
      return 'black';
    default:
      return 'black';
  }
};

export default function Attendance() {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTab, setSelectedTab] = useState(0);

  const summary = [
    { label: t('employee.attendanceSheet.summary.totalEmployees'), value: 26, color: 'bg-blue-100 text-blue-700' },
    { label: t('employee.attendanceSheet.summary.presents'), value: 20, color: 'bg-green-100 text-green-700' },
    { label: t('employee.attendanceSheet.summary.leaves'), value: '0/7', color: 'bg-orange-100 text-orange-700' },
    { label: t('employee.attendanceSheet.summary.onTime'), value: '0/7', color: 'bg-red-100 text-red-700' }
  ];

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  const filteredEmployees = attendance.filter(
    emp =>
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.designation.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box
      className="p-4 bg-gray-50 min-h-screen"
      sx={{ marginLeft: { xs: 0, md: '300px' } }} // Shift whole content to right
    >
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mt: 2 }}>
        <Typography variant="h5" fontWeight="bold">
          {t('employee.common.attendance')}
        </Typography>
        <Tabs value={selectedTab} onChange={handleTabChange}>
          <Tab label={t('employee.attendance.todaysAttendance')} />
          <Tab label={t('employee.attendance.attendanceSheet')} />
        </Tabs>
      </Box>
      {selectedTab === 0 && (
        <>
          <br />
          <Box className="mb-5">
            <TextField
              fullWidth
              placeholder={t('common.search')}
              variant="outlined"
              sx={{
                width: '300px',
                fontSize: '0.8rem',
                backgroundColor: 'white'
              }}
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                )
              }}
              className="bg-white rounded-lg "
            />
          </Box>

          {/* Summary Cards */}
          <Grid container spacing={2} className="mb-4">
            {summary.map((item, idx) => (
              <Grid item xs={12} sm={6} md={3} key={idx}>
                <Card className="rounded-2xl shadow-sm">
                  <CardContent className="flex items-center space-x-4">
                    {/* Circular Icon with color */}
                    
                    <Box
                      className={`w-10 h-10 flex items-center justify-center rounded-full ${item.color}`}
                    >
                      <ArticleOutlinedIcon fontSize="small" />
                    </Box>

                    {/* Text Content */}
                    <Box>
                      <Typography variant="body2" className="text-gray-500">
                        {item.label}
                      </Typography>
                      <Typography variant="h6" fontWeight="bold">
                        {item.value}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Attendance Table */}
          <Card className="rounded-xl" sx={{width:'100%'}}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" mb={2}>
                {t('employee.common.attendance')}
              </Typography>

              {/* Search Bar */}
              <TextField
                fullWidth
                placeholder={t('employee.attendanceSheet.searchPlaceholder')}
                variant="outlined"
                size="small"
                className="mb-4 bg-white"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  )
                }}
              />
              <br />
              <br />
              {/* Table */}
              <Box className="overflow-x-auto">
                {/* Table Header */}
                <Box className="grid grid-cols-5 font-semibold text-gray-600 py-2 border-b border-gray-300 text-sm px-4">
                  <div className="bg-gray-100">{t('employee.attendanceSheet.nameColumn')}</div>
                  <div className="bg-gray-100">{t('employee.attendance.firstPunchIn')}</div>
                  <div className="bg-gray-100">{t('employee.attendance.lastPunchOut')}</div>
                  <div className="bg-gray-100">{t('employee.attendance.production')}</div>
                  <div className="bg-gray-100">{t('employee.attendance.statusColumn')}</div>
                </Box>

                {filteredEmployees.map((att, idx) => (
                  <Box
                    key={idx}
                    className="grid grid-cols-5 items-center py-3 px-4 text-sm border-b border-gray-100"
                  >
                    {/* Name */}
                    <Box className="flex items-center space-x-3 ">
                      <Avatar sx={{ width: 30, height: 30, fontSize: 14 }}>
                        DP
                      </Avatar>
                      <span>{att.name}</span>
                    </Box>

                    {/* First Punch In */}
                    <div>{att.punchIn}</div>

                    {/* Last Punch Out */}
                    <div>{att.punchOut}</div>

                    {/* Production */}
                    <div>{att.production}</div>

                    {/* Status */}
                    <div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          getStatusColor(att.status)
                        }`}
                      >
                        {t('employee.attendance.status.' + att.status, { defaultValue: att.status })}
                      </span>
                    </div>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </>
      )}
      {selectedTab === 1 && <AttendanceSheet />}
    </Box>
  );
}
