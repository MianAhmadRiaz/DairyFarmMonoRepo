import React, { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Stack,
  InputAdornment,
  Snackbar,
  Alert,
  useTheme,
  Chip
} from '@mui/material';
import {
  Search as SearchIcon,
  GetApp as GetAppIcon,
  ContentCopy as ContentCopyIcon,
  TableView as TableViewIcon,
  PictureAsPdf as PictureAsPdfIcon,
  CalendarToday as CalendarTodayIcon,
  Print as PrintIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';
import { tokens } from '../../shared/theme/theme';
import { fetchProfitLoss } from '../../shared/services/finance.service';
import PageContainer from '../../shared/components/Layout/PageContainer';

// TypeScript interfaces
interface ProfitLossEntry {
  id: number;
  category: string;
  subcategory?: string;
  name: string;
  amount: number;
  percentage: number;
  isTotal?: boolean;
  isSubtotal?: boolean;
  level: number; // 0 = main category, 1 = subcategory, 2 = item
}

interface SnackbarState {
  open: boolean;
  message: string;
  severity: 'success' | 'error';
}

const ProfitLossReport: React.FC = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const pageBg = theme.palette.mode === 'dark' ? colors.primary[500] : '#F5FAF7';

  // State management
  const [startDate, setStartDate] = useState<string>('2025-04-01');
  const [endDate, setEndDate] = useState<string>('2025-04-30');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showData, setShowData] = useState<boolean>(true); // Show data by default like in screenshot
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: '',
    severity: 'success'
  });

  // Sample profit and loss data matching the screenshot
  const [profitLossData, setProfitLossData] = useState<ProfitLossEntry[]>([
    // Incomes Section
    {
      id: 1,
      category: 'Incomes',
      name: 'Incomes',
      amount: 13307672,
      percentage: 0,
      isTotal: true,
      level: 0
    },
    {
      id: 2,
      category: 'Incomes',
      name: '[Sale of Product Income]',
      amount: 180840,
      percentage: 1.31,
      level: 1
    },
    {
      id: 3,
      category: 'Incomes',
      name: 'Milk Incentive - CHILLING',
      amount: 278487,
      percentage: 2.02,
      level: 1
    },
    {
      id: 4,
      category: 'Incomes',
      name: 'Milk Incentive - TPC',
      amount: 158185,
      percentage: 1.15,
      level: 1
    },
    {
      id: 5,
      category: 'Incomes',
      name: 'Milk Incentive - AFLATOXIN',
      amount: 232997,
      percentage: 1.69,
      level: 1
    },
    {
      id: 6,
      category: 'Incomes',
      name: 'Milk Incentive - LOYALITY',
      amount: 150649,
      percentage: 1.09,
      level: 1
    },
    {
      id: 7,
      category: 'Incomes',
      name: 'Milk Incentive - VOLUME @ 13TS',
      amount: 537118,
      percentage: 3.90,
      level: 1
    },
    {
      id: 8,
      category: 'Incomes',
      name: 'Animal Sale Income',
      amount: 1337000,
      percentage: 9.70,
      level: 1
    },
    {
      id: 9,
      category: 'Incomes',
      name: 'Milk Sales Income',
      amount: 10432606,
      percentage: 75.71,
      level: 1
    },
    // CGS Section
    {
      id: 10,
      category: 'CGS',
      name: 'CGS',
      amount: 9658229.55,
      percentage: 70.08,
      isSubtotal: true,
      level: 0
    },
    {
      id: 11,
      category: 'CGS',
      name: '[Feed Consumption Expense (CGS)]',
      amount: 8856644,
      percentage: 64.27,
      level: 1
    },
    {
      id: 12,
      category: 'CGS',
      name: 'Cream Extraction (CGS)',
      amount: 165663,
      percentage: 1.20,
      level: 1
    },
    {
      id: 13,
      category: 'CGS',
      name: '[Calf Feed Consumption Expense (CGS)]',
      amount: 635923,
      percentage: 4.61,
      level: 1
    },
    // Gross Profit
    {
      id: 14,
      category: 'Gross Profit',
      name: 'Gross Profit',
      amount: 3649442.65,
      percentage: 0,
      isTotal: true,
      level: 0
    },
    // In Direct Incomes
    {
      id: 15,
      category: 'In Direct Incomes',
      name: 'In Direct Incomes',
      amount: 473306,
      percentage: 0,
      isSubtotal: true,
      level: 0
    },
    {
      id: 16,
      category: 'In Direct Incomes',
      name: 'Agri Implement Rent Out Income',
      amount: 4080,
      percentage: 0.03,
      level: 1
    },
    {
      id: 17,
      category: 'In Direct Incomes',
      name: 'Recycling Income',
      amount: 4190,
      percentage: 0.03,
      level: 1
    },
    {
      id: 18,
      category: 'In Direct Incomes',
      name: 'Testing Services Income',
      amount: 6000,
      percentage: 0.04,
      level: 1
    },
    {
      id: 19,
      category: 'In Direct Incomes',
      name: 'Calves Milk Consumption (I.I)',
      amount: 433036,
      percentage: 3.14,
      level: 1
    },
    {
      id: 20,
      category: 'In Direct Incomes',
      name: 'Cow dung Income',
      amount: 26000,
      percentage: 0.19,
      level: 1
    }
  ]);

  // Calculate totals
  const totalIncome = 13307672;
  const totalCGS = 9658229.55;
  const grossProfit = 3649442.65;
  const inDirectIncomes = 473306;

  const loadProfitLoss = async () => {
    try {
      const data = await fetchProfitLoss({ startDate, endDate });
      const entries: ProfitLossEntry[] = [];
      let id = 1;
      const totalRevenue = Number(data.totalRevenue) || 0;
      const totalExpense = Number(data.totalExpense) || 0;
      entries.push({ id: id++, category: 'Incomes', name: 'Incomes', amount: totalRevenue, percentage: 0, isTotal: true, level: 0 });
      (data.revenue || []).forEach((r: { account_name: string; amount: number }) => {
        entries.push({
          id: id++, category: 'Incomes', name: r.account_name, amount: Number(r.amount) || 0,
          percentage: totalRevenue ? (Number(r.amount) / totalRevenue) * 100 : 0, level: 1
        });
      });
      entries.push({ id: id++, category: 'Expenses', name: 'Expenses', amount: totalExpense, percentage: 0, isTotal: true, level: 0 });
      (data.expenses || []).forEach((r: { account_name: string; amount: number }) => {
        entries.push({
          id: id++, category: 'Expenses', name: r.account_name, amount: Number(r.amount) || 0,
          percentage: totalExpense ? (Number(r.amount) / totalExpense) * 100 : 0, level: 1
        });
      });
      entries.push({ id: id++, category: 'Net', name: 'Net Profit', amount: Number(data.netProfit) || 0, percentage: 0, isTotal: true, level: 0 });
      setProfitLossData(entries);
      return entries.length;
    } catch (e) {
      console.error('Failed to load profit & loss', e);
      return 0;
    }
  };

  useEffect(() => {
    loadProfitLoss();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle GET Result
  const handleGetResult = async () => {
    if (!startDate || !endDate) {
      setSnackbar({ open: true, message: 'Please select both start and end dates', severity: 'error' });
      return;
    }
    await loadProfitLoss();
    setShowData(true);
    setSnackbar({ open: true, message: 'Profit and Loss report generated successfully!', severity: 'success' });
  };

  // Handle Print
  const handlePrint = () => {
    const printContent = `
      <html>
        <head>
          <title>Profit and Loss Report</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #005f73; padding-bottom: 10px; }
            .date-range { text-align: center; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px; }
            th { background-color: #f2f2f2; font-weight: bold; }
            .category-header { font-weight: bold; background-color: #f9f9f9; }
            .subcategory { padding-left: 20px; }
            .item { padding-left: 40px; }
            .total-row { font-weight: bold; background-color: #e8f5e8; }
            .subtotal-row { font-weight: bold; background-color: #fff3cd; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>Profit and Loss Report</h2>
          </div>
          <div class="date-range">
            <p><strong>Period:</strong> ${startDate} to ${endDate}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Category</th>
                <th>Amounts</th>
                <th>%</th>
              </tr>
            </thead>
            <tbody>
              ${profitLossData.map((entry: ProfitLossEntry, index) => `
                <tr class="${entry.isTotal ? 'total-row' : entry.isSubtotal ? 'subtotal-row' : ''}">
                  <td></td>
                  <td class="${entry.level === 1 ? 'subcategory' : entry.level === 2 ? 'item' : ''}">${entry.name}</td>
                  <td style="text-align: right;">${entry.amount.toLocaleString()}</td>
                  <td style="text-align: right;">${entry.percentage > 0 ? entry.percentage.toFixed(2) + ' %' : ''}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
    }
  };

  // Handle CSV export
  const handleCsvExport = () => {
    const csvContent = [
      ['#', 'Category', 'Amounts', '%'],
      ...profitLossData.map((entry: ProfitLossEntry, index) => [
        '',
        entry.name,
        entry.amount,
        entry.percentage > 0 ? entry.percentage.toFixed(2) + ' %' : ''
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'profit_loss_report.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Handle Excel export
  const handleExcelExport = () => {
    const xlsContent = [
      '#\tCategory\tAmounts\t%',
      ...profitLossData.map((entry: ProfitLossEntry) => 
        `\t${entry.name}\t${entry.amount}\t${entry.percentage > 0 ? entry.percentage.toFixed(2) + ' %' : ''}`
      )
    ].join('\n');

    const blob = new Blob([xlsContent], { type: 'application/vnd.ms-excel' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'profit_loss_report.xls');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Handle Copy to clipboard
  const handleCopy = () => {
    const textContent = [
      '#\tCategory\tAmounts\t%',
      ...profitLossData.map((entry: ProfitLossEntry) => 
        `\t${entry.name}\t${entry.amount}\t${entry.percentage > 0 ? entry.percentage.toFixed(2) + ' %' : ''}`
      )
    ].join('\n');

    navigator.clipboard.writeText(textContent).then(() => {
      setSnackbar({ open: true, message: 'Data copied to clipboard!', severity: 'success' });
    }).catch(() => {
      setSnackbar({ open: true, message: 'Failed to copy data', severity: 'error' });
    });
  };

  // Handle PDF export
  const handlePdfExport = () => {
    const pdfWindow = window.open('', '_blank');
    if (pdfWindow) {
      pdfWindow.document.write(`
        <html>
          <head>
            <title>Profit and Loss Report PDF</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 10px; }
              table { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 10px; }
              th, td { border: 1px solid #ddd; padding: 4px; text-align: left; }
              th { background-color: #f2f2f2; font-weight: bold; }
              .header { text-align: center; margin-bottom: 20px; }
              .total-row { font-weight: bold; background-color: #e8f5e8; }
              .subcategory { padding-left: 10px; }
            </style>
          </head>
          <body>
            <div class="header">
              <h2>Profit and Loss Report</h2>
              <p>Period: ${startDate} to ${endDate}</p>
            </div>
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Category</th>
                  <th>Amounts</th>
                  <th>%</th>
                </tr>
              </thead>
              <tbody>
                ${profitLossData.map((entry: ProfitLossEntry) => `
                  <tr class="${entry.isTotal ? 'total-row' : ''}">
                    <td></td>
                    <td class="${entry.level === 1 ? 'subcategory' : ''}">${entry.name}</td>
                    <td style="text-align: right;">${entry.amount.toLocaleString()}</td>
                    <td style="text-align: right;">${entry.percentage > 0 ? entry.percentage.toFixed(2) + ' %' : ''}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </body>
        </html>
      `);
      pdfWindow.document.close();
      pdfWindow.print();
    }
  };

  // Handle Column Visibility
  const handleColumnVisibility = () => {
    setSnackbar({ open: true, message: 'Column visibility options would open here', severity: 'success' });
  };

  // Handle export functions
  const handleExport = (format: string) => {
    switch (format) {
      case 'csv':
        handleCsvExport();
        break;
      case 'excel':
        handleExcelExport();
        break;
      case 'pdf':
        handlePdfExport();
        break;
      case 'copy':
        handleCopy();
        break;
      default:
        setSnackbar({ open: true, message: `Exporting to ${format.toUpperCase()}...`, severity: 'success' });
    }
  };

  // Filter data based on search term
  const filteredData = profitLossData.filter((entry: ProfitLossEntry) =>
    entry.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <PageContainer title="Profit and Loss Report">
        {/* Header Section */}
        <Paper elevation={0} sx={{ p: 3, mb: 2, borderRadius: 2, border: `1px solid ${theme.palette.divider}`, bgcolor: 'background.paper' }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems="center" justifyContent="space-between">
            {/* Title */}
            <Stack direction="row" spacing={2} alignItems="center">
              <TrendingUpIcon sx={{ color: '#f57c00', fontSize: 28 }} />
              <Typography variant="h5" fontWeight={600} sx={{ color: '#005f73' }}>
                Profit and Loss Report
              </Typography>
            </Stack>

            {/* Date Controls */}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} alignItems="center">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CalendarTodayIcon sx={{ color: '#005f73' }} />
                <Typography variant="body2" fontWeight={600}>Start Date:</Typography>
                <TextField
                  type="date"
                  size="small"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  sx={{ minWidth: 150 }}
                />
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CalendarTodayIcon sx={{ color: '#005f73' }} />
                <Typography variant="body2" fontWeight={600}>End Date:</Typography>
                <TextField
                  type="date"
                  size="small"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  sx={{ minWidth: 150 }}
                />
              </Box>

              <Button
                variant="contained"
                onClick={handleGetResult}
                sx={{ 
                  backgroundColor: "#4CAF50", 
                  color: "#ffffff",
                  textTransform: 'none',
                  px: 3,
                  '&:hover': {
                    backgroundColor: '#45a049',
                  }
                }}
              >
                GET
              </Button>

              <Button
                variant="outlined"
                startIcon={<PrintIcon />}
                onClick={handlePrint}
                sx={{ 
                  textTransform: 'none',
                  borderColor: '#005f73',
                  color: '#005f73',
                  '&:hover': {
                    borderColor: '#004d5c',
                    color: '#004d5c'
                  }
                }}
              >
                Print
              </Button>
            </Stack>
          </Stack>
        </Paper>

        {/* Main Report Card */}
        {showData && (
          <Paper elevation={0} sx={{ p: 0, borderRadius: 2, border: `1px solid ${theme.palette.divider}`, bgcolor: 'background.paper' }}>
            
            {/* Toolbar */}
            <Box sx={{ p: 2, bgcolor: '#f8f9fa', borderBottom: '1px solid #e0e0e0' }}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center" justifyContent="space-between">
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  <Button 
                    size="small" 
                    startIcon={<TableViewIcon />}
                    variant="outlined"
                    onClick={handleColumnVisibility}
                    sx={{ textTransform: 'none', fontSize: '0.75rem' }}
                  >
                    Column visibility
                  </Button>
                  <Button 
                    size="small" 
                    startIcon={<ContentCopyIcon />}
                    variant="outlined"
                    onClick={() => handleExport('copy')}
                    sx={{ textTransform: 'none', fontSize: '0.75rem' }}
                  >
                    Copy
                  </Button>
                  <Button 
                    size="small" 
                    startIcon={<GetAppIcon />}
                    variant="outlined"
                    onClick={() => handleExport('excel')}
                    sx={{ textTransform: 'none', fontSize: '0.75rem' }}
                  >
                    Excel
                  </Button>
                  <Button 
                    size="small" 
                    startIcon={<GetAppIcon />}
                    variant="outlined"
                    onClick={() => handleExport('csv')}
                    sx={{ textTransform: 'none', fontSize: '0.75rem' }}
                  >
                    CSV
                  </Button>
                  <Button 
                    size="small" 
                    startIcon={<PictureAsPdfIcon />}
                    variant="outlined"
                    onClick={() => handleExport('pdf')}
                    sx={{ textTransform: 'none', fontSize: '0.75rem' }}
                  >
                    PDF
                  </Button>
                </Stack>
                
                <TextField
                  size="small"
                  placeholder="Search:"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon fontSize="small" />
                      </InputAdornment>
                    )
                  }}
                  sx={{ minWidth: 200 }}
                />
              </Stack>
            </Box>

            {/* Profit & Loss Table */}
            <TableContainer sx={{ maxHeight: 600 }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, bgcolor: '#f5f5f5', border: '1px solid #e0e0e0', width: 60 }}>#</TableCell>
                    <TableCell sx={{ fontWeight: 600, bgcolor: '#f5f5f5', border: '1px solid #e0e0e0', width: '50%' }}></TableCell>
                    <TableCell sx={{ fontWeight: 600, bgcolor: '#f5f5f5', border: '1px solid #e0e0e0', textAlign: 'center' }}>Amounts</TableCell>
                    <TableCell sx={{ fontWeight: 600, bgcolor: '#f5f5f5', border: '1px solid #e0e0e0', textAlign: 'center' }}>%</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {/* Data Rows */}
                  {filteredData.map((entry, index) => (
                    <TableRow key={entry.id} hover>
                      <TableCell sx={{ border: '1px solid #e0e0e0' }}>
                        {entry.level === 1 && (
                          <Box sx={{ 
                            width: 8, 
                            height: 8, 
                            borderRadius: '50%', 
                            bgcolor: '#4caf50',
                            margin: '0 auto'
                          }} />
                        )}
                      </TableCell>
                      <TableCell 
                        sx={{ 
                          border: '1px solid #e0e0e0',
                          pl: entry.level === 1 ? 4 : entry.level === 2 ? 6 : 2,
                          fontWeight: entry.isTotal || entry.isSubtotal ? 600 : 400,
                          bgcolor: entry.isTotal ? '#e8f5e8' : entry.isSubtotal ? '#fff3cd' : 'transparent'
                        }}
                      >
                        {entry.name}
                      </TableCell>
                      <TableCell 
                        sx={{ 
                          border: '1px solid #e0e0e0', 
                          textAlign: 'right',
                          fontWeight: entry.isTotal || entry.isSubtotal ? 600 : 400,
                          bgcolor: entry.isTotal ? '#e8f5e8' : entry.isSubtotal ? '#fff3cd' : 'transparent'
                        }}
                      >
                        {entry.amount.toLocaleString()}
                      </TableCell>
                      <TableCell 
                        sx={{ 
                          border: '1px solid #e0e0e0', 
                          textAlign: 'right',
                          fontWeight: entry.isTotal || entry.isSubtotal ? 600 : 400,
                          bgcolor: entry.isTotal ? '#e8f5e8' : entry.isSubtotal ? '#fff3cd' : 'transparent'
                        }}
                      >
                        {entry.percentage > 0 ? `${entry.percentage.toFixed(2)} %` : ''}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        )}

        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={3000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
    </PageContainer>
  );
};

export default ProfitLossReport;
