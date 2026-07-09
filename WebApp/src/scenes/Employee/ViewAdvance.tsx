import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Typography,
  TextField,
  Button,
  Chip,
  Pagination,
  CircularProgress,
  useTheme
} from '@mui/material';
import PageContainer from '../../shared/components/Layout/PageContainer';
import { tokens } from '../../shared/theme/theme';
import { AdvanceSalaryService } from '../../shared/services/EmployeeAPI/advanceSalary.service';

interface AdvanceRow {
  transactionId: string;
  employeeName: string;
  transactionType: string;
  amount: number;
  transactionDate: string;
  paymentMethod?: string;
  status?: string;
}

export default function ViewEmployee() {
  const { t } = useTranslation();
  const [advances, setAdvances] = useState<AdvanceRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await AdvanceSalaryService.getAdvanceTransactionHistory();
        setAdvances(res?.data?.transactions ?? []);
      } catch (error) {
        console.error('Failed to load advance history', error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const ITEMS_PER_PAGE = 5;
  const [page, setPage] = useState(1);

  const handlePageChange = (
    _event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    setPage(value);
  };

  const filtered = advances.filter((a) =>
    a.employeeName?.toLowerCase().includes(search.toLowerCase())
  );

  const paginatedEmployees = filtered.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  return (
    <PageContainer title={t('employee.viewAdvance.title')}>
      <Box
        sx={{
          backgroundColor: theme.palette.background.paper,
          borderRadius: '12px',
          boxShadow:
            theme.palette.mode === 'dark'
              ? '0 4px 12px rgba(0,0,0,0.3)'
              : '0 4px 12px rgba(0,0,0,0.1)'
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { sm: 'center' },
            justifyContent: 'space-between',
            gap: 2,
            p: { xs: 2, sm: 3, md: 3 }
          }}
        >
          <TextField
            placeholder={t('employee.common.searchByName')}
            size="small"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            sx={{
              width: '100%',
              backgroundColor:
                theme.palette.mode === 'dark' ? colors.primary[400] : '#fff',
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
                backgroundColor:
                  theme.palette.mode === 'dark'
                    ? colors.primary[400]
                    : '#F8F9FA'
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
                <th>{t('employee.common.name')}</th>
                <th>{t('employee.common.date')}</th>
                <th>{t('employee.viewAdvance.type')}</th>
                <th>{t('employee.common.amount')}</th>
                <th>{t('employee.common.status')}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: 24 }}>
                    <CircularProgress size={24} />
                  </td>
                </tr>
              ) : paginatedEmployees.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: 24 }}>
                    {t('employee.viewAdvance.noTransactions')}
                  </td>
                </tr>
              ) : (
                paginatedEmployees.map((emp, index) => (
                  <tr key={emp.transactionId}>
                    <td>{(page - 1) * ITEMS_PER_PAGE + index + 1}</td>
                    <td>{emp.employeeName}</td>
                    <td>
                      {emp.transactionDate
                        ? new Date(emp.transactionDate).toLocaleDateString()
                        : '-'}
                    </td>
                    <td>
                      <Chip
                        size="small"
                        label={t('employee.viewAdvance.transactionType.' + emp.transactionType, emp.transactionType)}
                        color={
                          emp.transactionType === 'given'
                            ? 'warning'
                            : 'success'
                        }
                      />
                    </td>
                    <td>{emp.amount}</td>
                    <td>
                      <Chip
                        size="small"
                        variant="outlined"
                        label={t('employee.viewAdvance.status.' + (emp.status || 'active'), emp.status || 'active')}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Box>
        </Box>

        {/* Pagination */}
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', pb: 2 }}>
          <Pagination
            count={Math.ceil(filtered.length / ITEMS_PER_PAGE) || 1}
            page={page}
            onChange={handlePageChange}
            color="primary"
          />
        </Box>
      </Box>
    </PageContainer>
  );
}
