import React, { useMemo, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  useTheme,
  Stack,
  InputAdornment,
  MenuItem,
  IconButton,
  Tooltip,
  Chip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import { useTranslation } from 'react-i18next';
import { tokens } from '../../shared/theme/theme';
import PageContainer from '../../shared/components/Layout/PageContainer';


interface Customer {
  id: number;
  customer: string;
  account: string;
  status: 'Active' | 'Inactive';
}

// Sample data (replace with API)
const DEMO_CUSTOMERS: Customer[] = [
  // Currently empty to match the "No data available in table" state
];

const ENTRIES_OPTIONS = [10, 25, 50, 100];

const toCsv = (headers: string[], rows: (string | number)[][]) =>
  [headers.join(','), ...rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))].join('\n');

export default function CashCustomers() {
  const { t } = useTranslation();
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const pageBg = theme.palette.mode === 'dark' ? colors.primary[500] : '#F5FAF7';

  const [customers] = useState<Customer[]>(DEMO_CUSTOMERS);
  const [search, setSearch] = useState('');
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return customers.filter(customer =>
      q ? 
        customer.customer.toLowerCase().includes(q) || 
        customer.account.toLowerCase().includes(q) ||
        customer.status.toLowerCase().includes(q) : true
    );
  }, [customers, search]);

  // Pagination
  const totalPages = Math.ceil(filtered.length / entriesPerPage);
  const startIndex = (currentPage - 1) * entriesPerPage;
  const endIndex = startIndex + entriesPerPage;
  const paginatedData = filtered.slice(startIndex, endIndex);
  const showingStart = filtered.length === 0 ? 0 : startIndex + 1;
  const showingEnd = Math.min(endIndex, filtered.length);

  // Toolbar actions
  const handleCopy = async () => {
    const csv = toCsv(
      ['#', t('accounts.common.customer'), t('accounts.common.account'), t('accounts.common.status')],
      filtered.map(c => [c.id, c.customer, c.account, c.status])
    );
    await navigator.clipboard.writeText(csv);
    alert(t('accounts.common.copiedCsv'));
  };

  const downloadCsv = (filename: string) => {
    const csv = toCsv(
      ['#', t('accounts.common.customer'), t('accounts.common.account'), t('accounts.common.status')],
      filtered.map(c => [c.id, c.customer, c.account, c.status])
    );
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  };

  const handleAddCustomer = () => {
    alert(t('accounts.cashCustomers.addCustomerTodo'));
  };

  const handleEdit = (customer: Customer) => {
    console.log('Edit customer:', customer);
    alert(t('accounts.cashCustomers.editCustomer', { name: customer.customer }));
  };

  const handleDelete = (customer: Customer) => {
    console.log('Delete customer:', customer);
    if (confirm(t('accounts.cashCustomers.confirmDelete', { name: customer.customer }))) {
      alert(t('accounts.cashCustomers.deleteTodo'));
    }
  };

  return (
    <PageContainer title={t('accounts.cashCustomers.title')}>
        {/* Main Card */}
        <Paper elevation={0} sx={{ p: 0, borderRadius: 2, border: `1px solid ${theme.palette.divider}`, bgcolor: 'background.paper' }}>
          
          {/* Orange Header - matching the screenshot */}
          <Box
            sx={{
              bgcolor: '#CD834F', // Saddle brown color matching screenshot
              color: '#fff',
              px: 2.5,
              py: 1.5,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Typography variant="h6" fontWeight={600}>
              {t('accounts.cashCustomers.viewTitle')}
            </Typography>
            <Button
              startIcon={<AddIcon />}
              variant="contained"
              onClick={handleAddCustomer}
              sx={{
                backgroundColor: 'rgba(255,255,255,0.2)',
                color: '#fff',
                textTransform: 'none',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.3)',
                }
              }}
            >
              {t('accounts.cashCustomers.addCustomer')}
            </Button>
          </Box>

          {/* Controls Section - matching screenshot layout */}
          <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: theme.palette.mode === 'dark' ? colors.primary[400] : '#f8f9fa', borderBottom: `1px solid ${theme.palette.divider}` }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="body2">{t('accounts.common.show')}</Typography>
              <TextField
                select
                size="small"
                value={entriesPerPage}
                onChange={(e) => {
                  setEntriesPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                sx={{ width: 80, bgcolor: 'background.paper' }}
              >
                {ENTRIES_OPTIONS.map(option => (
                  <MenuItem key={option} value={option}>{option}</MenuItem>
                ))}
              </TextField>
              <Typography variant="body2">{t('accounts.common.entries')}</Typography>
            </Stack>

            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="body2">{t('accounts.common.searchLabel')}</Typography>
              <TextField
                size="small"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                sx={{ width: 200, bgcolor: 'background.paper' }}
              />
            </Stack>
          </Box>

          {/* Table */}
          <Box sx={{ overflow: 'auto' }}>
            <table style={{ borderCollapse: 'separate', width: '100%' }}>
              <thead>
                <tr>
                  <th style={th}>#</th>
                  <th style={{ ...th, minWidth: 200 }}>{t('accounts.common.customer')}</th>
                  <th style={{ ...th, minWidth: 200 }}>{t('accounts.common.account')}</th>
                  <th style={{ ...th, minWidth: 120 }}>{t('accounts.common.status')}</th>
                  <th style={{ ...th, minWidth: 120 }}>{t('accounts.common.actions')}</th>
                </tr>
              </thead>

              <tbody>
                {paginatedData.length === 0 ? (
                  <tr>
                    <td style={{ ...td, textAlign: 'center', padding: '60px 12px', color: '#666' }} colSpan={5}>
                      {t('accounts.common.noDataInTable')}
                    </td>
                  </tr>
                ) : (
                  paginatedData.map((customer) => (
                    <tr key={customer.id}>
                      <td style={td}>{customer.id}</td>
                      <td style={td}>{customer.customer}</td>
                      <td style={td}>{customer.account}</td>
                      <td style={td}>
                        <Chip
                          size="small"
                          label={t(`accounts.common.statusValues.${customer.status.toLowerCase()}`, customer.status)}
                          sx={{
                            bgcolor: customer.status === 'Active' ? '#E6F4EF' : '#FFF1F1',
                            color: customer.status === 'Active' ? '#1B5E20' : '#C62828',
                            fontWeight: 600,
                          }}
                        />
                      </td>
                      <td style={td}>
                        <Tooltip title={t('common.edit')}>
                          <IconButton size="small" onClick={() => handleEdit(customer)}>
                            <EditOutlinedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={t('common.delete')}>
                          <IconButton size="small" onClick={() => handleDelete(customer)}>
                            <DeleteOutlineOutlinedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </Box>

          {/* Footer with pagination - matching screenshot */}
          <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: theme.palette.mode === 'dark' ? colors.primary[400] : '#f8f9fa', borderTop: `1px solid ${theme.palette.divider}` }}>
            <Typography variant="body2" color="text.secondary">
              {t('accounts.common.showingEntriesRange', { start: showingStart, end: showingEnd, total: filtered.length })}
            </Typography>
            
            <Stack direction="row" spacing={1} alignItems="center">
              <Button
                size="small"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => prev - 1)}
                sx={{ 
                  textTransform: 'none', 
                  minWidth: 'auto',
                  color: 'text.secondary',
                }}
              >
                {t('accounts.common.previous')}
              </Button>
              
              <Button
                size="small"
                disabled={currentPage === totalPages || totalPages === 0}
                onClick={() => setCurrentPage(prev => prev + 1)}
                sx={{ 
                  textTransform: 'none', 
                  minWidth: 'auto',
                  color: '#6a757d',
                }}
              >
                {t('common.next')}
              </Button>
            </Stack>
          </Box>
        </Paper>

        {/* Copyright Footer */}
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: 'left' }}>
          {t('accounts.common.copyright')}
        </Typography>
    </PageContainer>
  );
}

const th: React.CSSProperties = {
  background: '#f8fafc',
  textAlign: 'left',
  padding: '12px',
  borderBottom: '2px solid #e5e9ef',
  fontWeight: 600,
  color: '#374151',
};

const td: React.CSSProperties = {
  padding: '12px',
  borderBottom: '1px solid #eceff1',
  verticalAlign: 'middle',
};
