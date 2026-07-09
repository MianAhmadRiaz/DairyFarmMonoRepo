import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  Pagination,
  MenuItem,
  Autocomplete,
  useTheme
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import { InputAdornment } from '@mui/material';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PageContainer from '../../shared/components/Layout/PageContainer';
import { tokens } from '../../shared/theme/theme';
import { generateSalaryRecord, GenerateSalaryPayload, getSalaryRecords, SalaryRecord, deleteSalaryInvoice } from '../../shared/services/EmployeeAPI/salary.service';
import { getAllEmployees, GetEmployeeResponse } from '../../shared/services/EmployeeAPI/viewemployee.service';
import { getAttendanceSummary } from '../../shared/services/EmployeeAPI/attendance.service';


export default function ViewEmployee() {
  const { t } = useTranslation();
  const [salaryRecords, setSalaryRecords] = useState<SalaryRecord[]>([]);

  const fetchSalaryRecords = async () => {
    try {
      const data = await getSalaryRecords();
      setSalaryRecords(data);
    } catch (error) {
      console.error('Failed to load salary records', error);
    }
  };

  useEffect(() => {
    fetchSalaryRecords();
  }, []);

  const handleDeleteRecord = async (invoiceId: string) => {
    try {
      await deleteSalaryInvoice(invoiceId);
      await fetchSalaryRecords();
    } catch (error) {
      console.error('Failed to delete salary record', error);
    }
  };

  const [isModalOpen, setModalOpen] = useState(false);
  const [isEditModalOpen, setisEditModalOpen] = useState(false);
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const ITEMS_PER_PAGE = 5;
  const [page, setPage] = useState(1);

  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const paginatedSalary = salaryRecords.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  const handleCloseEditModal = () => {
    setisEditModalOpen(false);
    fetchSalaryRecords();
  };

  

  return (
    <PageContainer title={t('employee.generateSalary.title')}>
      <Box sx={{
        backgroundColor: theme.palette.background.paper,
        borderRadius: 2,
        boxShadow: theme.palette.mode === 'dark' ? '0 4px 12px rgba(0,0,0,0.3)' : '0 4px 12px rgba(0,0,0,0.05)'
      }}>
        <Box sx={{ 
          display: 'flex', 
          gap: 3, 
          flexWrap: 'wrap', 
          mt: 2, 
          p: { xs: 2, md: 3 }
        }}>
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <label style={{ marginBottom: '4px', fontWeight: 'bold' }}>
              {t('employee.generateSalary.salaryMonth')}
            </label>
            <TextField
              size="small"
              type="text"
              placeholder={t('employee.common.select')}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <CalendarTodayIcon fontSize="small" />
                  </InputAdornment>
                )
              }}
            />
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <label style={{ marginBottom: '4px', fontWeight: 'bold' }}>
              {t('employee.common.date')}
            </label>
            <TextField
              size="small"
              type="text"
              placeholder={t('employee.common.select')}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <CalendarTodayIcon fontSize="small" />
                  </InputAdornment>
                )
              }}
            />
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <label style={{ marginBottom: '4px', fontWeight: 'bold' }}>
              {t('employee.generateSalary.expenseHead')}
            </label>
            <TextField
              select
              size="small"
              defaultValue=""
              sx={{ width: '200px' }}
            >
              <MenuItem value="Salary">{t('employee.generateSalary.expenseHeads.salary')}</MenuItem>
              <MenuItem value="Bonus">{t('employee.generateSalary.expenseHeads.bonus')}</MenuItem>
              <MenuItem value="Overtime">{t('employee.generateSalary.expenseHeads.overtime')}</MenuItem>
              <MenuItem value="Misc">{t('employee.generateSalary.expenseHeads.misc')}</MenuItem>
            </TextField>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <label style={{ marginBottom: '4px', fontWeight: 'bold' }}>
              {t('employee.generateSalary.workingDays')}
            </label>
            <TextField size="small" type="number" />
          </Box>
          <Box>
            <Button
              variant="contained"
              sx={{
                px: 3,
                // py: 0.75,
               my:3,
                fontSize: '0.85rem',
                fontWeight: '500',
                textTransform: 'none',
                backgroundColor: '#005f73',
                '&:hover': { backgroundColor: '#007f91' },
                boxShadow: 1,
                borderRadius: 1,
                
              }}
              onClick={() => setisEditModalOpen(true)}
            >
              {t('employee.generateSalary.generateSalary')}
            </Button>
          </Box>
        </Box>

        <Box sx={{ overflowX: 'auto' }}>
          <Box
            component="table"
            sx={{
              width: '100%',
              minWidth: '900px',
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
                <th>{t('employee.common.employee')}</th>
                <th>{t('employee.common.salary')}</th>
                <th>{t('employee.generateSalary.columns.days')}</th>
                <th>{t('employee.common.present')}</th>
                <th>{t('employee.generateSalary.columns.absence')}</th>
                <th>{t('employee.generateSalary.columns.leaveAllow')}</th>
                <th>{t('employee.generateSalary.columns.salaryDay')}</th>
                <th>{t('employee.common.deduction')}</th>
                <th>{t('employee.generateSalary.columns.overTime')}</th>
                <th>{t('employee.common.bonus')}</th>
                <th>{t('employee.common.grossSalary')}</th>
                <th>{t('employee.common.edit')}</th>
              </tr>
            </thead>

            <tbody>
              {paginatedSalary.length === 0 ? (
                <tr>
                  <td colSpan={13} style={{ textAlign: 'center', padding: 24 }}>
                    {t('employee.generateSalary.noRecords')}
                  </td>
                </tr>
              ) : (
                paginatedSalary.map((sal, index) => (
                  <tr key={sal.invoiceId || index}>
                    <td>{(page - 1) * ITEMS_PER_PAGE + index + 1}</td>
                    <td>{sal.name}</td>
                    <td>{sal.gross_salary}</td>
                    <td>{sal.total_days}</td>
                    <td>{sal.present_days}</td>
                    <td>{sal.absence_days}</td>
                    <td>{sal.opening_advance}</td>
                    <td>{sal.salary_days}</td>
                    <td>{sal.deduction}</td>
                    <td>-</td>
                    <td>{sal.bonus}</td>
                    <td>{sal.gross_salary}</td>
                    <td>
                      <Box>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDeleteRecord(sal.invoiceId)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Box>
        </Box>

        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', pb: 2 }}>
          <Pagination
            count={Math.ceil(salaryRecords.length / ITEMS_PER_PAGE) || 1}
            page={page}
            onChange={handlePageChange}
            color="primary"
          />
        </Box>
      </Box>
      <EditEmployeeModal
        openModal={isEditModalOpen}
        onCloseUpdate={handleCloseEditModal}
        userId={undefined}
      />
    </PageContainer>
  );
}

interface EditDetails {
  openModal: boolean;
  onCloseUpdate: () => void;
  userId?: string;
}

const EditEmployeeModal: React.FC<EditDetails> = ({
  openModal,
  onCloseUpdate,
  userId,
}) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    employee: null as GetEmployeeResponse | null,
    date:"",
    month: "",
    expense_head: "",
    base_salary: "",
    total_days: "30",
    present_days: "",
    absence_days: "",
    leave_allowance: "",
    salary_days: "",
    deduction: "",
    overtime: "",
    bonus: "",
    gross_salary: ""
  });

  // Calculate salary_days and gross_salary whenever relevant fields change
  useEffect(() => {
    const baseSalary = parseFloat(formData.base_salary) || 0;
    const totalDays = parseFloat(formData.total_days) || 30;
    const presentDays = parseFloat(formData.present_days) || 0;
    const leaveAllowance = parseFloat(formData.leave_allowance) || 0;
    const bonus = parseFloat(formData.bonus) || 0;
    const overtime = parseFloat(formData.overtime) || 0;
    const deduction = parseFloat(formData.deduction) || 0;
    
    // Salary Days = Present Days + Leave Allowance (capped at total days)
    const salaryDays = Math.min(presentDays + leaveAllowance, totalDays);
    
    // Per Day Salary
    const perDaySalary = totalDays > 0 ? baseSalary / totalDays : 0;
    
    // Gross Salary = (Per Day Salary × Salary Days) + Overtime + Bonus - Deduction
    const grossSalary = (perDaySalary * salaryDays) + overtime + bonus - deduction;
    
    setFormData(prev => ({
      ...prev,
      salary_days: salaryDays.toString(),
      gross_salary: Math.round(grossSalary).toString()
    }));
  }, [
    formData.base_salary, 
    formData.total_days, 
    formData.present_days, 
    formData.leave_allowance,
    formData.bonus, 
    formData.overtime, 
    formData.deduction
  ]);

const handleChange = (field: keyof typeof formData, value: string | GetEmployeeResponse | null) => {
  // Update the form data with the new value
  setFormData(prev => ({
    ...prev,
    [field]: value
  }));

  // Auto-fill base salary and leave allowance when employee is selected
  if (field === 'employee' && value) {
    // First check if value is actually a GetEmployeeResponse
    if (typeof value === 'object' && value !== null && 'salary' in value && 'leave_allow' in value) {
      const employee = value as GetEmployeeResponse;
      setFormData(prev => ({
        ...prev,
        employee: employee,
        base_salary: employee.salary.toString(),
        leave_allowance: employee.leave_allow.toString()
      }));
    }
  }
};



  const [monthInput, setMonthInput] = useState<string>('');
    const [dateInput, setDateInput] = useState<string>('');
  const [employees, setEmployees] = useState<GetEmployeeResponse[]>([]);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await getAllEmployees();
        setEmployees(response);
      } catch (error) {
        console.error("Error fetching employees", error);
      }
    };
    fetchEmployees();
  }, []);

  const handleCancel = () => {
    onCloseUpdate();
  };

  // Example effect for autofill

  const handleSubmit = async () => {
    if (!formData.employee) {
      alert(t('employee.generateSalary.selectEmployeeAlert'));
      return;
    }

    const payload: GenerateSalaryPayload = {
       userId: formData.employee.uuid, 
      employee: {
        uuid: formData.employee.uuid,
        name: formData.employee.name,
        base_salary: Number(formData.employee.salary),
        leave_allowance: Number(formData.employee.leave_allow)
      },
      month: formData.month,
        date: formData.date,
      expense_head: formData.expense_head,
      total_days: Number(formData.total_days),
      present_days: Number(formData.present_days),
      absence_days: Number(formData.absence_days),
      salary_days: Number(formData.salary_days),
      deduction: Number(formData.deduction),
      overtime: Number(formData.overtime),
      bonus: Number(formData.bonus),
      gross_salary: Number(formData.gross_salary),
    };

    try {
      await generateSalaryRecord(payload);
      alert(t('employee.generateSalary.generatedSuccess'));
      onCloseUpdate();
    } catch (error) {
      console.error("Error generating salary", error);
      alert(t('employee.generateSalary.generateFailed'));
    }
  };

  useEffect(() => {
  const fetchAttendance = async () => {
    if (formData.employee && formData.month) {
      try {
        
        const result = await getAttendanceSummary(formData.employee.uuid, formData.month);
        setFormData(prev => ({
          ...prev,
          present_days: result.present.toString(),
          absence_days: result.absent.toString(),
        }));
      } catch (err) {
        console.error("Error fetching attendance summary", err);
      }
    }
  };

  fetchAttendance();
}, [formData.employee, formData.month]);

  // Function to get days in a month
  const getDaysInMonth = (monthString: string): number => {
    if (!monthString) return 30;
    const [year, month] = monthString.split('-').map(Number);
    // new Date(year, month, 0) gives last day of previous month, so month (1-12) gives correct days
    return new Date(year, month, 0).getDate();
  };

  // Update total_days when month changes
  useEffect(() => {
    if (formData.month) {
      const daysInMonth = getDaysInMonth(formData.month);
      setFormData(prev => ({
        ...prev,
        total_days: daysInMonth.toString()
      }));
    }
  }, [formData.month]);


  

  return (
    <Dialog
      open={openModal}
      onClose={handleCancel}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          minHeight: '52vh',
          display: 'flex',
          flexDirection: 'column',
          border: '1px solid white',
          borderRadius: 4,
          maxWidth:'1200px'
        },
      }}
    >
      <DialogTitle sx={{ fontWeight: 'bold', textAlign: 'center' }}>
      {t('employee.generateSalary.title')}
      </DialogTitle>

      <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', mb: 2, px: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <label style={{ marginBottom: 4, fontWeight: 'bold' }}>
            {t('employee.generateSalary.salaryMonth')}
          </label>
          <TextField
            size="small"
            type="month"
            value={monthInput}
            onChange={(e) => {
              setMonthInput(e.target.value);
              handleChange('month', e.target.value);
            }}
            sx={{ width: 180 }}
          />
        </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <label style={{ marginBottom: 4, fontWeight: 'bold' }}>
            {t('employee.generateSalary.salaryDate')}
          </label>
          <TextField
            size="small"
            type="date"
            value={dateInput}
            onChange={(e) => {
              setDateInput(e.target.value);
              handleChange('date', e.target.value);
            }}
            sx={{ width: 180 }}
          />
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <label style={{ marginBottom: 4, fontWeight: 'bold' }}>
            {t('employee.generateSalary.expenseHead')}
          </label>
          <TextField
            size="small"
            select
            value={formData.expense_head}
            onChange={(e) => handleChange('expense_head', e.target.value)}
            sx={{ width: 200 }}
          >
            <MenuItem value="salary exp">{t('employee.generateSalary.expenseHeads.salaryExp')}</MenuItem>
            <MenuItem value="Bonus">{t('employee.generateSalary.expenseHeads.bonus')}</MenuItem>
            <MenuItem value="Overtime">{t('employee.generateSalary.expenseHeads.overtime')}</MenuItem>
            <MenuItem value="Misc">{t('employee.generateSalary.expenseHeads.misc')}</MenuItem>
          </TextField>
        </Box>


        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <label style={{ marginBottom: 4, fontWeight: 'bold' }}>
            {t('employee.generateSalary.workingDays')}
          </label>
          <TextField
            size="small"
            type="number"
            value={formData.total_days}
            onChange={(e) => handleChange('total_days', e.target.value)}
            sx={{ width: 140 }}
          />
        </Box>
      </Box>

      <Box sx={{ overflowX: 'auto', px: 2 }}>
        <Box
          component="table"
          sx={{
            width: '100%',
            minWidth: 900,
            borderCollapse: 'collapse',
            '& thead': {
              borderBottom: '1px solid #e2e8f0',
              backgroundColor: '#F8F9FA',
            },
            '& th': {
              textAlign: 'left',
              fontWeight: 600,
              color: '#111827',
              py: 1.5,
              px: 2,
              whiteSpace: 'nowrap',
            },
            '& td': {
              py: 1.5,
              px: 2,
              verticalAlign: 'middle',
              whiteSpace: 'nowrap',
            },
            '& tbody tr': {
              borderBottom: '1px solid #e2e8f0',
            },
          }}
        >
          <thead>
            <tr>
              <th>{t('employee.common.employee')}</th>
              <th>{t('employee.common.salary')}</th>
              <th>{t('employee.common.present')}</th>
              <th>{t('employee.common.absent')}</th>
              <th>{t('employee.generateSalary.columns.leaveAllowance')}</th>
              <th>{t('employee.generateSalary.columns.salaryDays')}</th>
              <th>{t('employee.common.deduction')}</th>
              <th>{t('employee.generateSalary.expenseHeads.overtime')}</th>
              <th>{t('employee.common.bonus')}</th>
              <th>{t('employee.common.grossSalary')}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                 <Autocomplete
            options={employees}
            getOptionLabel={(option) => option.name}
            value={formData.employee}
            onChange={(event, value) => {
              handleChange('employee', value);
            }}
            renderInput={(params) => (
              <TextField 
                {...params} 
                // label="Select Employee" 
                variant="outlined" 
                required
                size="small"
              />
            )}
          />
              </td>
               <td>
                <TextField
                  size="small"
                  type="number"
                  value={formData.base_salary}
                  onChange={(e) => handleChange('base_salary', e.target.value)}
                  sx={{
                    width:'140%',
                  }}
                />
              </td>
              <td>
                <TextField
                  size="small"
                  type="number"
                  value={formData.present_days}
                  onChange={(e) => handleChange('present_days', e.target.value)}
                />
              </td>
              <td>
                <TextField
                  size="small"
                  type="number"
                  value={formData.absence_days}
                  onChange={(e) => handleChange('absence_days', e.target.value)}
                />
              </td>
              <td>
                <TextField
                  size="small"
                  type="number"
                  value={formData.leave_allowance}
                  onChange={(e) => handleChange('leave_allowance', e.target.value)}
                />
              </td>
              <td>
                <TextField
                  size="small"
                  type="number"
                  value={formData.salary_days}
                  onChange={(e) => handleChange('salary_days', e.target.value)}
                />
              </td>
              <td>
                <TextField
                  size="small"
                  type="number"
                  value={formData.deduction}
                  onChange={(e) => handleChange('deduction', e.target.value)}
                />
              </td>
              <td>
                <TextField
                  size="small"
                  type="number"
                  value={formData.overtime}
                  onChange={(e) => handleChange('overtime', e.target.value)}
                />
              </td>
              <td>
                <TextField
                  size="small"
                  type="number"
                  value={formData.bonus}
                  onChange={(e) => handleChange('bonus', e.target.value)}
                />
              </td>
              <td>
                <TextField
                  size="small"
                  type="number"
                  value={formData.gross_salary}
                  onChange={(e) => handleChange('gross_salary', e.target.value)}
                />
              </td>
            </tr>
          </tbody>
        </Box>
      </Box>

      <Box
        sx={{
          mt: { xs: 3, md: 6 },
          display: 'flex',
          justifyContent: 'center',
          gap: 2,
          mb: 2,
        }}
      >
        <Button
          variant="contained"
          sx={{
            px: 6,
            py: 0.75,
            fontSize: '0.85rem',
            fontWeight: 500,
            textTransform: 'none',
            backgroundColor: '#d3d3d3',
            color: '#000',
            '&:hover': { backgroundColor: '#bcbcbc' },
            boxShadow: 1,
            borderRadius: 1,
          }}
          onClick={handleCancel}
        >
          {t('employee.common.cancel')}
        </Button>

        <Button
          variant="contained"
          sx={{
            px: 6,
            py: 0.75,
            fontSize: '0.85rem',
            fontWeight: 500,
            textTransform: 'none',
            backgroundColor: '#005f73',
            '&:hover': { backgroundColor: '#007f91' },
            boxShadow: 1,
            borderRadius: 1,
          }}
          onClick={handleSubmit}
        >
          {t('employee.common.save')}
        </Button>
      </Box>
    </Dialog>
  );
};