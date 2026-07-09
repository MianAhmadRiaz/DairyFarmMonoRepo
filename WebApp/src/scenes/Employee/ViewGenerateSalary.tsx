import React, { useState,useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  Chip,
  Pagination,
  MenuItem,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import {InputAdornment } from '@mui/material';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PageContainer from '../../shared/components/Layout/PageContainer';
import { getSalaryRecords, SalaryRecord,updateSalaryRecord} from '../../shared/services/EmployeeAPI/salary.service';

export default function ViewEmployee() {
  const { t } = useTranslation();
  const [isModalOpen, setModalOpen] = useState(false);
  const [isEditModalOpen, setisEditModalOpen] = useState(false);
  const [recordToEdit, setRecordToEdit] = useState<SalaryRecord | undefined>(undefined);
  const [salaryData, setSalaryData] = useState<SalaryRecord[]>([]);

  const ITEMS_PER_PAGE = 5;
  const [page, setPage] = useState(1);

  const handlePageChange = (
    _event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    setPage(value);
  };

  const paginatedSalary = salaryData.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  const handleCloseModal = () => {
    setModalOpen(false);
  };
  const handleCloseEditModal = () => {
    setisEditModalOpen(false);
  };



useEffect(() => {
  async function fetchSalary() {

    try {
      const response = await getSalaryRecords();
   console.log("API response full data:", JSON.stringify(response, null, 2));

const headLabelMap: Record<string, string> = {
  'salary exp': t('employee.viewGenerateSalary.heads.salary'),
  'bonus': t('employee.viewGenerateSalary.heads.bonus'),
  'overtime': t('employee.viewGenerateSalary.heads.overtime'),
  'misc': t('employee.viewGenerateSalary.heads.miscellaneous'),

};
   
  const normalized = response
     .filter((item: any) => !item.isPaid) 
  .map((item: any) => {
  // Extract just YYYY-MM for salary month from item.month (which is "2025-06-12")
  const salaryMonth = item.month ? item.month.slice(0, 7) : ''; // "2025-06"

  return {
    invoiceId: item.invoiceId || item.uuid,
    uuid: item.uuid,
    farmId: item.farmId,
    employee_id: item.employee_id,
    name: item.name,
 
    expense_head: headLabelMap[item.expense_head.toLowerCase()] || item.expense_head,
    month: salaryMonth,
    date: item.month || '', 
    gross_salary: Number(item.gross_salary) || 0,
    opening_advance: item.opening_advance || 0,
    total_days: item.total_days || 0,
    present_days: item.present_days || 0,
    absence_days: item.absence_days || 0,
    salary_days: item.salary_days || 0,
    deduction: item.deduction || 0,
    bonus: item.bonus || 0,
  };
});

      setSalaryData(normalized);
    } catch (error) {
      console.error('Failed to fetch salary records:', error);
    }
  }
  fetchSalary();
}, [t]);

const formatDate = (dateStr: string | undefined): string => {
  if (!dateStr) return '';
  
  const date = new Date(dateStr);
  const day = date.getDate();
  const month = date.toLocaleString('default', { month: 'short' }); 
  const year = date.getFullYear();

  
  const getOrdinal = (n: number) => {
    if (n > 3 && n < 21) return `${n}th`;
    switch (n % 10) {
      case 1: return `${n}st`;
      case 2: return `${n}nd`;
      case 3: return `${n}rd`;
      default: return `${n}th`;
    }
  };

  return `${getOrdinal(day)}-${month}-${year}`;
};
const formatYearMonth = (yearMonth: string | undefined): string => {
  if (!yearMonth) return '';
  
  const [year, month] = yearMonth.split('-');
  const monthName = new Date(Number(year), Number(month) - 1).toLocaleString('default', { month: 'short' });
  
  return `${monthName}-${year}`;
};

  return (
    <PageContainer title={t('employee.viewGenerateSalary.title')}>
       <Box sx={{backgroundColor:'white',
                borderRadius: 2,
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
            }}>
      
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { sm: 'center' },
          justifyContent: 'space-between',
          gap: 2,
          p:{xs:2,md:3},
        
        }}
      >
        <TextField
          placeholder={t('employee.common.searchByNameOrSalary')}
          size="small"
          sx={{
            width: '100%',
            backgroundColor: '#fff',
            border: '1px solid #ccc',
            borderRadius: 2,
            '& .MuiInputBase-root': {
              borderRadius: 1
            }
          }}
        />
      </Box>

      <Box sx={{ overflowX: 'auto' ,
               }}>
        <Box
          component="table"
          sx={{
            width: '100%',
            minWidth: '900px',
            borderCollapse: 'collapse',
            '& thead': {
              borderBottom: '1px solid #e2e8f0',
             backgroundColor: "#F8F9FA"
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
              <th>{t('employee.common.date')}</th>
              <th>{t('employee.common.salaryMonth')}</th>
              <th>{t('employee.common.employee')}</th>
              <th>{t('employee.viewGenerateSalary.head')}</th>
              <th>{t('employee.common.amount')}</th>
              <th>{t('employee.common.edit')}</th>
            </tr>
          </thead>
          <tbody>
            {paginatedSalary.map((record, index) => (
            <tr key={record.uuid}>
  <td>{index + 1}</td> {/* Sr# */}
  <td>{formatDate(record.date)}</td>
  <td>{formatYearMonth(record.month)}</td>
  {/* <td>{record.name}</td> */}
  <td></td>
  <td>{record.expense_head}</td>
  <td>{record.gross_salary}</td>

                <td>
                  <Box>
                    <Button
                      variant="contained"
                      sx={{
                        px: 3,
                        py: 0.75,
                        fontSize: '0.85rem',
                        fontWeight: '500',
                        textTransform: 'none',
                        backgroundColor: '#005f73',
                        '&:hover': { backgroundColor: '#007f91' },
                        boxShadow: 1,
                        borderRadius: 1
                      }}
                      onClick={() => setModalOpen(true)}
                    >
                      {t('employee.viewGenerateSalary.viewDetails')}
                    </Button>

                    <IconButton size="small" color="primary"
                       onClick={() => {
    setRecordToEdit(paginatedSalary[index]); // pass the clicked record
    setisEditModalOpen(true);
  }}
                     >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" color="error">
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </td>
              </tr>
            ))}
          </tbody>
        </Box>
      </Box>

      {/* Pagination */}
      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end',pb:2 }}>
        <Pagination
          count={Math.ceil(salaryData.length / ITEMS_PER_PAGE)}
          page={page}
          onChange={handlePageChange}
          color="primary"
        />
      </Box>
      </Box>

      {/*Modals*/}
      <ViewEmployeeModal
       openModal={isModalOpen}
       onCloseUpdate={handleCloseModal}
      />
      <EditEmployeeModal
       openModal={isEditModalOpen}
       onCloseUpdate={handleCloseEditModal}
       recordToEdit={recordToEdit}
      />
    </PageContainer>
  );
}


interface EditDetails {
  openModal: boolean;
  onCloseUpdate: () => void;
    recordToEdit?: SalaryRecord;
}

const EditEmployeeModal: React.FC<EditDetails> = ({
  openModal,
  onCloseUpdate,
  recordToEdit,
}) => {
  const { t } = useTranslation();
  const handleCancel = () => {
    onCloseUpdate();
  };

const [formData, setFormData] = useState<SalaryRecord>(recordToEdit || {
    name: '',
   total_days: 0,
  present_days: 0,
  absence_days: 0,
  salary_days: 0,
  deduction: 0,
  bonus: 0,

}as SalaryRecord);

   useEffect(() => {
  if (recordToEdit) {
    setFormData(recordToEdit);
  }
}, [recordToEdit]);


const handleChange = (field: keyof SalaryRecord, value: any) => {
  setFormData(prev => ({
    ...prev,
    [field]: value,
  }));
};




 
const handleSubmit = async () => {
  try {
    if (!formData) {
      alert(t('employee.viewGenerateSalary.noData'));
      return;
    }
    await updateSalaryRecord({ ...formData, uuid: formData.invoiceId });
    alert(t('employee.viewGenerateSalary.updateSuccess'));
    // close modal or refresh data
  } catch (error: any) {
    if (error.response?.data?.message) {
      alert(t('employee.viewGenerateSalary.updateFailedMsg', { message: error.response.data.message }));
    } else {
      alert(t('employee.viewGenerateSalary.updateFailed'));
    }
    console.error('Update failed:', error);
  }
};


  return (
    <Dialog
      open={openModal}
      onClose={(_, __) => handleCancel()}
      maxWidth="md"
      fullWidth
      PaperProps={{
      sx: {
      minHeight: '52vh',
      display: 'flex',
      flexDirection: 'column',
      border: '1px solid white',
      borderRadius: 4,
    }
    }}
    >
      <DialogTitle sx={{ fontWeight: 'bold' , textAlign: 'center'}}>{t('employee.viewGenerateSalary.editEmployeeDetails')}</DialogTitle>
      <Box
        sx={{
          display: 'flex',
          gap: 3,
          flexWrap: 'wrap' ,
          mb: 4,
          justifyContent: 'center',
        }}
      >
        {/* Salary Month */}
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <label style={{ marginBottom: '4px' , fontWeight: 'bold' }}>{t('employee.generateSalary.salaryMonth')}</label>
          <TextField
            size="small"
             type="month"
            placeholder={t('employee.common.select')}
             value={formData.month}
  onChange={e => setFormData({ ...formData, month: e.target.value })}
         
          />
        </Box>
      
        {/* Date */}
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <label style={{ marginBottom: '4px' , fontWeight: 'bold' }}>{t('employee.common.date')}</label>
          <TextField
            size="small"
            type="date"
            placeholder={t('employee.common.select')}
             value={formData.date}
  onChange={e => setFormData({ ...formData, date: e.target.value })}
          
          />
        </Box>
      
        {/* Expense Head - Combo Box */}
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <label style={{ marginBottom: '4px' , fontWeight: 'bold' }}>{t('employee.generateSalary.expenseHead')}</label>
          <TextField
            select
            size="small"
            value={formData.expense_head || ''}
  onChange={e => setFormData({ ...formData, expense_head: e.target.value })}
          >
            <MenuItem value="Salary">{t('employee.generateSalary.expenseHeads.salary')}</MenuItem>
            <MenuItem value="Bonus">{t('employee.generateSalary.expenseHeads.bonus')}</MenuItem>
            <MenuItem value="Overtime">{t('employee.generateSalary.expenseHeads.overtime')}</MenuItem>
            <MenuItem value="Misc">{t('employee.generateSalary.expenseHeads.misc')}</MenuItem>
          </TextField>
        </Box>
      
        {/* Working Days */}
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <label style={{ marginBottom: '4px' , fontWeight: 'bold' }}>{t('employee.generateSalary.workingDays')}</label>
          <TextField size="small" type="number"
           value={formData.total_days}
  onChange={e => setFormData({ ...formData, total_days: Number(e.target.value) })}
   />
        </Box>
      </Box>

      <Box sx={{ overflowX: 'auto' }} >
        <Box
          component="table"
          sx={{
            width: '100%',
            minWidth: '860px',
            borderCollapse: 'collapse',
            '& thead': {
              borderBottom: '1px solid #e2e8f0',
             backgroundColor: "#F8F9FA"
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
              <th>{t('employee.common.present')}</th>
              <th>{t('employee.common.absent')}</th>
              <th>{t('employee.generateSalary.columns.salaryDay')}</th>
              <th>{t('employee.common.deduction')}</th>
              <th>{t('employee.common.bonus')}</th>
              <th>{t('employee.common.grossSalary')}</th>
            </tr>
          </thead>
          <tbody>

    <tr key={formData.invoiceId || 'edit-row'}>
      <td>1</td>  {/* Serial Number */}
      <td>
              <input
                      type="text"
        // value={formData.name}
        value={formData.name || ''}
        onChange={(e) => handleChange('name', e.target.value)}

                style={{
                  width: '160px',
                  padding: '4px',
                  border: '1px solid #ccc',
                  borderRadius: '4px'
                }}
              />
            </td>
            <td>
              <input
                type="number"
               
           value={formData.present_days|| 0}
        onChange={(e) => handleChange('present_days',Number( e.target.value))}
                style={{
                  width: '70px',
                  padding: '4px',
                  border: '1px solid #ccc',
                  borderRadius: '4px'
                }}
              />
            </td>
            <td>
              <input
                type="number"
               value={formData.absence_days || 0}
          onChange={(e) => handleChange('absence_days', Number(e.target.value))}
                style={{
                  width: '70px',
                  padding: '4px',
                  border: '1px solid #ccc',
                  borderRadius: '4px'
                }}
              />
            </td>
            <td>
              <input
                type="number"
               value={formData.salary_days || 0}
          onChange={(e) => handleChange('salary_days', Number(e.target.value))}
                style={{
                  width: '70px',
                  padding: '4px',
                  border: '1px solid #ccc',
                  borderRadius: '4px'
                }}
              />
            </td>
            <td>
              <input
                type="number"
               value={formData.deduction || 0}
          onChange={(e) => handleChange( 'deduction', Number(e.target.value))}
                style={{
                  width: '70px',
                  padding: '4px',
                  border: '1px solid #ccc',
                  borderRadius: '4px'
                }}
              />
            </td>
            <td>
              <input
                type="number"
                 value={formData.bonus || 0}
          onChange={(e) => handleChange( 'bonus', Number(e.target.value))}
                style={{
                  width: '70px',
                  padding: '4px',
                  border: '1px solid #ccc',
                  borderRadius: '4px'
                }}
              />
            </td>
            <td>
              <input
                type="number"
               value={formData.gross_salary || 0}
          onChange={(e) => handleChange('gross_salary', Number(e.target.value))}
                style={{
                  width: '90px',
                  padding: '4px',
                  border: '1px solid #ccc',
                  borderRadius: '4px'
                }}
              />
            </td>
          </tr>

        </tbody>
        </Box>
      </Box>
      <Box
        sx={{
          mt: {xs:3,md:6},
          display: 'flex',
          justifyContent: 'center',
          gap: 2,
           mb:1
        }}
      >
        <Button
          variant="contained"
          sx={{
            px: 6,
            py: 0.75,
            fontSize: '0.85rem',
            fontWeight: '500',
            textTransform: 'none',
            backgroundColor: '#d3d3d3',
            color: '#000',
            '&:hover': { backgroundColor: '#bcbcbc' },
            boxShadow: 1,
            borderRadius: 1
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
            fontWeight: '500',
            textTransform: 'none',
            backgroundColor: '#005f73',
            '&:hover': { backgroundColor: '#007f91' },
            boxShadow: 1,
            borderRadius: 1
          }}
          onClick={handleSubmit}
        >
         {t('employee.common.update')}
        </Button>
      </Box>
    </Dialog>
  );
};






interface ViewDetails {
  openModal: boolean;
  onCloseUpdate: () => void;
}

const ViewEmployeeModal: React.FC<ViewDetails> = ({
  openModal,
  onCloseUpdate
}) => {
  const { t } = useTranslation();
  const handleCancel = () => {
    onCloseUpdate();
  };
  const [salaryRecords, setSalaryRecords] = useState<SalaryRecord[]>([]);

   useEffect(() => {
    if (openModal) {
      getSalaryRecords().then(records => {
        setSalaryRecords(records);
      });
    }
  }, [openModal]);


  return (
    <Dialog
      open={openModal}
      onClose={(_, __) => handleCancel()}
      maxWidth="lg"
      fullWidth
      sx={{
        border: '1px solid white',
        borderRadius: 12,
      }}
      PaperProps={{
      sx: {
      minHeight: '42vh',
      display: 'flex',
      flexDirection: 'column',
      border: '1px solid white',
      borderRadius: 4,
       position: 'absolute',
      left: { xs: '1', md: '19%' }, 
      transform: 'none', 
      width: { xs: '90%', md: '75%' }, 
    }
    }}
    >
      <DialogTitle sx={{ fontWeight: 'bold' , textAlign:  'center'}}>{t('employee.viewGenerateSalary.employeeDetails')}</DialogTitle>
      <Box sx={{ overflowX: 'auto' }}>
        <Box
          component="table"
          sx={{
            width: '100%',
            minWidth: '900px',
            borderCollapse: 'collapse',
            '& thead': {
              borderBottom: '1px solid #e2e8f0',
              backgroundColor: "#F8F9FA"
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
              <th>{t('employee.common.present')}</th>
              <th>{t('employee.common.absent')}</th>
              <th>{t('employee.generateSalary.columns.salaryDay')}</th>
              <th>{t('employee.common.deduction')}</th>
              <th>{t('employee.common.bonus')}</th>
              <th>{t('employee.common.grossSalary')}</th>
            </tr>
          </thead>
        <tbody>
  {salaryRecords.map((record, index) => (
    <tr key={record.invoiceId}>
      <td>{index + 1}</td>
      <td>{record.name}</td>
      <td>{record.present_days}</td>
      <td>{record.absence_days}</td>
      <td>{record.salary_days}</td>
      <td>{record.deduction}</td>
      <td>{record.bonus}</td>
      <td>{record.gross_salary}</td>
    </tr>
  ))}
</tbody>
        </Box>
      </Box>
      <Box
        sx={{
          mt: 10,
          display: 'flex',
          justifyContent: 'center',
          gap: 2
        }}
      >
        <Button
          variant="contained"
          sx={{
            px: 6,
            py: 0.75,
            fontSize: '0.85rem',
            fontWeight: '500',
            textTransform: 'none',
            backgroundColor: '#d3d3d3',
            color: '#000',
            '&:hover': { backgroundColor: '#bcbcbc' },
            boxShadow: 1,
            borderRadius: 1
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
            fontWeight: '500',
            textTransform: 'none',
            backgroundColor: '#005f73',
            '&:hover': { backgroundColor: '#007f91' },
            boxShadow: 1,
            borderRadius: 1
          }}
          onClick={handleCancel}
        >
          🖨️ {t('employee.viewGenerateSalary.print')}
        </Button>
      </Box>
    </Dialog>
  );
};

