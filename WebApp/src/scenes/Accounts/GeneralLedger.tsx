import React, { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  useTheme,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Alert,
  Snackbar,
  MenuItem,
  InputAdornment,
} from '@mui/material';
import PrintIcon from '@mui/icons-material/Print';
import SearchIcon from '@mui/icons-material/Search';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import GetAppIcon from '@mui/icons-material/GetApp';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import TableViewIcon from '@mui/icons-material/TableView';
import { tokens } from '../../shared/theme/theme';
import {
  fetchChartOfAccounts,
  fetchGeneralLedger,
  ChartAccount
} from '../../shared/services/finance.service';
import PageContainer from '../../shared/components/Layout/PageContainer';

interface LedgerEntry {
  id: number;
  srNo: number;
  date: string;
  narration: string;
  name: string;
  type: string;
  debit: number;
  credit: number;
  balance: number;
}

export default function GeneralLedger() {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const pageBg = theme.palette.mode === 'dark' ? colors.primary[500] : '#F5FAF7';

  // State management
  const [startingDate, setStartingDate] = useState('2025-04-01');
  const [endingDate, setEndingDate] = useState('2025-04-30');
  const [searchTerm, setSearchTerm] = useState('');
  const [accounts, setAccounts] = useState<ChartAccount[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  const [filteredLedgerData, setFilteredLedgerData] = useState<LedgerEntry[]>([]);
  const [showData, setShowData] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState({
    srNo: true,
    date: true,
    narration: true,
    name: true,
    type: true,
    debit: true,
    credit: true,
    balance: true
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  useEffect(() => {
    (async () => {
      try {
        const list = await fetchChartOfAccounts();
        setAccounts(list);
      } catch (e) {
        console.error('Failed to load accounts', e);
      }
    })();
  }, []);

  // Sample ledger data matching the screenshot
  const [allLedgerData] = useState<LedgerEntry[]>([
    {
      id: 1,
      srNo: 1,
      date: '2025-04-01',
      narration: 'Mukhtar Ahmad, Lucerne advance, Paid cash',
      name: 'Mukhtar Ahmad (Lucerne Vendor)',
      type: 'CPV',
      debit: 0,
      credit: 2000,
      balance: -48471773.74
    },
    {
      id: 2,
      srNo: 2,
      date: '2025-04-01',
      narration: 'National Hardware, Staff washingmachine [MAINTENANCE] Electrical repair, 1 Belt, Paid cash',
      name: '[MAINTENANCE] Electrical maintenance',
      type: 'CPV',
      debit: 0,
      credit: 170,
      balance: -48471943.74
    },
    {
      id: 3,
      srNo: 3,
      date: '2025-04-01',
      narration: 'Sweets (Staff Mess)(1016.667 rate*6 kg qty)=6,100.00 purchased against [CASH IN HAND]',
      name: '[HR][STAFF MESS] Cooking Material (Meals)',
      type: 'Purchase',
      debit: 0,
      credit: 6100,
      balance: -48478043.74
    },
    {
      id: 4,
      srNo: 4,
      date: '2025-04-01',
      narration: 'Cold Drinks (Staff Mess)(150 rate*6 Each qty)=900.00 purchased against [CASH IN HAND]',
      name: '[HR][STAFF MESS] Cooking Material (Tea)',
      type: 'Purchase',
      debit: 0,
      credit: 900,
      balance: -48478943.74
    },
    {
      id: 5,
      srNo: 5,
      date: '2025-04-01',
      narration: 'Al Sheaths (MiniTube)(8 rate*50 Each qty)=400.00 purchased against [CASH IN HAND]',
      name: '[Medicine] Consumables',
      type: 'Purchase',
      debit: 0,
      credit: 400,
      balance: -48479343.74
    },
    {
      id: 6,
      srNo: 6,
      date: '2025-04-01',
      narration: 'Staff Medicine Bill (Approved))(410 rate*1 Each qty)=410.00 purchased against [CASH IN HAND]',
      name: '[HR][SALARY] Staff Medical Expense',
      type: 'Purchase',
      debit: 0,
      credit: 410,
      balance: -48479753.74
    },
    {
      id: 7,
      srNo: 7,
      date: '2025-04-15',
      narration: 'Feed Purchase from Supplier ABC',
      name: 'Feed Purchase',
      type: 'Purchase',
      debit: 0,
      credit: 5000,
      balance: -48484753.74
    },
    {
      id: 8,
      srNo: 8,
      date: '2025-04-20',
      narration: 'Milk Sales to Customer XYZ',
      name: 'Milk Sales Revenue',
      type: 'Sales',
      debit: 8000,
      credit: 0,
      balance: -48476753.74
    },
    {
      id: 9,
      srNo: 9,
      date: '2025-04-25',
      narration: 'Veterinary Services - Dr. Ahmed',
      name: 'Veterinary Expenses',
      type: 'CPV',
      debit: 0,
      credit: 1500,
      balance: -48478253.74
    },
    {
      id: 10,
      srNo: 10,
      date: '2025-04-30',
      narration: 'Equipment Maintenance - Milking Machine',
      name: 'Equipment Maintenance',
      type: 'CPV',
      debit: 0,
      credit: 2500,
      balance: -48480753.74
    }
  ]);

  // Opening balance
  const openingBalance = -48469773.74;

  // Handle GET Result
  const handleGetResult = async () => {
    if (!selectedAccountId) {
      setSnackbar({ open: true, message: 'Please select an account', severity: 'error' });
      return;
    }
    if (!startingDate || !endingDate) {
      setSnackbar({ open: true, message: 'Please select both starting and ending dates', severity: 'error' });
      return;
    }

    try {
      const data = await fetchGeneralLedger({
        accountId: Number(selectedAccountId),
        startDate: startingDate,
        endDate: endingDate
      });
      const mapped: LedgerEntry[] = (data.entries || []).map(
        (e: { transaction_id: number; date: string; description: string; contra_account: string; transaction_number: string; debit: number; credit: number; balance: number }, idx: number) => ({
          id: e.transaction_id,
          srNo: idx + 1,
          date: e.date,
          narration: e.description || '',
          name: e.contra_account || e.transaction_number,
          type: e.debit > 0 ? 'Debit' : 'Credit',
          debit: Number(e.debit) || 0,
          credit: Number(e.credit) || 0,
          balance: Number(e.balance) || 0
        })
      );
      setFilteredLedgerData(mapped);
      setShowData(true);
      setSnackbar({ open: true, message: 'Ledger report generated successfully!', severity: 'success' });
    } catch (e) {
      console.error('Failed to load general ledger', e);
      setSnackbar({ open: true, message: 'Failed to generate ledger report.', severity: 'error' });
    }
  };

  // Handle CSV export
  const handleCsvExport = () => {
    const dataToExport = showData ? filteredLedgerData : allLedgerData;
    const csvContent = [
      ['Sr#', 'Date', 'Narration', 'Name', 'Type', 'Debit', 'Credit', 'Balance'],
      ...dataToExport.map((entry: LedgerEntry) => [
        entry.srNo,
        entry.date,
        entry.narration,
        entry.name,
        entry.type,
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
      link.setAttribute('download', 'general_ledger.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Handle Excel export
  const handleExcelExport = () => {
    const dataToExport = showData ? filteredLedgerData : allLedgerData;
    const xlsContent = [
      'Sr#\tDate\tNarration\tName\tType\tDebit\tCredit\tBalance',
      ...dataToExport.map((entry: LedgerEntry) => 
        `${entry.srNo}\t${entry.date}\t${entry.narration}\t${entry.name}\t${entry.type}\t${entry.debit}\t${entry.credit}\t${entry.balance}`
      )
    ].join('\n');

    const blob = new Blob([xlsContent], { type: 'application/vnd.ms-excel' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'general_ledger.xls');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Handle Copy to clipboard
  const handleCopy = () => {
    const dataToExport = showData ? filteredLedgerData : allLedgerData;
    const textContent = [
      'Sr#\tDate\tNarration\tName\tType\tDebit\tCredit\tBalance',
      ...dataToExport.map((entry: LedgerEntry) => 
        `${entry.srNo}\t${entry.date}\t${entry.narration}\t${entry.name}\t${entry.type}\t${entry.debit}\t${entry.credit}\t${entry.balance}`
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
    const dataToExport = showData ? filteredLedgerData : allLedgerData;
    const pdfWindow = window.open('', '_blank');
    if (pdfWindow) {
      pdfWindow.document.write(`
        <html>
          <head>
            <title>General Ledger PDF</title>
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
              <h2>General Ledger Report</h2>
              <p>Period: ${startingDate} to ${endingDate}</p>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Sr#</th>
                  <th>Date</th>
                  <th>Narration</th>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Debit</th>
                  <th>Credit</th>
                  <th>Balance</th>
                </tr>
              </thead>
              <tbody>
                ${dataToExport.map((entry: LedgerEntry) => `
                  <tr>
                    <td>${entry.srNo}</td>
                    <td>${entry.date}</td>
                    <td>${entry.narration}</td>
                    <td>${entry.name}</td>
                    <td>${entry.type}</td>
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

  // Handle print
  const handlePrint = () => {
    const printContent = `
      <html>
        <head>
          <title>General Ledger Report</title>
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
            <h2>General Ledger Report</h2>
          </div>
          <div class="date-range">
            <p><strong>Period:</strong> ${startingDate} to ${endingDate}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>Sr.#</th>
                <th>Date</th>
                <th>Narration</th>
                <th>Name</th>
                <th>Type</th>
                <th>Debit</th>
                <th>Credit</th>
                <th>Balance</th>
              </tr>
            </thead>
            <tbody>
              <tr class="opening-balance">
                <td colspan="7" style="text-align: center;"><strong>Opening Balance</strong></td>
                <td><strong>${openingBalance.toLocaleString()}</strong></td>
              </tr>
              ${filteredLedgerData.map((entry: LedgerEntry) => `
                <tr>
                  <td>${entry.srNo}</td>
                  <td>${entry.date}</td>
                  <td>${entry.narration}</td>
                  <td>${entry.name}</td>
                  <td>${entry.type}</td>
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

  // Filter data based on search term and date range
  const filteredData = (showData ? filteredLedgerData : allLedgerData).filter((entry: LedgerEntry) =>
    entry.narration.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <PageContainer title="General Ledger">
        {/* Date Range Selection */}
        <Paper elevation={0} sx={{ p: 3, mb: 2, borderRadius: 2, border: `1px solid ${theme.palette.divider}`, bgcolor: 'background.paper' }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems="center" justifyContent="space-between">
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} alignItems="center">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2" fontWeight={600}>Account:</Typography>
                <TextField
                  select
                  size="small"
                  value={selectedAccountId}
                  onChange={(e) => setSelectedAccountId(e.target.value)}
                  sx={{ minWidth: 240 }}
                >
                  <MenuItem value="" disabled>Select account</MenuItem>
                  {accounts.map((a) => (
                    <MenuItem key={a.id} value={String(a.id)}>
                      {a.account_code} - {a.account_name}
                    </MenuItem>
                  ))}
                </TextField>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CalendarTodayIcon sx={{ color: '#005f73' }} />
                <Typography variant="body2" fontWeight={600}>Starting Date:</Typography>
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
                <Typography variant="body2" fontWeight={600}>Ending Date:</Typography>
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
              GET Result
            </Button>
          </Stack>
        </Paper>

        {/* Main Ledger Report Card */}
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
              📊 Ledger Report
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

          {/* Ledger Table */}
          <TableContainer sx={{ maxHeight: 600 }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600, bgcolor: '#f5f5f5', border: '1px solid #e0e0e0' }}>Sr.#</TableCell>
                  <TableCell sx={{ fontWeight: 600, bgcolor: '#f5f5f5', border: '1px solid #e0e0e0' }}>Date</TableCell>
                  <TableCell sx={{ fontWeight: 600, bgcolor: '#f5f5f5', border: '1px solid #e0e0e0' }}>Narration</TableCell>
                  <TableCell sx={{ fontWeight: 600, bgcolor: '#f5f5f5', border: '1px solid #e0e0e0' }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: 600, bgcolor: '#f5f5f5', border: '1px solid #e0e0e0' }}>Type</TableCell>
                  <TableCell sx={{ fontWeight: 600, bgcolor: '#f5f5f5', border: '1px solid #e0e0e0', textAlign: 'right' }}>Debit</TableCell>
                  <TableCell sx={{ fontWeight: 600, bgcolor: '#f5f5f5', border: '1px solid #e0e0e0', textAlign: 'right' }}>Credit</TableCell>
                  <TableCell sx={{ fontWeight: 600, bgcolor: '#f5f5f5', border: '1px solid #e0e0e0', textAlign: 'right' }}>Balance</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {/* Opening Balance Row */}
                <TableRow sx={{ bgcolor: '#f9f9f9' }}>
                  <TableCell colSpan={7} sx={{ textAlign: 'center', fontWeight: 600, border: '1px solid #e0e0e0' }}>
                    Opening Balance
                  </TableCell>
                  <TableCell sx={{ textAlign: 'right', fontWeight: 600, border: '1px solid #e0e0e0' }}>
                    {openingBalance.toLocaleString()}
                  </TableCell>
                </TableRow>
                
                {/* Data Rows */}
                {filteredData.map((entry) => (
                  <TableRow key={entry.id} hover>
                    <TableCell sx={{ border: '1px solid #e0e0e0' }}>{entry.srNo}</TableCell>
                    <TableCell sx={{ border: '1px solid #e0e0e0' }}>{entry.date}</TableCell>
                    <TableCell sx={{ border: '1px solid #e0e0e0', maxWidth: 300 }}>
                      <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                        {entry.narration}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ border: '1px solid #e0e0e0' }}>
                      <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                        {entry.name}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ border: '1px solid #e0e0e0' }}>
                      <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                        {entry.type}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ border: '1px solid #e0e0e0', textAlign: 'right' }}>
                      {entry.debit || ''}
                    </TableCell>
                    <TableCell sx={{ border: '1px solid #e0e0e0', textAlign: 'right' }}>
                      {entry.credit || ''}
                    </TableCell>
                    <TableCell 
                      sx={{ 
                        border: '1px solid #e0e0e0', 
                        textAlign: 'right',
                        color: entry.balance >= 0 ? 'green' : 'red'
                      }}
                    >
                      {entry.balance.toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Footer */}
          <Box sx={{ p: 2, bgcolor: theme.palette.mode === 'dark' ? colors.primary[400] : '#f8f9fa', borderTop: `1px solid ${theme.palette.divider}` }}>
            <Typography variant="body2" color="text.secondary">
              Showing {filteredData.length} entries
            </Typography>
          </Box>
        </Paper>

        {/* Success/Error Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
    </PageContainer>
  );
}
