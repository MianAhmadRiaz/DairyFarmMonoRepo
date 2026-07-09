import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Select,
  MenuItem,
  Stack,
  FormControl,
  InputLabel,
  SelectChangeEvent,
  IconButton,
  InputAdornment,
  Divider,
  TablePagination,
  Card,
  CardContent,
  Grid,
  CircularProgress,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { Search as SearchIcon, Save as SaveIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import PageContainer from '../../../shared/components/Layout/PageContainer';
import GlobalTextField from '../../../shared/components/GlobalTextField/GlobalTextField';
import { fetchStockCategories, fetchStockItems } from '../../../shared/services/stock.services';
import { StockItemWithTotal, StockCategory, StockItem, PaginatedResponse } from './types';
import { tokens } from '../../../shared/theme/theme';
import { useTranslation } from 'react-i18next';

const OpenVoucher: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [categories, setCategories] = useState<StockCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [items, setItems] = useState<StockItemWithTotal[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchStockItemsByCategory();
  }, [selectedCategory, page, rowsPerPage]);

  const fetchCategories = async () => {
    try {
      const categories = await fetchStockCategories();
      setCategories(categories);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchStockItemsByCategory = async () => {
    try {
      setLoading(true);
      const response = await fetchStockItems(page + 1, rowsPerPage, selectedCategory || undefined);
      const itemsWithTotal = response?.data?.items.map((item: StockItem) => ({
        ...item,
        total: calculateTotal(item.currentStockRate || 0, item.currentStockQuantity || 0)
      }));
      setItems(itemsWithTotal);
      setTotalCount(response.data.totalCount);
    } catch (error) {
      console.error('Error fetching stock items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (event: SelectChangeEvent<string>) => {
    setSelectedCategory(event.target.value);
    setPage(0);
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSave = () => {
    console.log('Saving voucher...', items);
  };

  const calculateTotal = (rate: number, qty: number): number => {
    return Number((rate * qty).toFixed(2));
  };

  const searchedItems = items?.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <PageContainer title={t('stock.openVoucher.title')} subtitle={t('stock.openVoucher.subtitle')}>
      <Container maxWidth="lg"  sx={{
    px: isMobile ? '11px' : undefined,
  }}>
          <Box
            sx={{ 
              mb: 3, 
              borderRadius: '12px',
              boxShadow: theme.palette.mode === 'dark' ? '0 4px 12px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.05)',
              border: '1px solid rgba(0,0,0,0.05)',
              backgroundColor: theme.palette.background.paper,
            
              
            }}
          >
            <CardContent>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth size="small">
                    <InputLabel sx={{ color: '#005f73' }}>{t('stock.common.selectCategory')}</InputLabel>
                    <Select
                      value={selectedCategory}
                      label={t('stock.common.selectCategory')}
                      onChange={handleCategoryChange}
                      sx={{
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#005f73',
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#005f73',
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#005f73',
                        },
                        color: '#005f73'
                      }}
                    >
                      <MenuItem value="">{t('stock.common.allCategories')}</MenuItem>
                      {categories.map((category) => (
                        <MenuItem key={category.uuid} value={category.uuid}>
                          {category.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={8} sx={{ display: 'flex', justifyContent: {xs:'flex-start',md:'flex-end'}, gap: 2 }}>
                  <Button
                    variant="contained"
                    startIcon={<SaveIcon />}
                    onClick={handleSave}
                    sx={{
                      backgroundColor: '#005f73',
                      '&:hover': {
                        backgroundColor: '#003844'
                      }
                    }}
                  >
                    {t('common.save')}
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
       

          <Card 
            sx={{ 
           
              overflow: 'hidden'
            }}
          >
            <Box sx={{ 
              p: 2, 
              borderBottom: '1px solid rgba(0,0,0,0.05)',
              display: 'flex',
              justifyContent: 'flex-end'
            }}>
              <GlobalTextField
                size="small"
                value={searchQuery}
                onChange={handleSearch}
                name="search"
                label={t('stock.common.searchItems')}
                sx={{ 
                  width: 300,
                  '& .MuiOutlinedInput-root': {
                    height: '36px',
                    borderRadius: '8px',
                    backgroundColor: '#f8f9fa',
                    '&:hover': {
                      backgroundColor: '#f0f0f0'
                    }
                  }
                }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <SearchIcon sx={{ color: '#005f73' }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: theme.palette.mode === 'dark' ? colors.primary[400] : '#F8F9FA' }}>
                    <TableCell sx={{ fontWeight: 'bold', width: '20%', px: 1 }}>#</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', width: '20%', px: 1 }}>{t('stock.common.name')}</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', width: '20%', px: 1 }}>{t('stock.common.rate')}</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', width: '20%', px: 1 }}>{t('stock.common.quantity')}</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', width: '20%', px: 1 }}>{t('stock.common.total')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        <CircularProgress size={isMobile ? 30 : 50} 
 sx={{color:"#0F7C8F"}}/>
                      </TableCell>
                    </TableRow>
                  ) : (
                    searchedItems.map((item, index) => (
                      <TableRow key={item.uuid} sx={{ '&:hover': { backgroundColor: '#f8f9fa' } }}>
                        <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                        <TableCell>{item?.name}</TableCell>
                          <TableCell>{item.currentStockRate?.toFixed(2)
                          || 0}</TableCell>
                          <TableCell>{item?.stockLevel?.quantity || 0}</TableCell>
                          <TableCell>
  {item?.currentStockRate !== undefined
    ? item.currentStockRate * (item.stockLevel?.quantity ?? 0)
    : 0}
</TableCell>

                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={totalCount}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              sx={{
                '& .MuiTablePagination-select': {
                  borderRadius: '8px',
                }
              }}
            />
          </Card>
          </Box>
      </Container>
    </PageContainer>
  );
};

export default OpenVoucher;
