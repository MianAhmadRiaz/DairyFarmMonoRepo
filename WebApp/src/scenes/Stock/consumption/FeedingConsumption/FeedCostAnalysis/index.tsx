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
  Card,
  CardContent,
  Grid,
  CircularProgress,
  IconButton,
  Snackbar,
  Alert,
  Typography,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { Search as SearchIcon, ContentCopy as CopyIcon, FileDownload as ExcelIcon } from '@mui/icons-material';
import PageContainer from '../../../../../shared/components/Layout/PageContainer';
import { fetchFeedCostAnalysis } from '../../../../../shared/services/feeding.services';
import * as XLSX from 'xlsx';
import { FeedCostItem } from './type';
import { useTranslation } from 'react-i18next';


const FeedCostAnalysis: React.FC = () => {
  const { t } = useTranslation();
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<{
    items: FeedCostItem[];
    count: number;
    totalAmount: string;
  }>({ items: [], count: 0, totalAmount: "0" });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });
   const theme = useTheme();
   const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];
    setStartDate(formattedDate);
    setEndDate(formattedDate);
    
    fetchReport(formattedDate, formattedDate);
  }, []);

  const fetchReport = async (start: string, end: string) => {
    try {
      setLoading(true);
      const response = await fetchFeedCostAnalysis(start, end);
      
      const totalAmount = response?.data?.data?.items.reduce((sum: number, item: any) => {
        return sum + (parseFloat(item.total_quantity) * item['item.stockLevel.price']);
      }, 0);
      
      setData({
        items: response?.data?.data?.items,
        count: response?.data?.data?.items.length,
        totalAmount: totalAmount.toFixed(2)
      });

      setSnackbar({
        open: true,
        message: t('stock.feedCostAnalysis.fetchSuccess'),
        severity: 'success'
      });
    } catch (error) {
      console.error('Error fetching report:', error);
      setSnackbar({
        open: true,
        message: t('stock.feedCostAnalysis.fetchError'),
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (startDate) {
      fetchReport(startDate, endDate || startDate);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const handleCopy = () => {
    console.log('Copy functionality to be implemented');
  };

  const handleExcel = () => {
    try {
      const excelData = data.items.map((item, index) => ({
        '#': index + 1,
        'Product': item['item.name'],
        'Quantity': parseFloat(item.total_quantity),
        'Unit Price': item['item.stockLevel.price'],
        'Total Cost': (parseFloat(item.total_quantity) * item['item.stockLevel.price']).toFixed(2)
      }));

      excelData.push({
        '#': 0,
        'Product': 'TOTAL',
        'Quantity': 0,
        'Unit Price': 0,
        'Total Cost': data.totalAmount
      });

      const ws = XLSX.utils.json_to_sheet(excelData);
      
      const wscols = [
        {wch: 5}, 
        {wch: 30}, 
        {wch: 15}, 
        {wch: 15}, 
        {wch: 15} 
      ];
      ws['!cols'] = wscols;

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, t('stock.feedCostAnalysis.sheetName'));

      XLSX.writeFile(wb, `Feed_Cost_Analysis_Report_${startDate}_to_${endDate}.xlsx`);

      setSnackbar({
        open: true,
        message: t('stock.common.excelDownloadSuccess'),
        severity: 'success'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: t('stock.common.excelDownloadError'),
        severity: 'error'
      });
    }
  };

  return (
    <PageContainer title={t('stock.feedCostAnalysis.title')} subtitle={t('stock.feedCostAnalysis.subtitle')}>
      <Container maxWidth="lg" sx={{
    px: isMobile ? '11px' : undefined,
  }}>
        <Paper
          elevation={1}
          sx={{
          
            borderRadius: '12px',
            backgroundColor: 'white',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}
        >
          <Box
            sx={{ 
               p:{xs:0,md:2},
              
            }}
          >
            <CardContent>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={4}>
                  <TextField
                    type="date"
                    label={t('stock.common.startDate')}
                    size="small"
                    fullWidth
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    type="date"
                    label={t('stock.common.endDate')}
                    size="small"
                    fullWidth
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} md={4} sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="contained"
                    startIcon={<SearchIcon />}
                    onClick={handleSearch}
                    sx={{
                      backgroundColor: '#005f73',
                      '&:hover': {
                        backgroundColor: '#003844'
                      },
                      flex: 1
                    }}
                  >
                    {t('stock.common.go')}
                  </Button>
                  <IconButton 
                    onClick={handleCopy}
                    sx={{ 
                      border: '1px solid #ddd',
                      borderRadius: '4px'
                    }}
                  >
                    <CopyIcon />
                  </IconButton>
                  <IconButton 
                    onClick={handleExcel}
                    sx={{ 
                      border: '1px solid #ddd',
                      borderRadius: '4px'
                    }}
                  >
                    <ExcelIcon />
                  </IconButton>
                </Grid>
              </Grid>
            </CardContent>
          </Box>

          <Card 
            sx={{ 
              overflow: 'auto'              
            }}
          >
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f8f9fA' }}>
                    <TableCell sx={{ fontWeight: 'bold' }}>#</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>{t('stock.common.product')}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>{t('stock.common.quantity')}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>{t('stock.common.rate')}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>{t('stock.common.amount')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow >
                      <TableCell colSpan={5} align="center">
                        <CircularProgress size={isMobile ? 30 : 50} 
                        sx={{ color: "#0F7C8F", }} />
                      </TableCell>
                    </TableRow>
                  ) : data.items.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        {t('stock.common.noDataAvailable')}
                      </TableCell>
                    </TableRow>
                  ) : (
                    <>
                      {data.items.map((item, index) => {
                        const amount = parseFloat(item.total_quantity) * item['item.stockLevel.price'];
                        return (
                          <TableRow key={item.itemId} sx={{ '&:hover': { backgroundColor: '#f8f9fa' ,height: '50px' },height: '50px' }}>
                            <TableCell>{index + 1}</TableCell>
                            <TableCell>{item['item.name']}</TableCell>
                            <TableCell align="right">{item.total_quantity}</TableCell>
                            <TableCell align="right">{item['item.stockLevel.price']}</TableCell>
                            <TableCell align="right">{amount.toFixed(2)}</TableCell>
                          </TableRow>
                        );
                      })}
                      <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                        <TableCell colSpan={4} align="right" sx={{ fontWeight: 'bold' }}>
                          {t('stock.common.totalAmount')}:
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                          {data.totalAmount}
                        </TableCell>
                      </TableRow>
                    </>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </Paper>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </PageContainer>
  );
};

export default FeedCostAnalysis;
