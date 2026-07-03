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

const validationSchema = Yup.object().shape({
  supplierId: Yup.string().required('Supplier is required'),
  itemId: Yup.string().required('Item is required'),
  quantity: Yup.number()
    .typeError('Quantity must be a number')
    .moreThan(0, 'Quantity must be greater than 0')
    .required('Quantity is required'),
  cost_per_unit: Yup.number()
    .typeError('Cost must be a number')
    .min(0, 'Cost must be 0 or more')
    .required('Cost per unit is required'),
  date: Yup.string().required('Date is required')
});

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
  const theme = useTheme();
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
      toast.error(error?.response?.data?.message || 'Failed to fetch purchases.');
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
        toast.error(error?.response?.data?.message || 'Failed to fetch suppliers/items.');
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
      toast.success('Purchase recorded successfully!');
      resetForm();
      loadPurchases();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to record purchase.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddSupplier = async () => {
    if (!newSupplier.name.trim()) {
      toast.warning('Please enter a supplier name.');
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
      toast.success('Supplier added successfully!');
      setIsSupplierModalOpen(false);
      setNewSupplier({ name: '', contact: '', address: '' });
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to add supplier.');
    } finally {
      setIsSupplierSubmitting(false);
    }
  };

  const handleDeletePurchase = async (purchaseId: string) => {
    setDeletingId(purchaseId);
    try {
      await deletePurchaseItem(purchaseId);
      toast.success('Purchase deleted successfully!');
      loadPurchases();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to delete purchase.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <PageContainer title="Stock Purchases" subtitle="Record purchases and review purchase history">
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
                      New Purchase
                    </Typography>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Field
                        as={TextField}
                        name="supplierId"
                        label="Supplier"
                        select
                        fullWidth
                        size="small"
                        error={touched.supplierId && Boolean(errors.supplierId)}
                        helperText={touched.supplierId && errors.supplierId}
                        sx={{ flex: 1 }}
                      >
                        <MenuItem value="">Select Supplier</MenuItem>
                        {suppliers.map(supplier => (
                          <MenuItem key={supplier.uuid} value={supplier.uuid}>
                            {supplier.name}
                          </MenuItem>
                        ))}
                      </Field>
                      <Tooltip title="Add New Supplier">
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
                      label="Stock Item"
                      select
                      fullWidth
                      size="small"
                      error={touched.itemId && Boolean(errors.itemId)}
                      helperText={touched.itemId && errors.itemId}
                    >
                      <MenuItem value="">Select Item</MenuItem>
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
                      label="Quantity"
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
                      label="Cost Per Unit"
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
                      label="Purchase Date"
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
                      label="Batch Number (optional)"
                      fullWidth
                      size="small"
                    />
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <Field
                      as={TextField}
                      name="expiry_date"
                      label="Expiry Date (optional)"
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
                      label="Note (optional)"
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
                        title={canPurchase ? '' : 'No permission'}
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
                        {!isSubmitting && 'Save'}
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
              Purchase History
            </Typography>
            {loadingTable && <CircularProgress size={18} />}
          </Box>
          <TableContainer>
            <Table size={isMobile ? 'small' : 'medium'}>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f8f9fA' }}>
                  <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Item</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Supplier</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }} align="right">
                    Qty
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }} align="right">
                    Cost/Unit
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }} align="right">
                    Total
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Batch</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Expiry</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }} align="center">
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {purchases.length === 0 && !loadingTable ? (
                  <TableRow>
                    <TableCell colSpan={9} align="center">
                      No purchases recorded yet.
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
        title="Add New Supplier"
        onSubmit={handleAddSupplier}
        submitText={isSupplierSubmitting ? 'Saving...' : 'Submit'}
      >
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              label="Supplier Name"
              value={newSupplier.name}
              onChange={e => setNewSupplier(prev => ({ ...prev, name: e.target.value }))}
              fullWidth
              size="small"
              placeholder="Enter supplier name"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Contact"
              value={newSupplier.contact}
              onChange={e => setNewSupplier(prev => ({ ...prev, contact: e.target.value }))}
              fullWidth
              size="small"
              placeholder="Enter contact number"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Address"
              value={newSupplier.address}
              onChange={e => setNewSupplier(prev => ({ ...prev, address: e.target.value }))}
              fullWidth
              size="small"
              placeholder="Enter address"
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
