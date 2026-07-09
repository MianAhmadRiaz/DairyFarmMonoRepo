import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Button,
  Paper,
  Grid,
  Container,
  Typography,
  IconButton,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import {
  getSuppliers,
  addSupplier,
  deleteSupplier,
  Supplier
} from '../../../shared/services/stockModule.services';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import PageContainer from '../../../shared/components/Layout/PageContainer';
import { useTranslation } from 'react-i18next';

const Suppliers: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', contact: '', address: '' });

  const loadSuppliers = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getSuppliers({ page: page + 1, limit: rowsPerPage });
      setSuppliers(data.suppliers || []);
      setTotalCount(data.totalCount || 0);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || t('stock.suppliers.fetchError'));
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, t]);

  useEffect(() => {
    loadSuppliers();
  }, [loadSuppliers]);

  const handleAddSupplier = async () => {
    if (!form.name.trim()) {
      toast.warning(t('stock.common.supplierNameWarning'));
      return;
    }
    setIsSubmitting(true);
    try {
      await addSupplier({
        name: form.name.trim(),
        contact: form.contact || undefined,
        address: form.address || undefined
      });
      toast.success(t('stock.common.supplierAddedSuccess'));
      setForm({ name: '', contact: '', address: '' });
      loadSuppliers();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || t('stock.common.addSupplierError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSupplier = async (supplierId: string) => {
    setDeletingId(supplierId);
    try {
      await deleteSupplier(supplierId);
      toast.success(t('stock.suppliers.removeSuccess'));
      loadSuppliers();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || t('stock.suppliers.removeError'));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <PageContainer title={t('stock.suppliers.title')} subtitle={t('stock.suppliers.subtitle')}>
      <Container maxWidth="lg" sx={{ px: isMobile ? '11px' : undefined }}>
        <Paper
          elevation={3}
          sx={{
            p: { xs: 2, md: 3 },
            borderRadius: '12px',
            backgroundColor: theme.palette.background.paper,
            boxShadow:
              theme.palette.mode === 'dark'
                ? '0 4px 12px rgba(0,0,0,0.3)'
                : '0 4px 12px rgba(0,0,0,0.1)',
            mb: 3
          }}
        >
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
            {t('stock.suppliers.addSupplier')}
          </Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={3}>
              <TextField
                label={t('stock.common.supplierName')}
                value={form.name}
                onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
                fullWidth
                size="small"
                placeholder={t('stock.common.enterSupplierName')}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                label={t('stock.common.contact')}
                value={form.contact}
                onChange={e => setForm(prev => ({ ...prev, contact: e.target.value }))}
                fullWidth
                size="small"
                placeholder={t('stock.common.enterContactNumber')}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                label={t('stock.common.address')}
                value={form.address}
                onChange={e => setForm(prev => ({ ...prev, address: e.target.value }))}
                fullWidth
                size="small"
                placeholder={t('stock.common.enterAddress')}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                variant="contained"
                fullWidth
                onClick={handleAddSupplier}
                disabled={isSubmitting}
                startIcon={
                  isSubmitting ? <CircularProgress size={18} sx={{ color: '#0F7C8F' }} /> : <AddIcon />
                }
                sx={{
                  backgroundColor: '#005f73',
                  '&:hover': {
                    backgroundColor: '#ffffff',
                    color: '#005f73',
                    border: '1px solid #005f73'
                  },
                  '&.Mui-disabled': {
                    backgroundColor: '#e0e0e0',
                    color: '#9e9e9e'
                  }
                }}
              >
                {t('common.add')}
              </Button>
            </Grid>
          </Grid>
        </Paper>

        <Paper
          elevation={3}
          sx={{
            borderRadius: '12px',
            backgroundColor: theme.palette.background.paper,
            boxShadow:
              theme.palette.mode === 'dark'
                ? '0 4px 12px rgba(0,0,0,0.3)'
                : '0 4px 12px rgba(0,0,0,0.1)',
            mb: 3,
            overflowX: 'auto'
          }}
        >
          <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              {t('stock.suppliers.supplierList')}
            </Typography>
            {loading && <CircularProgress size={18} />}
          </Box>
          <TableContainer>
            <Table size={isMobile ? 'small' : 'medium'}>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f8f9fA' }}>
                  <TableCell sx={{ fontWeight: 'bold' }}>{t('stock.common.name')}</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>{t('stock.common.contact')}</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>{t('stock.common.address')}</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>{t('stock.suppliers.addedOn')}</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }} align="center">
                    {t('stock.common.actions')}
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {suppliers.length === 0 && !loading ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      {t('stock.suppliers.noSuppliers')}
                    </TableCell>
                  </TableRow>
                ) : (
                  suppliers.map(supplier => (
                    <TableRow key={supplier.uuid} sx={{ '&:hover': { backgroundColor: '#f8f9fa' } }}>
                      <TableCell sx={{ textTransform: 'capitalize' }}>{supplier.name}</TableCell>
                      <TableCell>{supplier.contact || '-'}</TableCell>
                      <TableCell>{supplier.address || '-'}</TableCell>
                      <TableCell>
                        {supplier.createdAt ? supplier.createdAt.split('T')[0] : '-'}
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteSupplier(supplier.uuid)}
                          disabled={deletingId === supplier.uuid}
                          sx={{ color: '#d32f2f' }}
                        >
                          {deletingId === supplier.uuid ? (
                            <CircularProgress size={18} />
                          ) : (
                            <DeleteIcon fontSize="small" />
                          )}
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={totalCount}
            page={page}
            onPageChange={(_e, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={e => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            rowsPerPageOptions={[10, 20, 50]}
          />
        </Paper>
      </Container>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </PageContainer>
  );
};

export default Suppliers;
