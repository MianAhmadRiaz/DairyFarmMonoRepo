import React, { useState, useEffect,useRef } from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import {
  Box,
  Button,
  MenuItem,
  Switch,
  FormControlLabel,
  Paper,
  Grid,
  Container,
  Typography,
  IconButton,
  Tooltip,
  Divider,
  CircularProgress,
  Alert,
  Snackbar,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { Add as AddIcon, Save as SaveIcon, Delete as DeleteIcon } from '@mui/icons-material';
import PageContainer from '../../../shared/components/Layout/PageContainer';
import GlobalTextField from '../../../shared/components/GlobalTextField/GlobalTextField';
import Modal from '../../../shared/components/Modal/Modal';
import { fetchStockCategories, addStockCategory, addStockItem, fetchUnits, addUnit, deleteUnit } from '../../../shared/services/stock.services';
import { 
  StockFormValues, 
  SnackbarState, 
  StockCategory, 
  Unit, 
  StockItemPayload, 
  CategoryPayload, 
  UnitPayload 
} from './types';
import { ToastContainer, toast,Id } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { tokens } from '../../../shared/theme/theme';
import { useTranslation } from 'react-i18next';



const initialValues: StockFormValues = {
  name: '',
  description: '',
  categoryId: '',
  unit_of_measure: '',
  reorder_level: '',
  isStockItem: false,
 
};

const StockRegistration: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();

  const validationSchema = Yup.object().shape({
    name: Yup.string().required(t('stock.stockRegistration.validation.nameRequired')),
    description: Yup.string().required(t('stock.stockRegistration.validation.descriptionRequired')),
    categoryId: Yup.string().required(t('stock.stockRegistration.validation.categoryRequired')),
    unit_of_measure: Yup.string().required(t('stock.stockRegistration.validation.unitRequired')),
    reorder_level: Yup.number().required(t('stock.stockRegistration.validation.reorderLevelRequired')).min(0),
    isStockItem: Yup.boolean(),
    openingStockQuantity: Yup.number(),


  });
  const colors = tokens(theme.palette.mode);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isUnitModalOpen, setIsUnitModalOpen] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [newCategoryDescription, setNewCategoryDescription] = useState('');
  const [newUnit, setNewUnit] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCategorySubmitting, setIsCategorySubmitting] = useState(false);
  const [isUnitSubmitting, setIsUnitSubmitting] = useState(false);
  const [categories, setCategories] = useState<StockCategory[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });
  const snackbarTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [categorySnackbar, setCategorySnackbar] = useState({
  open: false,
  message: '',
  severity: 'success' as 'success' | 'error' | 'warning'
});
const [unitSnackbar, setUnitSnackbar] = useState({
  open: false,
  message: '',
  severity: 'success' as 'success' | 'error' | 'warning'
});

    const toastIdRef = useRef<Id | null>(null);
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));


 

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesData, unitsData] = await Promise.all([
          fetchStockCategories(),
          fetchUnits()
        ]);
        setCategories(categoriesData);
        setUnits(unitsData);
      } catch (error) {
        console.error('Error fetching data:', error);
        setSnackbar({
          open: true,
          message: t('stock.stockRegistration.fetchDataError'),
          severity: 'error'
        });
      }
    };
    fetchData();
  }, []);

  
const handleSubmit = async (
  values: StockFormValues,
  { resetForm }: { resetForm: () => void }
) => {
  setIsSubmitting(true);

  try {
    const payload = {
      name: values.name,
      description: values.description,
      categoryId: values.categoryId,
      unit_of_measure: values.unit_of_measure,
      reorder_level: Number(values.reorder_level)
    };

    await addStockItem(payload);
    toast.success(t('stock.stockRegistration.registerSuccess'));
    resetForm();
  } catch (error: any) {
    toast.error(error?.response?.data?.message || t('stock.stockRegistration.registerError'));
  } finally {
    setIsSubmitting(false);
  }
};



const handleAddCategory = async () => {
  if (!newCategory.trim() || !newCategoryDescription.trim()) {
   showCategorySnackbar(t('stock.stockRegistration.fillRequiredFields'), 'warning');
    return;
  }
    setIsCategorySubmitting(true);

  try {
    const newCategoryData = await addStockCategory({
      name: newCategory,
      description: newCategoryDescription
    });

    setCategories([...categories, newCategoryData])

  showCategorySnackbar(t('stock.stockRegistration.categoryAddedSuccess'), 'success');
  setTimeout(() => {
  setIsCategoryModalOpen(false);
  setNewCategory('');
  setNewCategoryDescription('');
}, 500); // Wait 500ms before closing

  } catch (error) {
    console.error('Error adding category:', error);
  showCategorySnackbar(t('stock.stockRegistration.addCategoryError'), 'error');

  }
    finally {
    setIsCategorySubmitting(false); // Stop spinner
  }
};

const showCategorySnackbar = (
  message: string,
  severity: 'success' | 'error' | 'warning'
) => {
  // Don't show if the same message is already visible
  if (categorySnackbar.open && categorySnackbar.message === message) return;

  const show = () => {
    setCategorySnackbar({ open: true, message, severity });

    snackbarTimerRef.current = setTimeout(() => {
      setCategorySnackbar((prev) => ({ ...prev, open: false }));
    }, 3000);
  };

  // If already open, close it first and wait
  if (categorySnackbar.open) {
    setCategorySnackbar((prev) => ({ ...prev, open: false }));
    if (snackbarTimerRef.current) {
      clearTimeout(snackbarTimerRef.current);
    }
    setTimeout(show, 200); // wait to re-open
  } else {
    show(); // open instantly
  }
};



const handleAddUnit = async () => {
  if (!newUnit.trim()) {
    showUnitSnackbar(t('stock.stockRegistration.enterUnitNameWarning'), 'warning');
    return;
  }
    setIsUnitSubmitting(true);

  try {
    await addUnit({ name: newUnit });

    const updatedUnits = await fetchUnits();
    setUnits(updatedUnits);

    showUnitSnackbar(t('stock.stockRegistration.unitAddedSuccess'), 'success');

    setTimeout(() => {
      setIsUnitModalOpen(false);
      setNewUnit('');
    }, 500); // Delay modal close
  } catch (error) {
    console.error('Error adding unit:', error);
    showUnitSnackbar(t('stock.stockRegistration.addUnitError'), 'error');
  }
   finally {
    setIsUnitSubmitting(false); // Stop spinner
  }
};

const showUnitSnackbar = (
  message: string,
  severity: 'success' | 'error' | 'warning'
) => {
  if (unitSnackbar.open && unitSnackbar.message === message) return;

  const show = () => {
    setUnitSnackbar({ open: true, message, severity });

    snackbarTimerRef.current = setTimeout(() => {
      setUnitSnackbar((prev) => ({ ...prev, open: false }));
    }, 3000);
  };

  if (unitSnackbar.open) {
    setUnitSnackbar((prev) => ({ ...prev, open: false }));
    if (snackbarTimerRef.current) clearTimeout(snackbarTimerRef.current);
    setTimeout(show, 200);
  } else {
    show();
  }
};


  
    

const handleDeleteUnit = async (unitId: string) => {
  try {
    await deleteUnit({ unitId });

    setUnits((prevUnits) => prevUnits.filter((unit) => unit.uuid !== unitId));

    showUnitSnackbar(t('stock.stockRegistration.unitDeletedSuccess'), 'success');
  } catch (error: any) {
    console.error('Error deleting unit:', error);
    const message = error?.response?.data?.message || t('stock.stockRegistration.deleteUnitError');
    showUnitSnackbar(message, 'error');
  }
};


  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <PageContainer title={t('stock.stockRegistration.title')} subtitle={t('stock.stockRegistration.subtitle')}>
      <Container maxWidth="lg"  sx={{
    px: isMobile ? '11px' : undefined,
  }}>
        <Paper
          elevation={3}
          sx={{
            p: {xs:2,md:3},
            borderRadius: '12px',
            backgroundColor: theme.palette.background.paper,
            boxShadow: theme.palette.mode === 'dark' ? '0 4px 12px rgba(0,0,0,0.3)' : '0 4px 12px rgba(0,0,0,0.1)',
            position: 'relative'
          }}
        >
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ values, setFieldValue, errors, touched }) => (
              <Form>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        mb: 2, 
                        color: '#000000', 
                        fontWeight: 'bold',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1
                      }}
                    >
                      {t('stock.stockRegistration.basicInformation')}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Field
                      as={GlobalTextField}
                      name="name"
                      label={t('stock.stockRegistration.productName')}
                      error={touched.name && Boolean(errors.name)}
                      helperText={touched.name && errors.name}
                      placeholder={t('stock.stockRegistration.enterProductName')}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Field
                      as={GlobalTextField}
                      name="description"
                      label={t('stock.stockRegistration.description')}
                      error={touched.description && Boolean(errors.description)}
                      helperText={touched.description && errors.description}
                      placeholder={t('stock.stockRegistration.enterProductDescription')}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Field
                        as={GlobalTextField}
                        name="categoryId"
                        label={t('stock.stockRegistration.chooseCategory')}
                        select
                        error={touched.categoryId && Boolean(errors.categoryId)}
                        helperText={touched.categoryId && errors.categoryId}
                        sx={{ 
                          flex: 1,
                          '& .MuiOutlinedInput-root': {
                            height: '44px'
                          },
                          '& .MuiSelect-select': {
                            height: '1.2em',
                            padding: '8px 14px'
                          }
                        }}
                      >
                        <MenuItem value="" sx={{ minHeight: '32px' }}>{t('stock.common.selectCategory')}</MenuItem>
                        {categories.map((category) => (
                          <MenuItem key={category.uuid} value={category.uuid} sx={{ minHeight: '32px' }}>
                            {category.name}
                          </MenuItem>
                        ))}
                      </Field>
                      <Tooltip title={t('stock.stockRegistration.addNewCategory')}>
                        <IconButton
                          onClick={() => setIsCategoryModalOpen(true)}
                          sx={{
                            backgroundColor: '#005f73',
                            color: 'white',
                            '&:hover': {
                              backgroundColor: '#white',
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
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Field
                        as={GlobalTextField}
                        name="unit_of_measure"
                        label={t('stock.stockRegistration.chooseUnit')}
                        select
                        error={touched.unit_of_measure && Boolean(errors.unit_of_measure)}
                        helperText={touched.unit_of_measure && errors.unit_of_measure}
                        sx={{ 
                          flex: 1,
                          '& .MuiOutlinedInput-root': {
                            height: '44px'
                          },
                          '& .MuiSelect-select': {
                            height: '1.2em',
                            padding: '8px 14px'
                          }
                        }}
                      >
                        <MenuItem value="" sx={{ minHeight: '32px' }}>{t('stock.stockRegistration.selectUnit')}</MenuItem>
                        {units?.map((unit) => (
                          <MenuItem key={unit.uuid} value={unit?.uuid} sx={{ minHeight: '32px' }}>
                            {unit?.name}
                          </MenuItem>
                        ))}
                      </Field>
                      <Tooltip title={t('stock.stockRegistration.addNewUnit')}>
                        <IconButton
                          onClick={() => setIsUnitModalOpen(true)}
                          sx={{
                            backgroundColor: '#005f73',
                            color: 'white',
                            '&:hover': {
                              backgroundColor: '#white',
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
                      as={GlobalTextField}
                      name="reorder_level"
                      label={t('stock.stockRegistration.reorderLevel')}
                      type="number"
                      error={touched.reorder_level && Boolean(errors.reorder_level)}
                      helperText={touched.reorder_level && errors.reorder_level}
                      placeholder={t('stock.stockRegistration.enterReorderLevel')}
                    />
                  </Grid>

                

                  <Grid item xs={12}>
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'flex-end', 
                      mt: 3,
                      gap: 2
                    }}>
                    
                      <Button
                      type="submit"
                      color="primary"
                      variant="contained"
                      disabled={isSubmitting}
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
                      fontSize: '1.1rem',
                      fontWeight: 'bold',
                      borderRadius: '8px',
                      backgroundColor: '#005f73',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                      '&:hover': {
                      boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
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
      </Container>

    
  <Modal
  open={isCategoryModalOpen}
  onClose={() => setIsCategoryModalOpen(false)}
  title={t('stock.stockRegistration.addNewCategory')}
  onSubmit={handleAddCategory}

  
>
  <Box sx={{ position: 'relative' }}>

    {categorySnackbar.open && (
      <Box
        sx={{
          position: 'absolute',
          top: -29,
          right: -30,
          zIndex: 1000,
          m: 2, // optional margin from edges
          minWidth: 280, // optional fixed width
        }}
      >
        <Alert
          severity={categorySnackbar.severity}
          onClose={() => setCategorySnackbar({ ...categorySnackbar, open: false })}
          sx={{
            backgroundColor: '#ffffff',
            color: '#000000',
            boxShadow: '0px 4px 10px rgba(0,0,0,0.1)',
            // border: '1px solid #ccc',
            border: '1px solid rgba(0, 0, 0, 0.3)',
            fontWeight: '500',
          }}
        >
          {categorySnackbar.message}
        </Alert>
      </Box>
    )}

    {/* Form content */}
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <GlobalTextField
          name="newCategory"
          label={t('stock.stockRegistration.categoryName')}
          value={newCategory}
          onChange={e => setNewCategory(e.target.value)}
          fullWidth
          placeholder={t('stock.stockRegistration.enterCategoryName')}
        />
      </Grid>
      <Grid item xs={12}>
        <GlobalTextField
          name="newCategoryDescription"
          label={t('stock.stockRegistration.categoryDescription')}
          value={newCategoryDescription}
          onChange={e => setNewCategoryDescription(e.target.value)}
          fullWidth
          placeholder={t('stock.stockRegistration.enterCategoryDescription')}
          multiline
          rows={3}
        />
      </Grid>
    </Grid>
  </Box>
</Modal>



    
<Modal
  open={isUnitModalOpen}
  onClose={() => setIsUnitModalOpen(false)}
  title={t('stock.stockRegistration.addNewUnit')}
  onSubmit={handleAddUnit}

>
 
  <Box sx={{ position: 'relative' }}>
    {unitSnackbar.open && (
      <Box
        sx={{
          position: 'absolute',
          top: -26,
          right: -30,
          zIndex: 1000,
          m: 2,
          minWidth: 280
        }}
      >
        <Alert
          severity={unitSnackbar.severity}
          onClose={() =>
            setUnitSnackbar((prev) => ({ ...prev, open: false }))
          }
          sx={{
            backgroundColor: '#ffffff',
            color: '#000000',
            boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
            // border: '1px solid #ccc',
            border: '1px solid rgba(0, 0, 0, 0.3)',

            fontWeight: '500'
          }}
        >
          {unitSnackbar.message}
        </Alert>
      </Box>
    )}

 
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <GlobalTextField
          name="newUnit"
          label={t('stock.stockRegistration.unitName')}
          value={newUnit}
          onChange={(e) => setNewUnit(e.target.value)}
          fullWidth
          placeholder={t('stock.stockRegistration.enterUnitName')}
        />
      </Grid>
      <Grid item xs={12}>
        <Typography variant="subtitle1" sx={{ mb: 2 }}>
          {t('stock.stockRegistration.existingUnits')}
        </Typography>
        <List>
          {units.map((unit) => (
            <ListItem key={unit.uuid}>
              <ListItemText primary={unit.name} />
              <ListItemSecondaryAction>
                <IconButton
                  edge="end"
                  onClick={() => handleDeleteUnit(unit.uuid)}
                  sx={{ color: '#d32f2f' }}
                >
                  <DeleteIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      </Grid>
    </Grid>
  </Box>
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
  // theme="colored"
/>

    </PageContainer>
  );
};

export default StockRegistration;
