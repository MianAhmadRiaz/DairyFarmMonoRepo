import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Grid
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import { useTranslation } from 'react-i18next';

const weeklyData = [
  {
    name: 'Anika Visser',
    data: [
      'Present',
      'Present',
      'Present',
      'Present',
      'Leave',
      'Present',
      'Absent'
    ]
  },
  {
    name: 'Miron Vitold',
    data: [
      'Present',
      'Present',
      'Leave',
      'Present',
      'Present',
      'Absent',
      'Present'
    ]
  },
  {
    name: 'Anika Visser',
    data: [
      'Present',
      'Present',
      'Present',
      'Present',
      'Leave',
      'Present',
      'Absent'
    ]
  },
  {
    name: 'Iulia Albu',
    data: [
      'Present',
      'Present',
      'Present',
      'Present',
      'Present',
      'Present',
      'Present'
    ]
  }
];

export default function AttendanceSheet() {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('Month');

  const summary = [
    { label: t('employee.attendanceSheet.summary.totalEmployees'), value: 26, color: 'bg-blue-100 text-blue-700' },
    { label: t('employee.attendanceSheet.summary.presents'), value: 20, color: 'bg-green-100 text-green-700' },
    { label: t('employee.attendanceSheet.summary.leaves'), value: '0/7', color: 'bg-orange-100 text-orange-700' },
    { label: t('employee.attendanceSheet.summary.onTime'), value: '0/7', color: 'bg-red-100 text-red-700' }
  ];

  const weekDays = [
    { key: 'Mon', label: t('employee.attendanceSheet.weekDays.mon') },
    { key: 'Tue', label: t('employee.attendanceSheet.weekDays.tue') },
    { key: 'Wed', label: t('employee.attendanceSheet.weekDays.wed') },
    { key: 'Thu', label: t('employee.attendanceSheet.weekDays.thu') },
    { key: 'Fri', label: t('employee.attendanceSheet.weekDays.fri') },
    { key: 'Sat', label: t('employee.attendanceSheet.weekDays.sat') },
    { key: 'Sun', label: t('employee.attendanceSheet.weekDays.sun') }
  ];

  const getStatusColor = (status: string) => {
    // Added color mapping for statuses
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

  return (
    <Box p={2}>
      <Typography variant="h6" fontWeight="bold" mb={2}>
        {t('employee.common.attendance')}
      </Typography>
      {/* Summary Cards */}
      <Grid container spacing={2} className="mb-4">
        {summary.map((item, idx) => (
          <Grid item xs={12} sm={6} md={3} key={idx}>
            <Card className="rounded-2xl shadow-sm">
              <CardContent className="flex items-center space-x-4">
                <Box
                  className={`w-10 h-10 flex items-center justify-center rounded-full ${item.color}`}
                >
                  <ArticleOutlinedIcon fontSize="small" />
                </Box>
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
        <Grid item xs={12} sm={6} md={3}>
          <Select
            value={filter}
            onChange={e => setFilter(e.target.value)}
            size="small"
            fullWidth
          >
            <MenuItem value="Week">{t('employee.attendanceSheet.filter.week')}</MenuItem>
            <MenuItem value="Month">{t('employee.attendanceSheet.filter.month')}</MenuItem>
          </Select>
        </Grid>
      </Grid>

      <Card>
        <CardContent>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
            flexWrap="wrap"
            gap={2}
          >
            <Typography variant="h6" fontWeight="bold">
              {t('employee.common.attendance')}
            </Typography>
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
          </Box>

          <TableContainer
            component={Paper}
            sx={{ maxHeight: 400, overflow: 'auto' }}
          >
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ minWidth: 160 }}>
                    <strong>{t('employee.attendanceSheet.nameColumn')}</strong>
                  </TableCell>
                  {filter === 'Week' &&
                    weekDays.map(day => (
                      <TableCell
                        key={day.key}
                        align="center"
                        sx={{ padding: '4px', minWidth: 24 }}
                      >
                        <strong>{day.label}</strong>
                      </TableCell>
                    ))}
                  {filter === 'Month' &&
                    Array.from({ length: 30 }, (_, i) => (
                      <TableCell
                        key={i}
                        align="center"
                        sx={{ padding: '4px', minWidth: 24 }}
                      >
                        <strong>{i + 1}</strong>
                      </TableCell>
                    ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {filter === 'Week' &&
                  weeklyData
                    .filter(e =>
                      e.name.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map((emp, i) => (
                      <TableRow key={i}>
                        <TableCell sx={{ minWidth: 160 }}>
                          <Box display="flex" alignItems="center" gap={1}>
                            <Box
                              sx={{
                                width: 24,
                                height: 24,
                                bgcolor: '#e0e0e0',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 'bold',
                                fontSize: '0.65rem'
                              }}
                            >
                              OP
                            </Box>
                            <Typography variant="body2">{emp.name}</Typography>
                          </Box>
                        </TableCell>
                        {emp.data.map((status, idx) => (
                          <TableCell
                            key={idx}
                            align="center"
                            sx={{
                              padding: '4px',
                              minWidth: 24,
                              color: getStatusColor(status)
                            }}
                          >
                            {t('employee.attendanceSheet.status.' + status, status)}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}

                {filter === 'Month' &&
                  weeklyData
                    .filter(e =>
                      e.name.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map((emp, i) => (
                      <TableRow key={i}>
                        <TableCell sx={{ minWidth: 160 }}>
                          <Box display="flex" alignItems="center" gap={1}>
                            <Box
                              sx={{
                                width: 24,
                                height: 24,
                                bgcolor: '#e0e0e0',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 'bold',
                                fontSize: '0.65rem'
                              }}
                            >
                              OP
                            </Box>
                            <Typography variant="body2">{emp.name}</Typography>
                          </Box>
                        </TableCell>
                        {Array.from({ length: 30 }, (_, day) => {
                          const status = ['P', 'A', 'L'][
                            Math.floor(Math.random() * 3)
                          ];
                          return (
                            <TableCell
                              key={day}
                              align="center"
                              sx={{ padding: '4px', minWidth: 24 }}
                            >
                              {status}
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
}
