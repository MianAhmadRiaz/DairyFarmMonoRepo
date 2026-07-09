import React, { useState, useEffect, useCallback } from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import {
  Box,
  Button,
  MenuItem,
  Paper,
  Grid,
  Container,
  Typography,
  IconButton,
  Tooltip,
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
import { Add as AddIcon, Save as SaveIcon, Delete as DeleteIcon } from '@mui/icons-material';
import Modal from '../../../shared/components/Modal/Modal';
import {
  getSuppliers,
  addSupplier,
  getAllStockItems,
  getPurchaseItems,
  addPurchaseItem,
  deletePurchaseItem,
  Supplier,
  StockItemRow,
  PurchaseItem
} from '../../../shared/services/stockModule.services';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import PageContainer from '../../../shared/components/Layout/PageContainer';
import { usePermissions } from '../../../shared/rbac/usePermissions';
import { PERMISSIONS } from '../../../shared/rbac/permissions';
import { useTranslation } from 'react-i18next';

interface PurchaseFormValues {
  supplierId: string;
  itemId: string;
  quantity: string;
  cost_per_unit: string;
  date: string;
  batch_number: string;
  expiry_date: string;
  note: string;
}

const today = () => new Date().toISOString().split('T')[0];

const initialValues: PurchaseFormValues = {
  supplierId: '',
  itemId: '',
  quantity: '',
  cost_per_unit: '',
  date: today(),
  batch_number: '',
  expiry_date: '',
  note: ''
};

const Purchases: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();

  const validationSchema = Yup.object().shape({
    supplierId: Yup.string().required(t('stock.purchases.validation.supplierRequired')),
    itemId: Yup.string().required(t('stock.purchases.validation.itemRequired')),
    quantity: Yup.number()
      .typeError(t('stock.purchases.validation.quantityNumber'))
      .moreThan(0, t('stock.purchases.validation.quantityPositive'))
      .required(t('stock.purchases.validation.quantityRequired')),
    cost_per_unit: Yup.number()
      .typeError(t('stock.purchases.validation.costNumber'))
      .min(0, t('stock.purchases.validation.costMin'))
      .required(t('stock.purchases.validation.costRequired')),
    date: Yup.string().required(t('stock.purchases.validation.dateRequired'))
  });
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { can } = usePermissions();
  const canPurchase = can(PERMISSIONS.STOCK_PURCHASE);

  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [stockItems, setStockItems] = useState<StockItemRow[]>([]);
  const [purchases, setPurchases] = useState<PurchaseItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loadingTable, setLoadingTable] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
  const [newSupplier, setNewSupplier] = useState({ name: '', contact: '', address: '' });
  const [isSupplierSubmitting, setIsSupplierSubmitting] = useState(false);

  const loadPurchases = useCallback(async () => {
    try {
      setLoadingTable(true);
      const data = await getPurchaseItems({ page: page + 1, limit: rowsPerPage });
      setPurchases(data.items || []);
      setTotalCount(data.totalCount || 0);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || t('stock.purchases.fetchError'));
    } finally {
      setLoadingTable(false);
    }
  }, [page, rowsPerPage]);

  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        const [suppliersData, itemsData] = await Promise.all([
          getSuppliers({ page: 1, limit: 200 }),
          getAllStockItems()
        ]);
        setSuppliers(suppliersData.suppliers || []);
        setStockItems(itemsData);
      } catch (error: any) {
        toast.error(error?.response?.data?.message || t('stock.purchases.fetchDropdownsError'));
      }
    };
    fetchDropdowns();
  }, []);

  useEffect(() => {
    loadPurchases();
  }, [loadPurchases]);

  const handleSubmit = async (
    values: PurchaseFormValues,
    { resetForm }: { resetForm: () => void }
  ) => {
    setIsSubmitting(true);
    try {
      await addPurchaseItem({
        supplierId: values.supplierId,
        itemId: values.itemId,
        quantity: Number(values.quantity),
        cost_per_unit: Number(values.cost_per_unit),
        date: values.date || undefined,
        note: values.note || undefined,
        batch_number: values.batch_number || undefined,
        expiry_date: values.expiry_date || undefined
      });
      toast.success(t('stock.purchases.recordSuccess'));
      resetForm();
      loadPurchases();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || t('stock.purchases.recordError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddSupplier = async () => {
    if (!newSupplier.name.trim()) {
      toast.warning(t('stock.common.supplierNameWarning'));
      return;
    }
    setIsSupplierSubmitting(true);
    try {
      const created = await addSupplier({
        name: newSupplier.name.trim(),
        contact: newSupplier.contact || undefined,
        address: newSupplier.address || undefined
      });
      setSuppliers(prev => [created, ...prev]);
      toast.success(t('stock.common.supplierAddedSuccess'));
      setIsSupplierModalOpen(false);
      setNewSupplier({ name: '', contact: '', address: '' });
    } catch (error: any) {
      toast.error(error?.response?.data?.message || t('stock.common.addSupplierError'));
    } finally {
      setIsSupplierSubmitting(false);
    }
  };

  const handleDeletePurchase = async (purchaseId: string) => {
    setDeletingId(purchaseId);
    try {
      await deletePurchaseItem(purchaseId);
      toast.success(t('stock.purchases.deleteSuccess'));
      loadPurchases();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || t('stock.purchases.deleteError'));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <PageContainer title={t('stock.purchases.title')} subtitle={t('stock.purchases.subtitle')}>
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
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ errors, touched }) => (
              <Form>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Typography variant="h6" sx={{ mb: 1, fontWeight: 'bold' }}>
                      {t('stock.purchases.newPurchase')}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Field
                        as={TextField}
                        name="supplierId"
                        label={t('stock.common.supplier')}
                        select
                        fullWidth
                        size="small"
                        error={touched.supplierId && Boolean(errors.supplierId)}
                        helperText={touched.supplierId && errors.supplierId}
                        sx={{ flex: 1 }}
                      >
                        <MenuItem value="">{t('stock.purchases.selectSupplier')}</MenuItem>
                        {suppliers.map(supplier => (
                          <MenuItem key={supplier.uuid} value={supplier.uuid}>
                            {supplier.name}
                          </MenuItem>
                        ))}
                      </Field>
                      <Tooltip title={t('stock.common.addNewSupplier')}>
                        <IconButton
                          onClick={() => setIsSupplierModalOpen(true)}
                          sx={{
                            backgroundColor: '#005f73',
                            color: 'white',
                            '&:hover': {
                              backgroundColor: '#ffffff',
                              color: '#005f73',
                              border: '1px solid #005f73'
                            }
                          }}
                        >
                          <AddIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Field
                      as={TextField}
                      name="itemId"
                      label={t('stock.purchases.stockItem')}
                      select
                      fullWidth
                      size="small"
                      error={touched.itemId && Boolean(errors.itemId)}
                      helperText={touched.itemId && errors.itemId}
                    >
                      <MenuItem value="">{t('stock.purchases.selectItem')}</MenuItem>
                      {stockItems.map(item => (
                        <MenuItem key={item.uuid} value={item.uuid}>
                          {item.name}
                        </MenuItem>
                      ))}
                    </Field>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Field
                      as={TextField}
                      name="quantity"
                      label={t('stock.common.quantity')}
                      type="number"
                      fullWidth
                      size="small"
                      error={touched.quantity && Boolean(errors.quantity)}
                      helperText={touched.quantity && errors.quantity}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Field
                      as={TextField}
                      name="cost_per_unit"
                      label={t('stock.purchases.costPerUnit')}
                      type="number"
                      fullWidth
                      size="small"
                      error={touched.cost_per_unit && Boolean(errors.cost_per_unit)}
                      helperText={touched.cost_per_unit && errors.cost_per_unit}
                    />
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <Field
                      as={TextField}
                      name="date"
                      label={t('stock.purchases.purchaseDate')}
                      type="date"
                      fullWidth
                      size="small"
                      InputLabelProps={{ shrink: true }}
                      error={touched.date && Boolean(errors.date)}
                      helperText={touched.date && errors.date}
                    />
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <Field
                      as={TextField}
                      name="batch_number"
                      label={t('stock.purchases.batchNumberOptional')}
                      fullWidth
                      size="small"
                    />
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <Field
                      as={TextField}
                      name="expiry_date"
                      label={t('stock.purchases.expiryDateOptional')}
                      type="date"
                      fullWidth
                      size="small"
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Field
                      as={TextField}
                      name="note"
                      label={t('stock.purchases.noteOptional')}
                      fullWidth
                      size="small"
                      multiline
                      rows={2}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <Button
                        type="submit"
                        variant="contained"
                        disabled={isSubmitting || !canPurchase}
                        title={canPurchase ? '' : t('stock.common.noPermission')}
                        size="large"
                        startIcon={
                          isSubmitting ? (
                            <CircularProgress size={24} sx={{ color: '#0F7C8F' }} />
                          ) : (
                            <SaveIcon />
                          )
                        }
                        sx={{
                          width: '140px',
                          height: '40px',
                          fontWeight: 'bold',
                          borderRadius: '8px',
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
                        {!isSubmitting && t('common.save')}
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </Form>
            )}
          </Formik>
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
              {t('stock.purchases.history')}
            </Typography>
            {loadingTable && <CircularProgress size={18} />}
          </Box>
          <TableContainer>
            <Table size={isMobile ? 'small' : 'medium'}>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f8f9fA' }}>
                  <TableCell sx={{ fontWeight: 'bold' }}>{t('stock.common.date')}</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>{t('stock.common.item')}</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>{t('stock.common.supplier')}</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }} align="right">
                    {t('stock.purchases.columns.qty')}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }} align="right">
                    {t('stock.purchases.columns.costPerUnit')}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }} align="right">
                    {t('stock.common.total')}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>{t('stock.purchases.columns.batch')}</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>{t('stock.purchases.columns.expiry')}</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }} align="center">
                    {t('stock.common.actions')}
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {purchases.length === 0 && !loadingTable ? (
                  <TableRow>
                    <TableCell colSpan={9} align="center">
                      {t('stock.purchases.noPurchases')}
                    </TableCell>
                  </TableRow>
                ) : (
                  purchases.map(purchase => (
                    <TableRow key={purchase.uuid} sx={{ '&:hover': { backgroundColor: '#f8f9fa' } }}>
                      <TableCell>{purchase.date}</TableCell>
                      <TableCell>{purchase.item_name || '-'}</TableCell>
                      <TableCell>{purchase.supplier_name || '-'}</TableCell>
                      <TableCell align="right">{Number(purchase.quantity)}</TableCell>
                      <TableCell align="right">{Number(purchase.cost_per_unit)}</TableCell>
                      <TableCell align="right">{Number(purchase.total_cost)}</TableCell>
                      <TableCell>{purchase.batch_number || '-'}</TableCell>
                      <TableCell>{purchase.expiry_date || '-'}</TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          onClick={() => handleDeletePurchase(purchase.uuid)}
                          disabled={deletingId === purchase.uuid}
                          sx={{ color: '#d32f2f' }}
                        >
                          {deletingId === purchase.uuid ? (
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

      <Modal
        open={isSupplierModalOpen}
        onClose={() => setIsSupplierModalOpen(false)}
        title={t('stock.common.addNewSupplier')}
        onSubmit={handleAddSupplier}
        submitText={isSupplierSubmitting ? t('stock.common.saving') : t('common.submit')}
      >
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              label={t('stock.common.supplierName')}
              value={newSupplier.name}
              onChange={e => setNewSupplier(prev => ({ ...prev, name: e.target.value }))}
              fullWidth
              size="small"
              placeholder={t('stock.common.enterSupplierName')}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label={t('stock.common.contact')}
              value={newSupplier.contact}
              onChange={e => setNewSupplier(prev => ({ ...prev, contact: e.target.value }))}
              fullWidth
              size="small"
              placeholder={t('stock.common.enterContactNumber')}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label={t('stock.common.address')}
              value={newSupplier.address}
              onChange={e => setNewSupplier(prev => ({ ...prev, address: e.target.value }))}
              fullWidth
              size="small"
              placeholder={t('stock.common.enterAddress')}
              multiline
              rows={2}
            />
          </Grid>
        </Grid>
      </Modal>

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

export default Purchases;
