import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Pagination,
  useTheme,
  Tooltip
} from '@mui/material';
import PageContainer from '../../shared/components/Layout/PageContainer';
import { getSalaryInvoices, markInvoicePaid, SalaryInvoice } from '../../shared/services/EmployeeAPI/salary.service';
import { tokens } from '../../shared/theme/theme';
import { usePermissions } from '../../shared/rbac/usePermissions';
import { PERMISSIONS } from '../../shared/rbac/permissions';

export default function ViewEmployee() {
  const [salaryData, setSalaryData] = useState<SalaryInvoice[]>([]);
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const { can } = usePermissions();
  const canPay = can(PERMISSIONS.SALARY_PAY);

  const ITEMS_PER_PAGE = 5;
  const [page, setPage] = useState(1);

  const dummyData = [
  {
    invoiceId: '123',
    uuid: '123',
    pendingAmount: 5000,
    salaryMonth: 'July 2025',
    status: 'pending',
    employee: {
      uuid: 'emp123',
      name: 'Ali Khan',
      designation: 'Developer',
      department: 'IT',
    },
  },
  {
    invoiceId: '124',
    uuid: '124',
    pendingAmount: 3000,
    salaryMonth: 'June 2025',
    status: 'pending',
    employee: {
      uuid: 'emp124',
      name: 'Sara Ahmed',
      designation: 'Designer',
      department: 'Creative',
    },
  },
];

  useEffect(() => {
    // setSalaryData(dummyData);
    fetchSalaryData();
  }, []);

  


const fetchSalaryData = async () => {
  try {
    const invoices = await getSalaryInvoices();
    // console.log('RAW API Response:', invoices);
 
    
    const unpaidInvoices = invoices.filter(
      (inv) => inv.status?.toLowerCase() !== 'paid'
    );

    if (unpaidInvoices.length > 0) {
      setSalaryData(unpaidInvoices);
    } else {
      console.warn('No unpaid invoices found');
    }
  } catch (error) {
    console.error('Failed to fetch salary invoices:', error);
   
  }
};


const handlePaySalary = async (invoiceId: string) => {
  console.log('Marking paid for invoiceId:', invoiceId);
  try {
    await markInvoicePaid(invoiceId);

  
    setSalaryData((prev) => prev.filter((item) => item.invoiceId !== invoiceId));

  } catch (error) {
    console.error('Failed to mark salary as paid:', error);
  }
};


  const handlePageChange = (_: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const paginatedSalary = salaryData.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  return (
    <PageContainer title="Employee Pending Salary">
      <Box sx={{
        pb: { xs: 2, sm: 3, md: 3 },
        backgroundColor: theme.palette.background.paper,
        borderRadius: "12px",
        boxShadow: theme.palette.mode === 'dark' ? '0 4px 12px rgba(0,0,0,0.3)' : '0 4px 12px rgba(0,0,0,0.1)',
      }}>
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
    <th>Name</th>
    <th>Designation</th>
    <th>Department</th>
    <th>Pending Amount</th>
    <th>Salary Month</th>
    
    <th>Pay</th>
  </tr>
</thead>
<tbody>
  {paginatedSalary.map((sal, index) => (
    <tr key={sal.invoiceId || sal.uuid || index}>
      <td>{(page - 1) * ITEMS_PER_PAGE + index + 1}</td>
      <td>{sal.employee?.name || 'N/A'}</td>
      <td>{sal.employee?.designation || 'N/A'}</td>
      <td>{sal.employee?.department || 'N/A'}</td>
      <td>{sal.pendingAmount}</td>
      <td>{sal.salaryMonth}</td>
    
      <td>
        <Tooltip title={canPay ? '' : 'No permission'}>
          <span>
        <Button
          variant="contained"
          disabled={!canPay}
          sx={{
            px: 4,
            py: 0.75,
            fontSize: '0.85rem',
            fontWeight: '500',
            textTransform: 'none',
            backgroundColor: '#005f73',
            '&:hover': { backgroundColor: '#007f91' },
            boxShadow: 1,
            borderRadius: 1,
          }}
          onClick={() => handlePaySalary(sal.invoiceId)}
        >
          Pay Salary
        </Button>
          </span>
        </Tooltip>
      </td>
    </tr>
  ))}
</tbody>



          </Box>
        </Box>

        <Box>
          <Button
            variant="contained"
            sx={{
              px: { xs: 12, md: 64 },
              py: 0.75,
              fontSize: '0.85rem',
              fontWeight: '600',
              textTransform: 'none',
              backgroundColor: '#ADD8E6',
              color: '#005f73',
              boxShadow: 1,
              borderRadius: 1,
              mt: 2,
              ml: { xs: 1.5, md: 2 },
              letterSpacing: '4px',
            }}
          >
            TOTAL: {salaryData.reduce((sum, item) => sum + item.pendingAmount, 0)}
          </Button>
        </Box>

        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Pagination
            count={Math.ceil(salaryData.length / ITEMS_PER_PAGE)}
            page={page}
            onChange={handlePageChange}
            color="primary"
          />
        </Box>
      </Box>
    </PageContainer>
  );
}
