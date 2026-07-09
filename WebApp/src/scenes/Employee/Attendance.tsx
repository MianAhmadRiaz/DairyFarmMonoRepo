import React, { useState, useMemo,useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  TextField,
  Pagination,
  IconButton,
  Chip,
  useTheme
} from '@mui/material';
import { Radio, RadioGroup, FormControlLabel } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PageContainer from '../../shared/components/Layout/PageContainer';
import { getAllEmployees, addAttendance, Employee, AttendancePayload } from '../../shared/services/EmployeeAPI/attendance.service';
import { useTranslation } from 'react-i18next';
import { tokens } from '../../shared/theme/theme';

export default function EmployeeDashboard() {

  const { t } = useTranslation();
 const [employees, setEmployees] = useState<Employee[]>([]);
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const ITEMS_PER_PAGE = 5;
  const [page, setPage] = useState(1);
  const [attendanceData, setAttendanceData] = useState<{ [userId: string]: 'present' | 'absent'|'leave' }>({});
  const [selectedDate, setSelectedDate] = useState('');


const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => setSelectedDate(e.target.value);

  


  const handlePageChange = (
    _event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    setPage(value);
  };

  const paginatedEmployees = employees.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  const handleAttendanceChange = (userId: string, status: 'present' | 'absent'|'leave') => {
  setAttendanceData(prev => ({ ...prev, [userId]: status }));
};


  useEffect(() => {
  getAllEmployees()
    .then(setEmployees)
    .catch((err) => console.error('Error fetching employees', err));
}, []);

const handleSaveAttendance = () => {
  if (!selectedDate) { alert(t('employee.common.pleaseSelectDate')); return; }

  const payload: AttendancePayload = {
    date: selectedDate,
    data: Object.keys(attendanceData).map(userId => ({
      userId,
      status: attendanceData[userId],
    })),
  };

  addAttendance(payload)
    .then(() => { alert(t('employee.common.attendanceSaved'));
      setAttendanceData({});
        setSelectedDate('');
   })
    .catch(err => { console.error(err); alert(t('employee.common.attendanceSaveFailed')); });
};


  return (
    <PageContainer title={t('employee.common.attendance')}>
      <Card
        sx={{
          mb: 3,
          boxShadow: 3,
          borderRadius: '12px',
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
              flexDirection: 'row',
              justifyContent: 'space-between',
              
            }}
          >
            <Box
              sx={{
                width:  {xs:'126px',md:'calc(33.33% - 16px)'},
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <label style={{ marginBottom: '4px', fontWeight: 'bold' }}>
                {t('employee.common.date')}
              </label>
              <TextField
                size="small"
                type="date"
                placeholder={t('employee.common.select')}
                variant="outlined"
         value={selectedDate}
           onChange={handleDateChange}

                InputLabelProps={{
                  shrink: true
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2
                  }
                }}
              />
            </Box>
            <Box sx={{ mt: 3, ml: 1 }}>
              <Button
                variant="contained"
                onClick={handleSaveAttendance}
                sx={{
                  backgroundColor: '#005f73',
                  textTransform: 'none',
                  px: 7,
                  py: 0.7,
                  borderRadius: 2,
                  '&:hover': {
                    backgroundColor: '#007f91'
                  }
                }}
              >
                {t('common.save')}
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>

      <Card
        sx={{
          mb: 3,
          boxShadow: 3,
          borderRadius: '12px',
          mt: 3,
          width: '100%', 
    maxWidth: '100%',
          background: theme.palette.background.paper,
        
          
        }}
      >
        <CardContent
        sx={{
          mt:-2,
          mx:-2
        }}>
           <Box sx={{ width: '100%', overflowX: 'auto' }}>
          <Box
            component="table"
            sx={{
              width: '100%',
              // minWidth: '900px',
                minWidth: { xs: '600px', md: '100%' },
              borderCollapse: 'collapse',
              '& thead': {
                borderBottom: '1px solid #e2e8f0',
                backgroundColor: theme.palette.mode === 'dark' ? colors.primary[400] : '#F8F9FA'
              },
              '& th': {
                textAlign: 'left',
                fontWeight: 600,
                color: '#111827',
                py: 1.5,
               px: 2,
                whiteSpace: 'nowrap'
              },
              '& td': {
                py: 1.5,
                px: 2,
                verticalAlign: 'middle',
                whiteSpace: 'nowrap'
              },
              '& tbody tr': {
                borderBottom: '1px solid #e2e8f0'
              }
            }}
          >
            <thead>
              <tr>
                <th>{t('employee.common.srNo')}</th>
                <th>{t('employee.addNewEmployee.fields.name')}</th>
                <th>{t('employee.common.attendance')}</th>
              </tr>
            </thead>
            <tbody>
              {paginatedEmployees.map((emp, index) => (
                <tr key={index}>
                  <td>{(page - 1) * ITEMS_PER_PAGE + index + 1}</td>
                  <td>{emp.name}</td>
                  <td>
                    <RadioGroup
  row
  value={attendanceData[emp.uuid] || ''}
  onChange={(e) =>
    handleAttendanceChange(emp.uuid, e.target.value as 'present' | 'absent' | 'leave')
  }
  sx={{ gap: 4 }} 
>
  <FormControlLabel
    value="present"
    control={<Radio sx={{ '&.Mui-checked': { color: 'green' } }} />}
    label={t('employee.common.attendanceStatus.present')}
  />
  <FormControlLabel
    value="absent"
    control={<Radio sx={{ '&.Mui-checked': { color: 'red' } }} />}
    label={t('employee.common.attendanceStatus.absent')}
  />
  <FormControlLabel
    value="leave"
    control={<Radio sx={{ '&.Mui-checked': { color: 'orange' } }} />}
    label={t('employee.common.attendanceStatus.leave')}
  />
</RadioGroup>

                  </td>
                </tr>
              ))}
            </tbody>
            </Box>
          </Box>
        </CardContent>
 

      {/* Pagination */}
      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end',pb:2 }}>
        <Pagination
          count={Math.ceil(employees.length / ITEMS_PER_PAGE)}
          page={page}
          onChange={handlePageChange}
          color="primary"
        />
      </Box>
           </Card>
               </PageContainer>
  );
}
