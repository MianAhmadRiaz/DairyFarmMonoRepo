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
  Typography,
  Snackbar,
  Alert,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { Search as SearchIcon, ContentCopy as CopyIcon, FileDownload as ExcelIcon } from '@mui/icons-material';
import PageContainer from '../../../../../shared/components/Layout/PageContainer';
import { fetchDayWiseConsumption } from '../../../../../shared/services/feeding.services';
import * as XLSX from 'xlsx';
import { ConsumptionData } from './type';


const DayWiseConsumeReport: React.FC = () => {
  const [data, setData] = useState<ConsumptionData>({});
  const [dateColumns, setDateColumns] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState('2025-04-01');
  const [endDate, setEndDate] = useState('2025-04-15');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });
   const theme = useTheme();
   const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const fetchConsumptionData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetchDayWiseConsumption(startDate, endDate);
      setData(response.data?.items);
      
      const dates = new Set<string>();
      Object.values(response.data?.items).forEach(items => {
        items.forEach(item => dates.add(item.day));
      });
      setDateColumns(Array.from(dates).sort());
    } catch (err) {
      setError('Failed to fetch consumption data. Please try again.');
      console.error('Error fetching consumption data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConsumptionData();
  }, []);

  const handleDateChange = () => {
    fetchConsumptionData();
  };

  const handleCopy = () => {
    console.log('Copy functionality to be implemented');
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const handleExcel = () => {
    try {
      const headers = ['Item Name', ...dateColumns.map(date => formatDate(date)), 'Total'];
      
      const excelData = Object.keys(data).map(itemName => {
        const row: any = { 'Item Name': itemName };
        dateColumns.forEach(date => {
          row[formatDate(date)] = getQuantityForDate(itemName, date);
        });
        row['Total'] = calculateTotal(itemName);
        return row;
      });

      const totalRow: any = { 'Item Name': 'TOTAL' };
      dateColumns.forEach(date => {
        const dateTotal = Object.keys(data).reduce((sum, itemName) => 
          sum + getQuantityForDate(itemName, date), 0
        );
        totalRow[formatDate(date)] = dateTotal;
      });
      totalRow['Total'] = Object.keys(data).reduce((sum, itemName) => 
        sum + calculateTotal(itemName), 0
      );
      excelData.push(totalRow);

      const ws = XLSX.utils.json_to_sheet(excelData);
      
      const wscols = [
        {wch: 30}, 
        ...dateColumns.map(() => ({wch: 15})), 
        {wch: 15} 
      ];
      ws['!cols'] = wscols;

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Day Wise Consumption Report");

      XLSX.writeFile(wb, `Day_Wise_Consumption_Report_${startDate}_to_${endDate}.xlsx`);

      setSnackbar({
        open: true,
        message: "Excel file downloaded successfully",
        severity: 'success'
      });
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      setSnackbar({
        open: true,
        message: "Failed to export Excel file",
        severity: 'error'
      });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const calculateTotal = (itemName: string) => {
    return data[itemName]?.reduce((sum, item) => sum + item.total_quantity, 0) || 0;
  };

  const getQuantityForDate = (itemName: string, date: string) => {
    const item = data[itemName]?.find(item => item.day === date);
    return item?.total_quantity || 0;
  };

  return (
    <PageContainer title="Feed Consumption Day-Wise" subtitle="View daily consumption of items">
      <Container maxWidth="lg"  sx={{
    px: isMobile ? '11px' : undefined,
  }}>
        <Paper
          elevation={1}
          sx={{
            // p: 2,
            borderRadius: '12px',
            backgroundColor: 'white',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            position: 'relative'
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
                    label="Start Date"
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
                    label="End Date"
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
                    onClick={handleDateChange}
                    sx={{
                      backgroundColor: '#005f73',
                      '&:hover': {
                        backgroundColor: '#003844'
                      },
                      flex: 1
                    }}
                  >
                    Go!
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
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress size={isMobile ? 30 : 50} 
sx={{
    color: "#0F7C8F",
       }} />
              </Box>
            ) : error ? (
              <Typography color="error" sx={{ p: 3 }}>{error}</Typography>
            ) : (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow >
                      <TableCell
                        sx={{
                          bgcolor: '#f8f9fA',
                          fontWeight: 600,
                          borderBottom: '2px solid #e0e0e0',
                          textAlign:'center',
                          py: 1.5
                        }}
                      >
                        Item Name
                      </TableCell>
                      {dateColumns.map(date => (
                        <TableCell
                          key={date}
                          align="right"
                          sx={{
                            bgcolor: '#f5f5f5',
                            fontWeight: 600,
                            borderBottom: '2px solid #e0e0e0',
                              textAlign:'center',
                            py: 1.5
                          }}
                        >
                          {formatDate(date)}
                        </TableCell>
                      ))}
                      <TableCell
                        align="right"
                        sx={{
                          bgcolor: '#f8f9fA',
                          fontWeight: 600,
                          borderBottom: '2px solid #e0e0e0',
                          py: 1.5,
                            textAlign:'center',
                        }}
                      >
                        Total
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {
                    Object.keys(data).length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={dateColumns.length + 2} align="center" sx={{ py: 1 }}>
                          No data available
                        </TableCell>
                      </TableRow>
                    ) :
                    Object.keys(data).map(itemName => (
                      <TableRow key={itemName} sx={{ '&:hover': { backgroundColor: '#f8f9fa' ,height: '50px' },height: '50px' }}>
                        <TableCell
                          sx={{
                            color: '#2c3e50',
                            borderBottom: '1px solid #e0e0e0',
                            py: 1
                          }}
                        >
                          {itemName}
                        </TableCell>
                        {dateColumns.map(date => {
                          const quantity = getQuantityForDate(itemName, date);
                          return (
                            <TableCell
                              key={`${itemName}-${date}`}
                              align="right"
                              sx={{
                                borderBottom: '1px solid #e0e0e0',
                                py: 1,
                                color: quantity === 0 ? 'red' : 'inherit'
                              }}
                            >
                              {quantity}
                            </TableCell>
                          );
                        })}
                        <TableCell
                          align="right"
                          sx={{
                            borderBottom: '1px solid #e0e0e0',
                            py: 1,
                            fontWeight: 600
                          }}
                        >
                          {calculateTotal(itemName)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
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

export default DayWiseConsumeReport;
