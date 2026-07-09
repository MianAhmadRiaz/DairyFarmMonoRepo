import React, { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Stack,
  IconButton,
  InputAdornment,
  Snackbar,
  Alert,
  useTheme
} from '@mui/material';
import {
  Print as PrintIcon,
  Search as SearchIcon,
  GetApp as GetAppIcon,
  ContentCopy as ContentCopyIcon,
  TableView as TableViewIcon,
  PictureAsPdf as PictureAsPdfIcon,
  CalendarToday as CalendarTodayIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { tokens } from '../../shared/theme/theme';
import {
  fetchChartOfAccounts,
  fetchGeneralLedger,
  ChartAccount
} from '../../shared/services/finance.service';
import PageContainer from '../../shared/components/Layout/PageContainer';

// TypeScript interfaces
interface LedgerEntry {
  id: number;
  srNo: number;
  date: string;
  narration: string;
  type: string;
  vocNo: string;
  debit: number;
  credit: number;
  balance: number;
}

interface SnackbarState {
  open: boolean;
  message: string;
  severity: 'success' | 'error';
}

const LedgerReport: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const pageBg = theme.palette.mode === 'dark' ? colors.primary[500] : '#F5FAF7';

  // State management
  const [selectedHead, setSelectedHead] = useState<string>('');
  const [accounts, setAccounts] = useState<ChartAccount[]>([]);
  const [startingDate, setStartingDate] = useState<string>('2025-04-01');
  const [endingDate, setEndingDate] = useState<string>('2025-04-30');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showData, setShowData] = useState<boolean>(false);
  const [filteredLedgerData, setFilteredLedgerData] = useState<LedgerEntry[]>([]);
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    (async () => {
      try {
        const list = await fetchChartOfAccounts({ isActive: 'true' });
        setAccounts(list);
      } catch (e) {
        console.error('Failed to load accounts', e);
      }
    })();
  }, []);

  // Head options matching the screenshot
  const headOptions = [
    'Feed Asset',
    'Medicine Asset',
    'Semen Asset', 
    'Inventory Asset',
    '[Sale of Product Income]',
    '[Feed Consumption Expense (CGS)]',
    '[MEDICINE EXPENSE]',
    'Semen Expense',
    'Other Expense',
    'Milk Asset',
    'Milk Local Sale Income',
    'Sale Discount/Adjustment Expense',
    'Purchase Discount / Bill Adjustments (I.I)',
    '[AGRICULTURE]',
    '[OFFICE] Food (Staff use)',
    '[MATERIAL]',
    'Equipment',
    '[HR HUMAN RESOURCES]',
    '[MISCELLANEOUS]',
    '[OFFICE]'
  ];

  // Sample ledger data for different heads
  const allLedgerData: { [key: string]: LedgerEntry[] } = {
    'Feed Asset': [
      {
        id: 1,
        srNo: 1,
        date: '2025-04-01',
        narration: '4 kg Canola Meal (Kg)(عال) consumed @ rate 128.5=514',
        type: 'Feed Recipe',
        vocNo: '11679',
        debit: 0,
        credit: 514,
        balance: -58055722.2
      },
      {
        id: 2,
        srNo: 2,
        date: '2025-04-01',
        narration: '1.6 kg Canola Meal (Kg)(عال) consumed @ rate 128.5=205.6',
        type: 'Feed Recipe',
        vocNo: '11683',
        debit: 0,
        credit: 205.6,
        balance: -58055927.8
      },
      {
        id: 3,
        srNo: 3,
        date: '2025-04-01',
        narration: '125.4 kg Canola Meal (Kg)(عال) consumed @ rate 128.5=16113.9',
        type: 'Feed Recipe',
        vocNo: '11684',
        debit: 0,
        credit: 16113.9,
        balance: -58072041.7
      },
      {
        id: 4,
        srNo: 4,
        date: '2025-04-01',
        narration: '5 kg Canola Meal (Kg)(عال) consumed @ rate 128.5=642.5',
        type: 'Feed Recipe',
        vocNo: '11685',
        debit: 0,
        credit: 642.5,
        balance: -58072684.2
      },
      {
        id: 5,
        srNo: 5,
        date: '2025-04-01',
        narration: '27.3 kg Canola Meal (Kg)(عال) consumed @ rate 128.5=3508.05',
        type: 'Feed Recipe',
        vocNo: '11686',
        debit: 0,
        credit: 3508.05,
        balance: -58076192.25
      }
    ],
    'Medicine Asset': [
      {
        id: 1,
        srNo: 1,
        date: '2025-04-01',
        narration: 'Veterinary Medicine Purchase - Antibiotics',
        type: 'Purchase',
        vocNo: '12001',
        debit: 5000,
        credit: 0,
        balance: 5000
      },
      {
        id: 2,
        srNo: 2,
        date: '2025-04-15',
        narration: 'Vaccination Program - Cattle',
        type: 'Medicine Usage',
        vocNo: '12002',
        debit: 0,
        credit: 1500,
        balance: 3500
      }
    ],
    'Milk Asset': [
      {
        id: 1,
        srNo: 1,
        date: '2025-04-01',
        narration: 'Fresh Milk Production - Morning Collection',
        type: 'Production',
        vocNo: '13001',
        debit: 8500,
        credit: 0,
        balance: 8500
      },
      {
        id: 2,
        srNo: 2,
        date: '2025-04-01',
        narration: 'Milk Sale to Local Distributor',
        type: 'Sale',
        vocNo: '13002',
        debit: 0,
        credit: 7000,
        balance: 1500
      }
    ]
  };

  // Opening balance
  const openingBalance = -58055208.20;

  // Handle GET Result
  const handleGetResult = async () => {
    if (!selectedHead) {
      setSnackbar({ open: true, message: t('accounts.ledgerReport.selectHeadError'), severity: 'error' });
      return;
    }

    if (!startingDate || !endingDate) {
      setSnackbar({ open: true, message: t('accounts.common.selectDatesError'), severity: 'error' });
      return;
    }
    
    try {
      const data = await fetchGeneralLedger({ accountId: Number(selectedHead), startDate: startingDate, endDate: endingDate });
      const entries: LedgerEntry[] = (data.entries || []).map((e: any, idx: number) => ({
        id: idx + 1,
        srNo: idx + 1,
        date: e.date,
        narration: e.description || '',
        type: e.contra_account || '',
        vocNo: e.transaction_number || String(e.transaction_id || ''),
        debit: Number(e.debit) || 0,
        credit: Number(e.credit) || 0,
        balance: Number(e.balance) || 0
      }));
      setFilteredLedgerData(entries);
      setShowData(true);
      setSnackbar({ open: true, message: t('accounts.ledgerReport.reportSuccess'), severity: 'success' });
    } catch (err) {
      console.error('Failed to load ledger', err);
      setSnackbar({ open: true, message: t('accounts.ledgerReport.reportError'), severity: 'error' });
    }
  };

  // Handle Print
  const handlePrint = () => {
    const printContent = `
      <html>
        <head>
          <title>${t('accounts.ledgerReport.titleWithHead', { head: selectedHead })}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #005f73; padding-bottom: 10px; }
            .date-range { text-align: center; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px; }
            th { background-color: #f2f2f2; font-weight: bold; }
            .opening-balance { font-weight: bold; background-color: #f9f9f9; }
            .balance-positive { color: green; }
            .balance-negative { color: red; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>${t('accounts.ledgerReport.title')}</h2>
            <h3>${selectedHead}</h3>
          </div>
          <div class="date-range">
            <p>${t('accounts.common.period', { start: startingDate, end: endingDate })}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>${t('accounts.common.columns.srNo')}</th>
                <th>${t('accounts.common.columns.date')}</th>
                <th>${t('accounts.common.columns.narration')}</th>
                <th>${t('accounts.common.columns.type')}</th>
                <th>${t('accounts.common.columns.vocNo')}</th>
                <th>${t('accounts.common.columns.debit')}</th>
                <th>${t('accounts.common.columns.credit')}</th>
                <th>${t('accounts.common.columns.balance')}</th>
              </tr>
            </thead>
            <tbody>
              <tr class="opening-balance">
                <td colspan="7" style="text-align: center;"><strong>${t('accounts.common.openingBalance')}</strong></td>
                <td><strong>${openingBalance.toLocaleString()}</strong></td>
              </tr>
              ${filteredLedgerData.map((entry: LedgerEntry) => `
                <tr>
                  <td>${entry.srNo}</td>
                  <td>${entry.date}</td>
                  <td>${entry.narration}</td>
                  <td>${entry.type}</td>
                  <td>${entry.vocNo}</td>
                  <td>${entry.debit || ''}</td>
                  <td>${entry.credit || ''}</td>
                  <td class="${entry.balance >= 0 ? 'balance-positive' : 'balance-negative'}">${entry.balance.toLocaleString()}</td>
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
      [t('accounts.common.columns.srNo'), t('accounts.common.columns.date'), t('accounts.common.columns.narration'), t('accounts.common.columns.type'), t('accounts.common.columns.vocNo'), t('accounts.common.columns.debit'), t('accounts.common.columns.credit'), t('accounts.common.columns.balance')],
      ...filteredLedgerData.map((entry: LedgerEntry) => [
        entry.srNo,
        entry.date,
        entry.narration,
        entry.type,
        entry.vocNo,
        entry.debit,
        entry.credit,
        entry.balance
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `ledger_report_${selectedHead.replace(/[^a-zA-Z0-9]/g, '_')}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Handle Excel export
  const handleExcelExport = () => {
    const xlsContent = [
      [t('accounts.common.columns.srNo'), t('accounts.common.columns.date'), t('accounts.common.columns.narration'), t('accounts.common.columns.type'), t('accounts.common.columns.vocNo'), t('accounts.common.columns.debit'), t('accounts.common.columns.credit'), t('accounts.common.columns.balance')].join('\t'),
      ...filteredLedgerData.map((entry: LedgerEntry) => 
        `${entry.srNo}\t${entry.date}\t${entry.narration}\t${entry.type}\t${entry.vocNo}\t${entry.debit}\t${entry.credit}\t${entry.balance}`
      )
    ].join('\n');

    const blob = new Blob([xlsContent], { type: 'application/vnd.ms-excel' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `ledger_report_${selectedHead.replace(/[^a-zA-Z0-9]/g, '_')}.xls`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Handle Copy to clipboard
  const handleCopy = () => {
    const textContent = [
      [t('accounts.common.columns.srNo'), t('accounts.common.columns.date'), t('accounts.common.columns.narration'), t('accounts.common.columns.type'), t('accounts.common.columns.vocNo'), t('accounts.common.columns.debit'), t('accounts.common.columns.credit'), t('accounts.common.columns.balance')].join('\t'),
      ...filteredLedgerData.map((entry: LedgerEntry) => 
        `${entry.srNo}\t${entry.date}\t${entry.narration}\t${entry.type}\t${entry.vocNo}\t${entry.debit}\t${entry.credit}\t${entry.balance}`
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
            <title>${t('accounts.ledgerReport.pdfTitleWithHead', { head: selectedHead })}</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              table { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 10px; }
              th, td { border: 1px solid #ddd; padding: 4px; text-align: left; }
              th { background-color: #f2f2f2; font-weight: bold; }
              .header { text-align: center; margin-bottom: 20px; }
            </style>
          </head>
          <body>
            <div class="header">
              <h2>${t('accounts.ledgerReport.titleWithHead', { head: selectedHead })}</h2>
              <p>${t('accounts.common.period', { start: startingDate, end: endingDate })}</p>
            </div>
            <table>
              <thead>
                <tr>
                  <th>${t('accounts.common.columns.srNo')}</th>
                  <th>${t('accounts.common.columns.date')}</th>
                  <th>${t('accounts.common.columns.narration')}</th>
                  <th>${t('accounts.common.columns.type')}</th>
                  <th>${t('accounts.common.columns.vocNo')}</th>
                  <th>${t('accounts.common.columns.debit')}</th>
                  <th>${t('accounts.common.columns.credit')}</th>
                  <th>${t('accounts.common.columns.balance')}</th>
                </tr>
              </thead>
              <tbody>
                ${filteredLedgerData.map((entry: LedgerEntry) => `
                  <tr>
                    <td>${entry.srNo}</td>
                    <td>${entry.date}</td>
                    <td>${entry.narration}</td>
                    <td>${entry.type}</td>
                    <td>${entry.vocNo}</td>
                    <td>${entry.debit}</td>
                    <td>${entry.credit}</td>
                    <td>${entry.balance}</td>
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
  const filteredData = filteredLedgerData.filter((entry: LedgerEntry) =>
    entry.narration.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.vocNo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <PageContainer title={t('accounts.ledgerReport.title')}>
        {/* Selection Controls */}
        <Paper elevation={0} sx={{ p: 3, mb: 2, borderRadius: 2, border: `1px solid ${theme.palette.divider}`, bgcolor: 'background.paper' }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems="center" justifyContent="space-between">
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} alignItems="center">
              {/* Select Head Dropdown */}
              <FormControl sx={{ minWidth: 200 }}>
                <InputLabel>{t('accounts.ledgerReport.selectHead')}</InputLabel>
                <Select
                  value={selectedHead}
                  onChange={(e) => setSelectedHead(e.target.value)}
                  label={t('accounts.ledgerReport.selectHead')}
                  size="small"
                >
                  {accounts.map((a) => (
                    <MenuItem key={a.id} value={String(a.id)}>
                      {a.account_code} - {a.account_name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
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

        {/* Main Ledger Report Card */}
        {showData && (
          <Paper elevation={0} sx={{ p: 0, borderRadius: 2, border: `1px solid ${theme.palette.divider}`, bgcolor: 'background.paper' }}>
            
            {/* Header with Print Button */}
            <Box
              sx={{
                bgcolor: '#4a5568',
                color: 'white',
                px: 2.5,
                py: 1.5,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Typography variant="h6" fontWeight={600} sx={{ display: 'flex', alignItems: 'center' }}>
                📊 {t('accounts.ledgerReport.title')}
              </Typography>
              <IconButton onClick={handlePrint} sx={{ color: 'white' }}>
                <PrintIcon />
              </IconButton>
            </Box>

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
                    onClick={() => handleExport('csv')}
                    sx={{ textTransform: 'none', fontSize: '0.75rem' }}
                  >
                    CSV
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

            {/* Ledger Table */}
            <TableContainer sx={{ maxHeight: 600 }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, bgcolor: theme.palette.mode === 'dark' ? colors.primary[400] : '#f5f5f5', border: `1px solid ${theme.palette.divider}` }}>{t('accounts.common.columns.srNo')}</TableCell>
                    <TableCell sx={{ fontWeight: 600, bgcolor: theme.palette.mode === 'dark' ? colors.primary[400] : '#f5f5f5', border: `1px solid ${theme.palette.divider}` }}>{t('accounts.common.columns.date')}</TableCell>
                    <TableCell sx={{ fontWeight: 600, bgcolor: theme.palette.mode === 'dark' ? colors.primary[400] : '#f5f5f5', border: `1px solid ${theme.palette.divider}` }}>{t('accounts.common.columns.narration')}</TableCell>
                    <TableCell sx={{ fontWeight: 600, bgcolor: theme.palette.mode === 'dark' ? colors.primary[400] : '#f5f5f5', border: `1px solid ${theme.palette.divider}` }}>{t('accounts.common.columns.type')}</TableCell>
                    <TableCell sx={{ fontWeight: 600, bgcolor: theme.palette.mode === 'dark' ? colors.primary[400] : '#f5f5f5', border: `1px solid ${theme.palette.divider}` }}>{t('accounts.common.columns.vocNo')}</TableCell>
                    <TableCell sx={{ fontWeight: 600, bgcolor: theme.palette.mode === 'dark' ? colors.primary[400] : '#f5f5f5', border: `1px solid ${theme.palette.divider}`, textAlign: 'right' }}>{t('accounts.common.columns.debit')}</TableCell>
                    <TableCell sx={{ fontWeight: 600, bgcolor: theme.palette.mode === 'dark' ? colors.primary[400] : '#f5f5f5', border: `1px solid ${theme.palette.divider}`, textAlign: 'right' }}>{t('accounts.common.columns.credit')}</TableCell>
                    <TableCell sx={{ fontWeight: 600, bgcolor: theme.palette.mode === 'dark' ? colors.primary[400] : '#f5f5f5', border: `1px solid ${theme.palette.divider}`, textAlign: 'right' }}>{t('accounts.common.columns.balance')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {/* Opening Balance Row */}
                  <TableRow sx={{ bgcolor: theme.palette.mode === 'dark' ? colors.primary[400] : '#f9f9f9' }}>
                    <TableCell colSpan={7} sx={{ textAlign: 'center', fontWeight: 600, border: `1px solid ${theme.palette.divider}` }}>
                      {t('accounts.common.openingBalance')}
                    </TableCell>
                    <TableCell sx={{ textAlign: 'right', fontWeight: 600, border: `1px solid ${theme.palette.divider}` }}>
                      {openingBalance.toLocaleString()}
                    </TableCell>
                  </TableRow>
                  
                  {/* Data Rows */}
                  {filteredData.map((entry) => (
                    <TableRow key={entry.id} hover>
                      <TableCell sx={{ border: `1px solid ${theme.palette.divider}` }}>{entry.srNo}</TableCell>
                      <TableCell sx={{ border: `1px solid ${theme.palette.divider}` }}>{entry.date}</TableCell>
                      <TableCell sx={{ border: `1px solid ${theme.palette.divider}`, maxWidth: 300 }}>
                        <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                          {entry.narration}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ border: `1px solid ${theme.palette.divider}` }}>
                        <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                          {entry.type}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ border: `1px solid ${theme.palette.divider}` }}>
                        <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                          {entry.vocNo}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ border: `1px solid ${theme.palette.divider}`, textAlign: 'right' }}>
                        {entry.debit > 0 ? entry.debit.toLocaleString() : ''}
                      </TableCell>
                      <TableCell sx={{ border: `1px solid ${theme.palette.divider}`, textAlign: 'right' }}>
                        {entry.credit > 0 ? entry.credit.toLocaleString() : ''}
                      </TableCell>
                      <TableCell 
                        sx={{ 
                          border: `1px solid ${theme.palette.divider}`, 
                          textAlign: 'right',
                          color: entry.balance >= 0 ? 'green' : 'red',
                          fontWeight: 500
                        }}
                      >
                        {entry.balance.toLocaleString()}
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

export default LedgerReport;
