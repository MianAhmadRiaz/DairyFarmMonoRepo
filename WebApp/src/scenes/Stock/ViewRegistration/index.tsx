import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  TextField,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  Stack,
  Button,
  InputAdornment,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  FormControlLabel,
  Switch,
  Typography,
  Divider,
  Popover,
  FormControl,
  InputLabel,
  Checkbox,
  ListItemText,
  Snackbar,
  Alert,
  Pagination,
  CircularProgress,
  useMediaQuery,
  useTheme
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  RestartAlt as ResetIcon,
  FilterList as FilterIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import PageContainer from '../../../shared/components/Layout/PageContainer';
import GlobalTextField from '../../../shared/components/GlobalTextField/GlobalTextField';
import { fetchStockItems, deleteStockItem, updateStockItem, fetchStockCategories } from '../../../shared/services/stock.services';
import {
  FilterCategory,
  StockItemResponse,
  PaginatedResponse,
  FilterState,
  SnackbarState,
  UpdateStockItemPayload
} from './types';
import { StockCategory } from '../StockRegistration/types';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useTranslation } from 'react-i18next';


const ViewRegistration: React.FC = () => {
  const { t } = useTranslation();
  const [stockItems, setStockItems] = useState<StockItemResponse[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<StockItemResponse | null>(null);
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedFilters, setSelectedFilters] = useState<FilterState>({
    type: [],
    unit: [],
    stockItem: [],
    stockAsset: []
  });
  const [activeFilters, setActiveFilters] = useState<FilterState>({
    type: [],
    unit: [],
    stockItem: [],
    stockAsset: []
  });
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: '',
    severity: 'success'
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<StockItemResponse | null>(null);
  const [categories, setCategories] = useState<StockCategory[]>([]);
  // console.log('🚀 ~ categories:', categories)
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
   const [totalCount, setTotalCount] = useState(0);

   
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetchStockItems(page + 1, rowsPerPage);
        const data = response.data as PaginatedResponse;

        const filteredData = data.items.filter(item => {
          const matchesSearch = 
            item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.unit_of_measure.toLowerCase().includes(searchQuery.toLowerCase());
          
          const matchesType = activeFilters.type.length === 0 || 
            activeFilters.type.includes(item.category_name);
          const matchesUnit = activeFilters.unit.length === 0 || 
            activeFilters.unit.includes(item.unit_of_measure);
          
          return matchesSearch && matchesType && matchesUnit;
        });

        setStockItems(filteredData);
        setTotalCount(data.totalCount); 
      } catch (err) {
       console.log("Failed to fetch data")
        // toast.error('Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [page, rowsPerPage, searchQuery, activeFilters]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const categoriesData = await fetchStockCategories(); 
        setCategories(categoriesData);
      } catch (error) {
        console.log("Failed to fetch data")
      }
    };
  
    fetchData();
  }, []);
  

  const handleEdit = (item: StockItemResponse) => {
    setSelectedItem(item);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedItem(null);
  };

  const handleSaveEdit = async () => {
    if (!selectedItem) return;

    try {
      const payload = {
        name: selectedItem.name,
        itemId: selectedItem.uuid,
        unitId: selectedItem.unitId,
        price: selectedItem.currentStockRate || 0,
        categoryId: selectedItem.categoryId,
        reorder_level: selectedItem.reorder_level,
      };

      await updateStockItem(payload);
      
      const response = await fetchStockItems(page + 1, rowsPerPage);
      const data = response.data as PaginatedResponse;
      setStockItems(data.items);

      toast.success(t('stock.viewRegistration.updateSuccess'));
      handleCloseEditModal();
    } catch (err: any) {
      console.error('Error updating stock item:', err);
      toast.error(err.response?.data?.message || t('stock.viewRegistration.updateError'))
    }
  };

  const handleDeleteClick = (item: StockItemResponse) => {
    setItemToDelete(item);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;

    try {
      await deleteStockItem(itemToDelete.uuid);
      setStockItems(prevItems => prevItems.filter(item => item.uuid !== itemToDelete.uuid));
  
      toast.success(t('stock.viewRegistration.deleteSuccess'));
    } catch (err) {
   
      toast.error(t('stock.viewRegistration.deleteError'))
    } finally {
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setItemToDelete(null);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };


  const handleFilterClick = (event: React.MouseEvent<HTMLElement>) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setFilterAnchorEl(null);
  };

 

  const handleFilterApply = () => {
    setActiveFilters(selectedFilters);
    handleFilterClose();
  };

  const handleRemoveFilter = (category: keyof typeof activeFilters, value: string) => {
    setActiveFilters(prev => ({
      ...prev,
      [category]: prev[category].filter(item => item !== value)
    }));
    setSelectedFilters(prev => ({
      ...prev,
      [category]: prev[category].filter(item => item !== value)
    }));
  };

  const handleClearAllFilters = () => {
    setActiveFilters({
      type: [],
      unit: [],
      stockItem: [],
      stockAsset: []
    });
    setSelectedFilters({
      type: [],
      unit: [],
      stockItem: [],
      stockAsset: []
    });
  };

  const FilterPopover = () => (
    <Popover
      open={Boolean(filterAnchorEl)}
      anchorEl={filterAnchorEl}
      onClose={handleFilterClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'left',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'left',
      }}
      PaperProps={{
        sx: {
          p: 2,
          width: {xs:290,md:350},
          borderRadius: 2,
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          border: '1px solid rgba(0,0,0,0.05)',
          maxHeight: '80vh',
          overflowY: 'auto'
        }
      }}
    >
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 2,
        pb: 1,
        borderBottom: '1px solid rgba(0,0,0,0.05)'
      }}>
        <Typography variant="subtitle1" sx={{ 
          fontWeight: 600,
          color: '#005f73'
        }}>
          {t('stock.viewRegistration.filterOptions')}
        </Typography>
        <IconButton 
          size="small" 
          onClick={handleFilterClose}
          sx={{
            color: '#666',
            '&:hover': {
              backgroundColor: 'rgba(0,0,0,0.05)'
            }
          }}
        >
          <CloseIcon />
        </IconButton>
      </Box>

      <Stack spacing={2}>
        <Box>
          <Typography variant="body2" sx={{ 
            mb: 1,
            color: '#333',
            fontWeight: 500
          }}>
            {t('stock.common.category')}
          </Typography>
          <FormControl fullWidth size="small">
            <Select
              multiple
              value={selectedFilters.type}
              onChange={(e) => setSelectedFilters(prev => ({ ...prev, type: e.target.value as string[] }))}
              renderValue={(selected) => (selected as string[]).join(', ')}
              sx={{
                '& .MuiSelect-select': {
                  py: 1,
                  px: 1.5,
                  borderRadius: 1
                }
              }}
            >
              {stockItems?.map((item) => (
                <MenuItem key={item.uuid} value={item.category_name} sx={{ py: 0.5 }}>
                  <Checkbox 
                    checked={selectedFilters.type.includes(item.category_name)}
                    size="small"
                    sx={{
                      color: '#1a237e',
                      '&.Mui-checked': {
                        color: '#1a237e',
                      },
                    }}
                  />
                  <ListItemText 
                    primary={item.category_name}
                    primaryTypographyProps={{
                      sx: { fontSize: '0.875rem' }
                    }}
                  />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <Box>
          <Typography variant="body2" sx={{ 
            mb: 1,
            color: '#333',
            fontWeight: 500
          }}>
            {t('stock.viewRegistration.unitOfMeasure')}
          </Typography>
          <FormControl fullWidth size="small">
            <Select
              multiple
              value={selectedFilters.unit}
              onChange={(e) => setSelectedFilters(prev => ({ ...prev, unit: e.target.value as string[] }))}
              renderValue={(selected) => (selected as string[]).join(', ')}
              sx={{
                '& .MuiSelect-select': {
                  py: 1,
                  px: 1.5,
                  borderRadius: 1
                }
              }}
            >
              {[...new Set(stockItems?.map(item => item.unit_of_measure))].map((unit) => (
                <MenuItem key={unit} value={unit} sx={{ py: 0.5 }}>
                  <Checkbox 
                    checked={selectedFilters.unit.includes(unit)}
                    size="small"
                    sx={{
                      color: '#1a237e',
                      '&.Mui-checked': {
                        color: '#1a237e',
                      },
                    }}
                  />
                  <ListItemText 
                    primary={unit}
                    primaryTypographyProps={{
                      sx: { fontSize: '0.875rem' }
                    }}
                  />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

      

        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'flex-end', 
          gap: 1,
          pt: 1,
          borderTop: '1px solid rgba(0,0,0,0.05)'
        }}>
          <Button
            variant="outlined"
            size="small"
            onClick={() => setSelectedFilters({
              type: [],
              unit: [],
              stockItem: [],
              stockAsset: []
            })}
            sx={{
              color: '#666',
              borderColor: '#ddd',
              '&:hover': {
                borderColor: '#999',
                backgroundColor: 'rgba(0,0,0,0.02)'
              }
            }}
          >
            {t('stock.viewRegistration.clearAll')}
          </Button>
          <Button
            variant="contained"
            size="small"
            onClick={handleFilterApply}
            sx={{
              backgroundColor: '#005f73',
              color: '#ffffff',
              border: '1px solid #005f73',
              '&:hover': {
                backgroundColor: '#ffffff',
                color: '#005f73',
                border: '1px solid #005f73'
              }
             }}
          >
            {t('stock.viewRegistration.applyFilters')}
          </Button>
        </Box>
      </Stack>
    </Popover>
  );

  // const TablePaginationComponent = () => (
  //   <TablePagination
  //     rowsPerPageOptions={[]}
  //     component="div"
  //     count={stockItems.length}
  //     rowsPerPage={rowsPerPage}
  //     page={page}
  //     onPageChange={handleChangePage}
  //     onRowsPerPageChange={handleChangeRowsPerPage}
  //     labelDisplayedRows={() => ''} 
  //     sx={{
  //       '& .MuiTablePagination-toolbar': {
  //         flexWrap: 'wrap',
  //         justifyContent: { xs: 'center', sm: 'flex-end' },
  //         padding: { xs: '8px', sm: '0' }
  //       },
  //       '& .MuiTablePagination-spacer': {
  //         display: { xs: 'none', sm: 'block' }
  //       }
  //     }}
  //   />
  // );

 const PaginationComponent: React.FC<{
  totalItems: number;
  rowsPerPage: number;
  currentPage: number;
  onPageChange: (page: number) => void;
}> = ({ totalItems, rowsPerPage, currentPage, onPageChange }) => {
  const totalPages = Math.ceil(totalItems / rowsPerPage);

  if (totalPages === 0) return null;

  const handleChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    onPageChange(value - 1); 
  };

  return (
    <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end',pb:2 }}>
      <Pagination
        count={totalPages}
        page={currentPage + 1} 
        onChange={handleChange}
        color="primary"
        
      />
    </Box>
  );
};


  return (
    <PageContainer title={t('stock.viewRegistration.title')} subtitle={t('stock.viewRegistration.subtitle')}>
  <Container maxWidth="lg"  sx={{
    px: isMobile ? '11px' : undefined,
  }}>
    <Paper
      elevation={3}
      sx={{
        borderRadius: '12px',
        backgroundColor: 'white',
        overflow: 'hidden'
      }}
    >
      <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
        <Stack spacing={2}>
          <Stack 
            direction={{ xs: 'column', sm: 'row' }} 
            spacing={2} 
            alignItems={{ xs: 'stretch', sm: 'center' }}
          >
            <TextField
              placeholder="Search stock items..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              size="small"
              sx={{ 
                width: { xs: '100%', sm: '60%' },
                order: { xs: 0, sm: 0 }
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                )
              }}
            />

            


            <Stack direction="row" spacing={2} sx={{ ml: 'auto' }}>
            <Button
              startIcon={<FilterIcon sx={{ display: { xs: 'none', sm: 'flex' } }} />}
              variant="outlined"
              size="small"
              color="primary"
              onClick={handleFilterClick}
              sx={{ width: { xs: '48%', sm: 'auto' } }}
            >
              Filters
            </Button>
            <Button
              startIcon={<ResetIcon sx={{ display: { xs: 'none', sm: 'flex' } }} />}
              onClick={handleClearAllFilters}
              variant="outlined"
              size="small"
              color="inherit"
              sx={{ width: { xs: '48%', sm: 'auto' } }}
            >
              Reset All
            </Button>
          </Stack>
          </Stack>

          <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
            {Object.entries(activeFilters).map(([category, values]) => 
              values.map(value => (
                <Chip
                  key={`${category}-${value}`}
                  label={`${category}: ${value}`}
                  onDelete={() => handleRemoveFilter(category as keyof typeof activeFilters, value)}
                  sx={{
                    backgroundColor: '#e3f2fd',
                    color: '#1976d2',
                    '& .MuiChip-deleteIcon': {
                      color: '#005f73',
                      '&:hover': {
                        color: '#005f73'
                      }
                    }
                  }}
                />
              ))
            )}
          </Stack>
        </Stack>
      </Box>
      <FilterPopover />

      <Box sx={{ overflowX: 'auto' }}>
        <TableContainer>
          <Table sx={{ minWidth: 600 }}>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f8f9fA' }}>
                <TableCell sx={{ fontWeight: 'bold', minWidth: 50 }}>#</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 'bold', display: { xs: 'none', sm: 'table-cell' } }}>
                  Category
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold', display: { xs: 'none', md: 'table-cell' } }}>
                  Unit
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Rate</TableCell>
                <TableCell sx={{ fontWeight: 'bold', display: { xs: 'none', sm: 'table-cell' } }}>
                  Reorder
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <CircularProgress size={isMobile ? 30 : 50} 
 sx={{color:"#0F7C8F"}}/>
                  </TableCell>
                </TableRow>
              ) : (stockItems.map((item, index) => (
                <TableRow
                  key={item.uuid}
                  sx={{ '&:hover': { backgroundColor: '#f8f9fa' } }}
                >
                  <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                  <TableCell>{item.name}</TableCell>
                  <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                    {item.category_name}
                  </TableCell>
                  <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                    {item.unit_of_measure}
                  </TableCell>
                  <TableCell>{item.stockLevel?.price.toFixed(2)
 || 0}</TableCell>
                  <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                    {item.reorder_level || 0}
                  </TableCell>
                  <TableCell>
                    <Stack direction="row">
                      <IconButton
                        size="small"
                        onClick={() => handleEdit(item)}
                        sx={{ color: '#1976d2' }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteClick(item)}
                        sx={{ color: '#d32f2f' }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  </TableCell>
                </TableRow>
             )))}
            </TableBody>
          </Table>
        </TableContainer>
        {/* <TablePaginationComponent /> */}
       <PaginationComponent
  // totalItems={stockItems.length} // or total count from backend
    totalItems={totalCount}
  rowsPerPage={rowsPerPage}
  currentPage={page}
  onPageChange={setPage}
/>

      </Box>

      
    </Paper>


        <Dialog 
          open={isEditModalOpen} 
          onClose={handleCloseEditModal}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle sx={{ borderBottom: '1px solid #e0e0e0', pb: 2 }}>
            Edit Stock Item
          </DialogTitle>
          <DialogContent sx={{ pt: 3 }}>
            {selectedItem && (
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="subtitle1" fontWeight="bold" color="primary">
                    Basic Information
                  </Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <GlobalTextField
                    name="name"
                    label={t('stock.viewRegistration.productName')}
                    value={selectedItem.name}
                    onChange={(e) => setSelectedItem({ ...selectedItem, name: e.target.value })}
                    fullWidth
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <GlobalTextField
                    select
                    name="categoryId"
                    label="Category"
                    value={selectedItem.categoryId}
                    onChange={(e) => setSelectedItem({ ...selectedItem, categoryId: e.target.value })}
                    fullWidth
                  >
                    {categories.map((item) => (
                      <MenuItem key={item.uuid} value={item.uuid}>
                        {item.name}
                      </MenuItem>
                    ))}
                  </GlobalTextField>
                </Grid>

                <Grid item xs={12} md={6}>
                  <GlobalTextField
                    name="unit_of_measure"
                    label={t('stock.viewRegistration.unitOfMeasure')}
                    value={selectedItem.unit_of_measure}
                    onChange={(e) => setSelectedItem({ ...selectedItem, unit_of_measure: e.target.value })}
                    fullWidth
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <GlobalTextField
                    name="reorder_level"
                    label={t('stock.viewRegistration.reorderLevel')}
                    type="number"
                    value={selectedItem.reorder_level}
                    onChange={(e) => setSelectedItem({ ...selectedItem, reorder_level: Number(e.target.value) })}
                    fullWidth
                  />
                </Grid>

                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="subtitle1" fontWeight="bold" color="primary">
                    Stock Details
                  </Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <GlobalTextField
                    name="currentStockRate"
                    label={t('stock.viewRegistration.currentRate')}
                    type="number"
                    value={selectedItem.currentStockRate || ''}
                    onChange={(e) => setSelectedItem({ ...selectedItem, currentStockRate: Number(e.target.value) })}
                    fullWidth
                  />
                </Grid>

            
              </Grid>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 3, borderTop: '1px solid #e0e0e0' }}>
            <Button 
              onClick={handleCloseEditModal}
              variant="outlined"
              color="inherit"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSaveEdit}
              variant="contained"
              sx={{
                backgroundColor: '#005f73',
                color: '#ffffff',
                border: '1px solid #005f73',
                '&:hover': {
                  backgroundColor: '#ffffff',
                  color: '#005f73',
                  border: '1px solid #005f73'
                }
               }}
            >
              Save Changes
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={deleteDialogOpen}
          onClose={handleDeleteCancel}
          maxWidth="xs"
          fullWidth
        >
          <DialogTitle sx={{ borderBottom: '1px solid #e0e0e0', pb: 2 }}>
            Confirm Delete
          </DialogTitle>
          <DialogContent sx={{ pt: 3 }}>
            <Typography>
              Are you sure you want to delete the stock item "{itemToDelete?.name}"?
              This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ p: 3, borderTop: '1px solid #e0e0e0' }}>
            <Button 
              onClick={handleDeleteCancel}
              variant="outlined"
              color="inherit"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleDeleteConfirm}
              variant="contained"
              color="error"
              sx={{
                backgroundColor: '#d32f2f',
                color: '#ffffff',
                '&:hover': {
                  backgroundColor: '#b71c1c'
                }
              }}
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>

      
      </Container>
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
};

export default ViewRegistration;
