// components/Attendance.tsx
import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  CircularProgress
} from '@mui/material';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import EventNoteIcon from '@mui/icons-material/EventNote';
import {
  getAttendance,
  MappedAttendance
} from '../../shared/services/EmployeeAPI/attendance.service';
import { useTranslation } from 'react-i18next';

const monthKeys = [
  'january',
  'february',
  'march',
  'april',
  'may',
  'june',
  'july',
  'august',
  'september',
  'october',
  'november',
  'december'
];

interface AttendanceProps {
  employeeId?: string;
}

const Attendance: React.FC<AttendanceProps> = ({ employeeId }) => {
  const { t } = useTranslation();
  const [records, setRecords] = useState<
    MappedAttendance['attendance']
  >([]);
  const [loading, setLoading] = useState(true);
  const year = new Date().getFullYear();

  useEffect(() => {
    let active = true;
    const load = async () => {
      if (!employeeId) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const startDate = `${year}-01-01`;
        const endDate = `${year}-12-31`;
        const data: MappedAttendance[] = await getAttendance(
          startDate,
          endDate
        );
        const emp = data.find((e) => e.userId === employeeId);
        if (active) setRecords(emp?.attendance || []);
      } catch (error) {
        console.error('Failed to load attendance', error);
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [employeeId, year]);

  const summary = useMemo(() => {
    let present = 0;
    let absent = 0;
    let leave = 0;
    records.forEach((r) => {
      if (r.status === 'present') present++;
      else if (r.status === 'absent') absent++;
      else if (r.status === 'leave') leave++;
    });
    return { present, absent, leave };
  }, [records]);

  const monthlyTotals = useMemo(() => {
    const totals = monthKeys.map(() => ({
      present: 0,
      absent: 0,
      leave: 0
    }));
    records.forEach((r) => {
      if (!r.date) return;
      const monthIndex = new Date(r.date).getMonth();
      if (monthIndex < 0 || monthIndex > 11) return;
      if (r.status === 'present') totals[monthIndex].present++;
      else if (r.status === 'absent') totals[monthIndex].absent++;
      else if (r.status === 'leave') totals[monthIndex].leave++;
    });
    return totals;
  }, [records]);

  const attendanceSummary = [
    {
      label: t('employee.employeeAttendance.totalPresents'),
      value: summary.present,
      icon: <EventAvailableIcon color="primary" fontSize="large" />
    },
    {
      label: t('employee.employeeAttendance.totalAbsents'),
      value: summary.absent,
      icon: <EventBusyIcon sx={{ color: '#f87171' }} fontSize="large" />
    },
    {
      label: t('employee.employeeAttendance.totalLeaves'),
      value: summary.leave,
      icon: <EventNoteIcon sx={{ color: '#facc15' }} fontSize="large" />
    }
  ];

  if (loading) {
    return (
      <Box mt={3} display="flex" justifyContent="center">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box mt={3}>
      {/* Summary Cards */}
      <Grid container spacing={2}>
        {attendanceSummary.map((item, idx) => (
          <Grid item xs={12} sm={4} key={idx}>
            <Card sx={{ borderRadius: '12px' }}>
              <CardContent>
                <Box display="flex" alignItems="center" gap={2}>
                  {item.icon}
                  <Box>
                    <Typography variant="body2">{item.label}</Typography>
                    <Typography fontWeight="bold">{item.value}</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Attendance Table */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography fontWeight="bold" fontSize="1.2rem" mb={3}>
            {t('employee.employeeAttendance.attendanceYear', { year })}
          </Typography>

          {/* Table Header */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: 4,
              fontWeight: 'bold',
              borderBottom: '1px solid #e0e0e0',
              pb: 2,
              bgcolor: '#f5f5f5',
              px: 3,
              fontSize: '1rem'
            }}
          >
            <Typography>{t('employee.employeeAttendance.monthColumn')}</Typography>
            <Typography>{t('employee.employeeAttendance.presentsColumn')}</Typography>
            <Typography>{t('employee.employeeAttendance.absentsColumn')}</Typography>
            <Typography>{t('employee.employeeAttendance.leavesColumn')}</Typography>
          </Box>

          {/* Table Rows */}
          {monthKeys.map((month, idx) => (
            <Box
              key={idx}
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: 4,
                py: 2,
                px: 3,
                borderBottom: '1px solid #eee',
                alignItems: 'center',
                fontSize: '0.95rem'
              }}
            >
              <Typography>{t('employee.employeeAttendance.months.' + month)}</Typography>
              <Typography>{monthlyTotals[idx].present}</Typography>
              <Typography>{monthlyTotals[idx].absent}</Typography>
              <Typography>{monthlyTotals[idx].leave}</Typography>
            </Box>
          ))}
        </CardContent>
      </Card>
    </Box>
  );
};

export default Attendance;
