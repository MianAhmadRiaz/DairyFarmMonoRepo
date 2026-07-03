import React, { useState,useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  Chip,
  Pagination,
  MenuItem,
  useTheme
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import { InputAdornment } from '@mui/material';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PageContainer from '../../shared/components/Layout/PageContainer';
import { getSalaryInvoices, SalaryInvoice ,deleteSalaryInvoice } from '../../shared/services/EmployeeAPI/salary.service';
import { tokens } from '../../shared/theme/theme';

import { ToastContainer, toast} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function ViewEmployee() {

   const [salaryData, setSalaryData] = useState<SalaryInvoice[]>([]);
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
 const [searchQuery, setSearchQuery] = useState('');
  const ITEMS_PER_PAGE = 5;
  const [page, setPage] = useState(1);

  const handlePageChange = (
    _event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    setPage(value);
  };

  const filteredSalary = salaryData.filter(sal => {
    const term = searchQuery.toLowerCase();
    return (
      sal.employee.name.toLowerCase().includes(term) ||
      sal.pendingAmount.toString().includes(term)
    );
  });

 const paginatedSalary = filteredSalary.slice(
  (page - 1) * ITEMS_PER_PAGE,
  page * ITEMS_PER_PAGE
);

    useEffect(() => {
    getSalaryInvoices()
      .then(data => setSalaryData(data))
      .catch(() => setSalaryData([]));
  }, []);
  
    const handleFormatMonthYear = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    const options = { year: 'numeric', month: 'long' } as const;
    return date.toLocaleDateString('en-US', options);
  };

  

const handleDeleteInvoice = async (invoiceId: string) => {
  try {
    await deleteSalaryInvoice(invoiceId);
    setSalaryData(prev => prev.filter(inv => inv.uuid !== invoiceId));
    toast.success('Deleted successfully')
  } catch (error: any) {
    // const backendMessage = error?.response?.data?.message || 'Failed to delete invoice. Please try again.';
    toast.error('Failed to delete invoice. Please try again.');
  }
};

  return (
    <PageContainer title="View Paid Income">
      <Box
  sx={{
    backgroundColor: theme.palette.background.paper,
    borderRadius: "12px",
    boxShadow: theme.palette.mode === 'dark' ? '0 4px 12px rgba(0,0,0,0.3)' : '0 4px 12px rgba(0,0,0,0.1)',
  }}
>

      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { sm: 'center' },
          justifyContent: 'space-between',
          gap: 2,
          p: { xs: 2, sm: 3, md: 3 },

        }}
      >
        <TextField
          placeholder="Search by Name or Salary"
          size="small"
          value={searchQuery}
           onChange={(e) => setSearchQuery(e.target.value)}
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
              <th>Sr#</th>
              <th>Employee</th>
              <th>Salary Month</th>
              <th>Date</th>
              <th>Paying Salary</th>
              <th>Advance Cutting</th>
              <th>Account</th>
              <th>Delete</th>
            </tr>
          </thead>

          <tbody>
                       {paginatedSalary.map((sal, index) => (
              <tr key={sal.uuid}>
                <td>{(page - 1) * ITEMS_PER_PAGE + index + 1}</td>
                <td>{sal.employee.name}</td>
                {/* <td>{sal.salaryMonth}</td> */}
                 <td>{handleFormatMonthYear(sal.salaryMonth)}</td>
                <td>{/* date missing from API, so blank */}</td>
                <td>{sal.pendingAmount}</td>
                <td>{/* advanceCutting missing, leave blank */}</td>
                <td>{/* account missing, leave blank */}</td>

                <td>
                  <Box>
                    <IconButton size="small" color="error"  onClick={() => handleDeleteInvoice(sal.uuid)}>
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
          count={Math.ceil(filteredSalary.length / ITEMS_PER_PAGE)}
          page={page}
          onChange={handlePageChange}
          color="primary"
        />
      </Box>
    </Box>
     <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover

          />
    </PageContainer>
  );
}
