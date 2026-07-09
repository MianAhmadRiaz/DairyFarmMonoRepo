import React, { useState } from 'react';
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
  useTheme
} from '@mui/material';
import {
  Search as SearchIcon,
  GetApp as GetAppIcon,
  ContentCopy as ContentCopyIcon,
  TableView as TableViewIcon,
  PictureAsPdf as PictureAsPdfIcon,
  CalendarToday as CalendarTodayIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { tokens } from '../../shared/theme/theme';
import PageContainer from '../../shared/components/Layout/PageContainer';

// TypeScript interfaces
interface MilkConsumptionEntry {
  id: number;
  srNo: number;
  date: string;
  milk1: number;
  milk2: number;
  milk3: number;
  total: number;
  purchaseReturn: number;
  officeMainMilk1: number;
  officeMainMilk2: number;
  officeMainMilk3: number;
  calvesConsumption: number;
  localDispatch: number;
  overallRemainingMilk: number;
}

interface SnackbarState {
  open: boolean;
  message: string;
  severity: 'success' | 'error';
}

const TotalMilkConsumptionReport: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const pageBg = theme.palette.mode === 'dark' ? colors.primary[500] : '#F5FAF7';

  // State management
  const [startingDate, setStartingDate] = useState<string>('2025-04-01');
  const [endingDate, setEndingDate] = useState<string>('2025-04-30');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showData, setShowData] = useState<boolean>(true); // Show data by default like in screenshot
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: '',
    severity: 'success'
  });

  // Sample milk consumption data matching the screenshot
  const [milkConsumptionData] = useState<MilkConsumptionEntry[]>([
    {
      id: 1,
      srNo: 1,
      date: '01-Apr-2025',
      milk1: 1079.5,
      milk2: 1061.9,
      milk3: 1050.8,
      total: 3192.2,
      purchaseReturn: 0,
      officeMainMilk1: 0.00,
      officeMainMilk2: 0.00,
      officeMainMilk3: 0.00,
      calvesConsumption: 0.00,
      localDispatch: 78.32,
      overallRemainingMilk: 3.76
    },
    {
      id: 2,
      srNo: 2,
      date: '02-Apr-2025',
      milk1: 1066,
      milk2: 1078.1,
      milk3: 1060.5,
      total: 3204.6,
      purchaseReturn: 0,
      officeMainMilk1: 0.00,
      officeMainMilk2: 0.00,
      officeMainMilk3: 0.00,
      calvesConsumption: 0.00,
      localDispatch: 54.45,
      overallRemainingMilk: -3.06
    },
    {
      id: 3,
      srNo: 3,
      date: '03-Apr-2025',
      milk1: 1038.1,
      milk2: 1029.3,
      milk3: 1061.64,
      total: 3129.04,
      purchaseReturn: 0,
      officeMainMilk1: 0.00,
      officeMainMilk2: 0.00,
      officeMainMilk3: 0.00,
      calvesConsumption: 0.00,
      localDispatch: 122.00,
      overallRemainingMilk: -1.59
    },
    {
      id: 4,
      srNo: 4,
      date: '04-Apr-2025',
      milk1: 1044.8,
      milk2: 1050.56,
      milk3: 1061,
      total: 3156.36,
      purchaseReturn: 0,
      officeMainMilk1: 0.00,
      officeMainMilk2: 0.00,
      officeMainMilk3: 0.00,
      calvesConsumption: 0.00,
      localDispatch: 48.40,
      overallRemainingMilk: -2.00
    },
    {
      id: 5,
      srNo: 5,
      date: '05-Apr-2025',
      milk1: 1054.4,
      milk2: 1059,
      milk3: 1080,
      total: 3193.4,
      purchaseReturn: 0,
      officeMainMilk1: 0.00,
      officeMainMilk2: 0.00,
      officeMainMilk3: 0.00,
      calvesConsumption: 0.00,
      localDispatch: 39.30,
      overallRemainingMilk: -1.87
    },
    {
      id: 6,
      srNo: 6,
      date: '06-Apr-2025',
      milk1: 1048.3,
      milk2: 1039.2,
      milk3: 1069.2,
      total: 3156.7,
      purchaseReturn: 0,
      officeMainMilk1: 0.00,
      officeMainMilk2: 0.00,
      officeMainMilk3: 0.00,
      calvesConsumption: 0.00,
      localDispatch: 51.90,
      overallRemainingMilk: -2.04
    },
    {
      id: 7,
      srNo: 7,
      date: '07-Apr-2025',
      milk1: 1057.3,
      milk2: 1050.8,
      milk3: 1048.7,
      total: 3156.8,
      purchaseReturn: 0,
      officeMainMilk1: 0.00,
      officeMainMilk2: 0.00,
      officeMainMilk3: 0.00,
      calvesConsumption: 0.00,
      localDispatch: 49.90,
      overallRemainingMilk: -2.05
    },
    {
      id: 8,
      srNo: 8,
      date: '08-Apr-2025',
      milk1: 1001.4,
      milk2: 1010.6,
      milk3: 1052.5,
      total: 3064.5,
      purchaseReturn: 0,
      officeMainMilk1: 0.00,
      officeMainMilk2: 0.00,
      officeMainMilk3: 0.00,
      calvesConsumption: 0.00,
      localDispatch: 39.90,
      overallRemainingMilk: -2.36
    },
    {
      id: 9,
      srNo: 9,
      date: '09-Apr-2025',
      milk1: 940,
      milk2: 988.8,
      milk3: 1024.3,
      total: 2953.1,
      purchaseReturn: 0,
      officeMainMilk1: 0.00,
      officeMainMilk2: 0.00,
      officeMainMilk3: 0.00,
      calvesConsumption: 0.00,
      localDispatch: 45.30,
      overallRemainingMilk: -0.47
    },
    {
      id: 10,
      srNo: 10,
      date: '10-Apr-2025',
      milk1: 1000.8,
      milk2: 946.1,
      milk3: 1017.4,
      total: 2964.3,
      purchaseReturn: 0,
      officeMainMilk1: 0.00,
      officeMainMilk2: 0.00,
      officeMainMilk3: 0.00,
      calvesConsumption: 0.00,
      localDispatch: 37.90,
      overallRemainingMilk: -2.97
    },
    {
      id: 11,
      srNo: 11,
      date: '11-Apr-2025',
      milk1: 1038,
      milk2: 1018.89,
      milk3: 1024.3,
      total: 3081.19,
      purchaseReturn: 0,
      officeMainMilk1: 0.00,
      officeMainMilk2: 0.00,
      officeMainMilk3: 0.00,
      calvesConsumption: 0.00,
      localDispatch: 48.00,
      overallRemainingMilk: -2.00
    },
    {
      id: 12,
      srNo: 12,
      date: '12-Apr-2025',
      milk1: 1019.8,
      milk2: 1012.9,
      milk3: 1045.62,
      total: 3078.32,
      purchaseReturn: 0,
      officeMainMilk1: 0.00,
      officeMainMilk2: 0.00,
      officeMainMilk3: 0.00,
      calvesConsumption: 0.00,
      localDispatch: 35.80,
      overallRemainingMilk: -2.00
    },
    {
      id: 13,
      srNo: 13,
      date: '13-Apr-2025',
      milk1: 1059.5,
      milk2: 977.8,
      milk3: 1047.9,
      total: 3085.2,
      purchaseReturn: 0,
      officeMainMilk1: 0.00,
      officeMainMilk2: 0.00,
      officeMainMilk3: 0.00,
      calvesConsumption: 0.00,
      localDispatch: 46.80,
      overallRemainingMilk: 0.74
    }
  ]);

  // Calculate totals
  const totals = milkConsumptionData.reduce((acc, entry) => ({
    milk1: acc.milk1 + entry.milk1,
    milk2: acc.milk2 + entry.milk2,
    milk3: acc.milk3 + entry.milk3,
    total: acc.total + entry.total,
    purchaseReturn: acc.purchaseReturn + entry.purchaseReturn,
    officeMainMilk1: acc.officeMainMilk1 + entry.officeMainMilk1,
    officeMainMilk2: acc.officeMainMilk2 + entry.officeMainMilk2,
    officeMainMilk3: acc.officeMainMilk3 + entry.officeMainMilk3,
    calvesConsumption: acc.calvesConsumption + entry.calvesConsumption,
    localDispatch: acc.localDispatch + entry.localDispatch,
    overallRemainingMilk: acc.overallRemainingMilk + entry.overallRemainingMilk
  }), {
    milk1: 0,
    milk2: 0,
    milk3: 0,
    total: 0,
    purchaseReturn: 0,
    officeMainMilk1: 0,
    officeMainMilk2: 0,
    officeMainMilk3: 0,
    calvesConsumption: 0,
    localDispatch: 0,
    overallRemainingMilk: 0
  });

  // Opening milk balance
  const openingMilk = -156.1489999506834;

  // Handle GET Result
  const handleGetResult = () => {
    if (!startingDate || !endingDate) {
      setSnackbar({ open: true, message: t('accounts.common.selectDatesError'), severity: 'error' });
      return;
    }

    setShowData(true);
    setSnackbar({ open: true, message: t('accounts.totalMilkConsumptionReport.reportGenerated'), severity: 'success' });
  };

  // Export headers (translated once, reused by CSV/Excel/Copy)
  const exportHeaders = [
    '#',
    t('accounts.common.columns.date'),
    t('accounts.totalMilkConsumptionReport.columns.milk', { num: 1 }),
    t('accounts.totalMilkConsumptionReport.columns.milk', { num: 2 }),
    t('accounts.totalMilkConsumptionReport.columns.milk', { num: 3 }),
    t('accounts.common.total'),
    t('accounts.totalMilkConsumptionReport.columns.purchaseReturn'),
    t('accounts.totalMilkConsumptionReport.columns.officeMainMilk', { num: 1 }),
    t('accounts.totalMilkConsumptionReport.columns.officeMainMilk', { num: 2 }),
    t('accounts.totalMilkConsumptionReport.columns.officeMainMilk', { num: 3 }),
    t('accounts.totalMilkConsumptionReport.columns.calvesConsumption'),
    t('accounts.totalMilkConsumptionReport.columns.localDispatch'),
    t('accounts.totalMilkConsumptionReport.columns.overallRemainingMilk')
  ];

  // Handle CSV export
  const handleCsvExport = () => {
    const csvContent = [
      exportHeaders,
      ...milkConsumptionData.map((entry: MilkConsumptionEntry) => [
        entry.srNo,
        entry.date,
        entry.milk1,
        entry.milk2,
        entry.milk3,
        entry.total,
        entry.purchaseReturn,
        entry.officeMainMilk1,
        entry.officeMainMilk2,
        entry.officeMainMilk3,
        entry.calvesConsumption,
        entry.localDispatch,
        entry.overallRemainingMilk
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'total_milk_consumption_report.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Handle Excel export
  const handleExcelExport = () => {
    const xlsContent = [
      exportHeaders.join('\t'),
      ...milkConsumptionData.map((entry: MilkConsumptionEntry) => 
        `${entry.srNo}\t${entry.date}\t${entry.milk1}\t${entry.milk2}\t${entry.milk3}\t${entry.total}\t${entry.purchaseReturn}\t${entry.officeMainMilk1}\t${entry.officeMainMilk2}\t${entry.officeMainMilk3}\t${entry.calvesConsumption}\t${entry.localDispatch}\t${entry.overallRemainingMilk}`
      )
    ].join('\n');

    const blob = new Blob([xlsContent], { type: 'application/vnd.ms-excel' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'total_milk_consumption_report.xls');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Handle Copy to clipboard
  const handleCopy = () => {
    const textContent = [
      exportHeaders.join('\t'),
      ...milkConsumptionData.map((entry: MilkConsumptionEntry) => 
        `${entry.srNo}\t${entry.date}\t${entry.milk1}\t${entry.milk2}\t${entry.milk3}\t${entry.total}\t${entry.purchaseReturn}\t${entry.officeMainMilk1}\t${entry.officeMainMilk2}\t${entry.officeMainMilk3}\t${entry.calvesConsumption}\t${entry.localDispatch}\t${entry.overallRemainingMilk}`
      )
    ].join('\n');

    navigator.clipboard.writeText(textContent).then(() => {
      setSnackbar({ open: true, message: t('accounts.common.copiedToClipboard'), severity: 'success' });
    }).catch(() => {
      setSnackbar({ open: true, message: t('accounts.common.copyFailed'), severity: 'error' });
    });
  };

  // Handle PDF export
  const handlePdfExport = () => {
    const pdfWindow = window.open('', '_blank');
    if (pdfWindow) {
      pdfWindow.document.write(`
        <html>
          <head>
            <title>${t('accounts.totalMilkConsumptionReport.pdfTitle')}</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 10px; }
              table { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 8px; }
              th, td { border: 1px solid #ddd; padding: 2px; text-align: left; }
              th { background-color: #f2f2f2; font-weight: bold; }
              .header { text-align: center; margin-bottom: 20px; }
              .totals { font-weight: bold; background-color: #f9f9f9; }
            </style>
          </head>
          <body>
            <div class="header">
              <h2>${t('accounts.totalMilkConsumptionReport.title')}</h2>
              <p>${t('accounts.common.period', { start: startingDate, end: endingDate })}</p>
              <p>${t('accounts.totalMilkConsumptionReport.openingMilk')} ${openingMilk}</p>
            </div>
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>${t('accounts.common.columns.date')}</th>
                  <th>${t('accounts.totalMilkConsumptionReport.columns.milk', { num: 1 })}</th>
                  <th>${t('accounts.totalMilkConsumptionReport.columns.milk', { num: 2 })}</th>
                  <th>${t('accounts.totalMilkConsumptionReport.columns.milk', { num: 3 })}</th>
                  <th>${t('accounts.common.total')}</th>
                  <th>${t('accounts.totalMilkConsumptionReport.columns.purchaseReturn')}</th>
                  <th>${t('accounts.totalMilkConsumptionReport.columns.officeMilkShort', { num: 1 })}</th>
                  <th>${t('accounts.totalMilkConsumptionReport.columns.officeMilkShort', { num: 2 })}</th>
                  <th>${t('accounts.totalMilkConsumptionReport.columns.officeMilkShort', { num: 3 })}</th>
                  <th>${t('accounts.totalMilkConsumptionReport.columns.calvesShort')}</th>
                  <th>${t('accounts.totalMilkConsumptionReport.columns.localDispatch')}</th>
                  <th>${t('accounts.totalMilkConsumptionReport.columns.remainingShort')}</th>
                </tr>
              </thead>
              <tbody>
                ${milkConsumptionData.map((entry: MilkConsumptionEntry) => `
                  <tr>
                    <td>${entry.srNo}</td>
                    <td>${entry.date}</td>
                    <td>${entry.milk1}</td>
                    <td>${entry.milk2}</td>
                    <td>${entry.milk3}</td>
                    <td>${entry.total}</td>
                    <td>${entry.purchaseReturn}</td>
                    <td>${entry.officeMainMilk1}</td>
                    <td>${entry.officeMainMilk2}</td>
                    <td>${entry.officeMainMilk3}</td>
                    <td>${entry.calvesConsumption}</td>
                    <td>${entry.localDispatch}</td>
                    <td>${entry.overallRemainingMilk}</td>
                  </tr>
                `).join('')}
                <tr class="totals">
                  <td>${t('accounts.common.total')}</td>
                  <td></td>
                  <td>${totals.milk1.toFixed(2)}</td>
                  <td>${totals.milk2.toFixed(2)}</td>
                  <td>${totals.milk3.toFixed(2)}</td>
                  <td>${totals.total.toFixed(2)}</td>
                  <td>${totals.purchaseReturn.toFixed(2)}</td>
                  <td>${totals.officeMainMilk1.toFixed(2)}</td>
                  <td>${totals.officeMainMilk2.toFixed(2)}</td>
                  <td>${totals.officeMainMilk3.toFixed(2)}</td>
                  <td>${totals.calvesConsumption.toFixed(2)}</td>
                  <td>${totals.localDispatch.toFixed(2)}</td>
                  <td></td>
                </tr>
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
    setSnackbar({ open: true, message: t('accounts.common.columnVisibilityInfo'), severity: 'success' });
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
        setSnackbar({ open: true, message: t('accounts.common.exportingTo', { format: format.toUpperCase() }), severity: 'success' });
    }
  };

  // Filter data based on search term
  const filteredData = milkConsumptionData.filter((entry: MilkConsumptionEntry) =>
    entry.date.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <PageContainer title={t('accounts.totalMilkConsumptionReport.title')} maxWidth={1400}>
        {/* Date Range Selection */}
        <Paper elevation={0} sx={{ p: 3, mb: 2, borderRadius: 2, border: `1px solid ${theme.palette.divider}`, bgcolor: 'background.paper' }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems="center" justifyContent="space-between">
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} alignItems="center">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CalendarTodayIcon sx={{ color: '#005f73' }} />
                <Typography variant="body2" fontWeight={600}>{t('accounts.common.startingDate')}</Typography>
                <TextField
                  type="date"
                  size="small"
                  value={startingDate}
                  onChange={(e) => setStartingDate(e.target.value)}
                  sx={{ minWidth: 150 }}
                />
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CalendarTodayIcon sx={{ color: '#005f73' }} />
                <Typography variant="body2" fontWeight={600}>{t('accounts.common.endingDate')}</Typography>
                <TextField
                  type="date"
                  size="small"
                  value={endingDate}
                  onChange={(e) => setEndingDate(e.target.value)}
                  sx={{ minWidth: 150 }}
                />
              </Box>
            </Stack>
            
            <Button
              variant="contained"
              onClick={handleGetResult}
              sx={{ 
                backgroundColor: "#4CAF50", 
                color: "#ffffff",
                textTransform: 'none',
                px: 4,
                '&:hover': {
                  backgroundColor: '#45a049',
                }
              }}
            >
              {t('accounts.common.getResult')}
            </Button>
          </Stack>
        </Paper>

        {/* Opening Milk Display */}
        <Paper elevation={0} sx={{ p: 2, mb: 2, borderRadius: 2, border: `1px solid ${theme.palette.divider}`, bgcolor: 'background.paper' }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" fontWeight={600} sx={{ color: '#005f73' }}>
              {t('accounts.totalMilkConsumptionReport.title')}
            </Typography>
            <Typography variant="body1" fontWeight={600}>
              {t('accounts.totalMilkConsumptionReport.openingMilk')} <span style={{ color: '#d32f2f' }}>{openingMilk}</span>
            </Typography>
          </Stack>
        </Paper>

        {/* Main Report Card */}
        {showData && (
          <Paper elevation={0} sx={{ p: 0, borderRadius: 2, border: `1px solid ${theme.palette.divider}`, bgcolor: 'background.paper' }}>
            
            {/* Toolbar */}
            <Box sx={{ p: 2, bgcolor: theme.palette.mode === 'dark' ? colors.primary[400] : '#f8f9fa', borderBottom: `1px solid ${theme.palette.divider}` }}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center" justifyContent="space-between">
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  <Button 
                    size="small" 
                    startIcon={<TableViewIcon />}
                    variant="outlined"
                    onClick={handleColumnVisibility}
                    sx={{ textTransform: 'none', fontSize: '0.75rem' }}
                  >
                    {t('accounts.common.columnVisibility')}
                  </Button>
                  <Button 
                    size="small" 
                    startIcon={<ContentCopyIcon />}
                    variant="outlined"
                    onClick={() => handleExport('copy')}
                    sx={{ textTransform: 'none', fontSize: '0.75rem' }}
                  >
                    {t('accounts.common.copy')}
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
                  placeholder={t('common.search')}
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

            {/* Milk Consumption Table */}
            <TableContainer sx={{ maxHeight: 600, overflowX: 'auto' }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, bgcolor: theme.palette.mode === 'dark' ? colors.primary[400] : '#f5f5f5', border: `1px solid ${theme.palette.divider}`, minWidth: 60 }}>#</TableCell>
                    <TableCell sx={{ fontWeight: 600, bgcolor: theme.palette.mode === 'dark' ? colors.primary[400] : '#f5f5f5', border: `1px solid ${theme.palette.divider}`, minWidth: 100 }}>{t('accounts.common.columns.date')}</TableCell>
                    <TableCell sx={{ fontWeight: 600, bgcolor: theme.palette.mode === 'dark' ? colors.primary[400] : '#f5f5f5', border: `1px solid ${theme.palette.divider}`, minWidth: 80, textAlign: 'right' }}>{t('accounts.totalMilkConsumptionReport.columns.milk', { num: 1 })}</TableCell>
                    <TableCell sx={{ fontWeight: 600, bgcolor: theme.palette.mode === 'dark' ? colors.primary[400] : '#f5f5f5', border: `1px solid ${theme.palette.divider}`, minWidth: 80, textAlign: 'right' }}>{t('accounts.totalMilkConsumptionReport.columns.milk', { num: 2 })}</TableCell>
                    <TableCell sx={{ fontWeight: 600, bgcolor: theme.palette.mode === 'dark' ? colors.primary[400] : '#f5f5f5', border: `1px solid ${theme.palette.divider}`, minWidth: 80, textAlign: 'right' }}>{t('accounts.totalMilkConsumptionReport.columns.milk', { num: 3 })}</TableCell>
                    <TableCell sx={{ fontWeight: 600, bgcolor: theme.palette.mode === 'dark' ? colors.primary[400] : '#f5f5f5', border: `1px solid ${theme.palette.divider}`, minWidth: 80, textAlign: 'right' }}>{t('accounts.common.total')}</TableCell>
                    <TableCell sx={{ fontWeight: 600, bgcolor: theme.palette.mode === 'dark' ? colors.primary[400] : '#f5f5f5', border: `1px solid ${theme.palette.divider}`, minWidth: 120, textAlign: 'right' }}>{t('accounts.totalMilkConsumptionReport.columns.purchaseReturn')}</TableCell>
                    <TableCell sx={{ fontWeight: 600, bgcolor: theme.palette.mode === 'dark' ? colors.primary[400] : '#f5f5f5', border: `1px solid ${theme.palette.divider}`, minWidth: 120, textAlign: 'right' }}>{t('accounts.totalMilkConsumptionReport.columns.officeMainMilk', { num: 1 })}</TableCell>
                    <TableCell sx={{ fontWeight: 600, bgcolor: theme.palette.mode === 'dark' ? colors.primary[400] : '#f5f5f5', border: `1px solid ${theme.palette.divider}`, minWidth: 120, textAlign: 'right' }}>{t('accounts.totalMilkConsumptionReport.columns.officeMainMilk', { num: 2 })}</TableCell>
                    <TableCell sx={{ fontWeight: 600, bgcolor: theme.palette.mode === 'dark' ? colors.primary[400] : '#f5f5f5', border: `1px solid ${theme.palette.divider}`, minWidth: 120, textAlign: 'right' }}>{t('accounts.totalMilkConsumptionReport.columns.officeMainMilk', { num: 3 })}</TableCell>
                    <TableCell sx={{ fontWeight: 600, bgcolor: theme.palette.mode === 'dark' ? colors.primary[400] : '#f5f5f5', border: `1px solid ${theme.palette.divider}`, minWidth: 120, textAlign: 'right' }}>{t('accounts.totalMilkConsumptionReport.columns.calvesConsumption')}</TableCell>
                    <TableCell sx={{ fontWeight: 600, bgcolor: theme.palette.mode === 'dark' ? colors.primary[400] : '#f5f5f5', border: `1px solid ${theme.palette.divider}`, minWidth: 100, textAlign: 'right' }}>{t('accounts.totalMilkConsumptionReport.columns.localDispatch')}</TableCell>
                    <TableCell sx={{ fontWeight: 600, bgcolor: theme.palette.mode === 'dark' ? colors.primary[400] : '#f5f5f5', border: `1px solid ${theme.palette.divider}`, minWidth: 140, textAlign: 'right' }}>{t('accounts.totalMilkConsumptionReport.columns.overallRemainingMilk')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {/* Data Rows */}
                  {filteredData.map((entry) => (
                    <TableRow key={entry.id} hover>
                      <TableCell sx={{ border: `1px solid ${theme.palette.divider}` }}>{entry.srNo}</TableCell>
                      <TableCell sx={{ border: `1px solid ${theme.palette.divider}` }}>{entry.date}</TableCell>
                      <TableCell sx={{ border: `1px solid ${theme.palette.divider}`, textAlign: 'right' }}>{entry.milk1}</TableCell>
                      <TableCell sx={{ border: `1px solid ${theme.palette.divider}`, textAlign: 'right' }}>{entry.milk2}</TableCell>
                      <TableCell sx={{ border: `1px solid ${theme.palette.divider}`, textAlign: 'right' }}>{entry.milk3}</TableCell>
                      <TableCell sx={{ border: `1px solid ${theme.palette.divider}`, textAlign: 'right', fontWeight: 600 }}>{entry.total}</TableCell>
                      <TableCell sx={{ border: `1px solid ${theme.palette.divider}`, textAlign: 'right' }}>{entry.purchaseReturn}</TableCell>
                      <TableCell sx={{ border: `1px solid ${theme.palette.divider}`, textAlign: 'right' }}>{entry.officeMainMilk1.toFixed(2)}</TableCell>
                      <TableCell sx={{ border: `1px solid ${theme.palette.divider}`, textAlign: 'right' }}>{entry.officeMainMilk2.toFixed(2)}</TableCell>
                      <TableCell sx={{ border: `1px solid ${theme.palette.divider}`, textAlign: 'right' }}>{entry.officeMainMilk3.toFixed(2)}</TableCell>
                      <TableCell sx={{ border: `1px solid ${theme.palette.divider}`, textAlign: 'right' }}>{entry.calvesConsumption.toFixed(2)}</TableCell>
                      <TableCell sx={{ 
                        border: `1px solid ${theme.palette.divider}`, 
                        textAlign: 'right',
                        color: '#1976d2',
                        fontWeight: 500
                      }}>
                        {entry.localDispatch}
                      </TableCell>
                      <TableCell sx={{ 
                        border: `1px solid ${theme.palette.divider}`, 
                        textAlign: 'right',
                        color: entry.overallRemainingMilk >= 0 ? 'green' : 'red',
                        fontWeight: 500
                      }}>
                        {entry.overallRemainingMilk}
                      </TableCell>
                    </TableRow>
                  ))}
                  
                  {/* Totals Row */}
                  <TableRow sx={{ bgcolor: theme.palette.mode === 'dark' ? colors.primary[400] : '#f9f9f9' }}>
                    <TableCell sx={{ border: `1px solid ${theme.palette.divider}`, fontWeight: 600 }}>{t('accounts.common.total')}</TableCell>
                    <TableCell sx={{ border: `1px solid ${theme.palette.divider}` }}></TableCell>
                    <TableCell sx={{ border: `1px solid ${theme.palette.divider}`, textAlign: 'right', fontWeight: 600 }}>{totals.milk1.toFixed(2)}</TableCell>
                    <TableCell sx={{ border: `1px solid ${theme.palette.divider}`, textAlign: 'right', fontWeight: 600 }}>{totals.milk2.toFixed(2)}</TableCell>
                    <TableCell sx={{ border: `1px solid ${theme.palette.divider}`, textAlign: 'right', fontWeight: 600 }}>{totals.milk3.toFixed(2)}</TableCell>
                    <TableCell sx={{ border: `1px solid ${theme.palette.divider}`, textAlign: 'right', fontWeight: 600 }}>{totals.total.toFixed(2)}</TableCell>
                    <TableCell sx={{ border: `1px solid ${theme.palette.divider}`, textAlign: 'right', fontWeight: 600 }}>{totals.purchaseReturn.toFixed(2)}</TableCell>
                    <TableCell sx={{ border: `1px solid ${theme.palette.divider}`, textAlign: 'right', fontWeight: 600 }}>{totals.officeMainMilk1.toFixed(2)}</TableCell>
                    <TableCell sx={{ border: `1px solid ${theme.palette.divider}`, textAlign: 'right', fontWeight: 600 }}>{totals.officeMainMilk2.toFixed(2)}</TableCell>
                    <TableCell sx={{ border: `1px solid ${theme.palette.divider}`, textAlign: 'right', fontWeight: 600 }}>{totals.officeMainMilk3.toFixed(2)}</TableCell>
                    <TableCell sx={{ border: `1px solid ${theme.palette.divider}`, textAlign: 'right', fontWeight: 600 }}>{totals.calvesConsumption.toFixed(2)}</TableCell>
                    <TableCell sx={{ border: `1px solid ${theme.palette.divider}`, textAlign: 'right', fontWeight: 600, color: '#1976d2' }}>{totals.localDispatch.toFixed(2)}</TableCell>
                    <TableCell sx={{ border: `1px solid ${theme.palette.divider}` }}></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>

            {/* Entries Count */}
            <Box sx={{ p: 2, bgcolor: theme.palette.mode === 'dark' ? colors.primary[400] : '#f8f9fa', borderTop: `1px solid ${theme.palette.divider}` }}>
              <Typography variant="body2" color="text.secondary">
                {t('accounts.common.showingEntriesRange', { start: 1, end: filteredData.length, total: milkConsumptionData.length })}
              </Typography>
            </Box>
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

export default TotalMilkConsumptionReport;
