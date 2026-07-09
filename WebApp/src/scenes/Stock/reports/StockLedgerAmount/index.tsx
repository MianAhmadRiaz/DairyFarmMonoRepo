import React, { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  TextField,
  Paper,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  SelectChangeEvent,
  CardContent,
  Grid,
  Card,
  useMediaQuery,
  useTheme,
  Typography
} from '@mui/material';
import {
  ContentCopy as CopyIcon,
  FileDownload as CSVIcon,
  PictureAsPdf as PDFIcon,
  Print as PrintIcon,
  Visibility as VisibilityIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import PageContainer from '../../../../shared/components/Layout/PageContainer';
import TableControls from '../../../../shared/components/TableControls';
import { exportToCSV } from '../../../../shared/utils/exportUtils';
import { tokens } from '../../../../shared/theme/theme';
import { useTranslation } from 'react-i18next';
interface StockLedgerItem {
  id?: number;
  type: string;
  date: string;
  in?: number;
  out?: number;
  balance: number;
  rateUnit?: number;
  assetAmount?: number;
  assetBalance: number;
}

interface AnimalWiseCostTableProps {
  data: StockLedgerItem[];
  startDate: string;
  endDate: string;
  onDateChange: (startDate: string, endDate: string) => void;
}

const StockLedgerAmount: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const stockLedgerData: StockLedgerItem[] = [
    {
      type: 'Opening Quantity',
      date: '',
      balance: 262.38,
      assetBalance: -229095.929999999
    },
    {
      id: 1,
      type: 'Feed Recipe Consumed',
      date: '01-Apr-2025',
      out: 0.85,
      balance: 261.47,
      rateUnit: 168,
      assetAmount: 142.8,
      assetBalance: -229238.73
    },
    {
      id: 2,
      type: 'Feed Recipe Consumed',
      date: '01-Apr-2025',
      out: 3.04,
      balance: 258.43,
      rateUnit: 168,
      assetAmount: 510.72,
      assetBalance: -229749.45
    },
    {
      id: 3,
      type: 'Feed Recipe Consumed',
      date: '01-Apr-2025',
      out: 0.14,
      balance: 258.29,
      rateUnit: 168,
      assetAmount: 23.52,
      assetBalance: -229772.97
    },
    {
      id: 4,
      type: 'Feed Recipe Consumed',
      date: '01-Apr-2025',
      out: 0.25,
      balance: 258.04,
      rateUnit: 168,
      assetAmount: 42,
      assetBalance: -229814.97
    }
  ];

  const [startDate, setStartDate] = useState('2025-04-14');
  const [endDate, setEndDate] = useState('2025-04-14');
  const handleDateChange = (newStartDate: string, newEndDate: string) => {
    setStartDate(newStartDate);
    setEndDate(newEndDate);
  };

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sexFilter, setSexFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [itemNameFilter, setItemNameFilter] = useState('');
  const [localStartDate, setLocalStartDate] = useState(startDate);
  const [localEndDate, setLocalEndDate] = useState(endDate);
  const uniqueStatuses = Array.from(
    new Set(stockLedgerData.map(item => item.type))
  );
  const uniqueSexes = Array.from(
    new Set(stockLedgerData.map(item => item.type))
  );
  const uniqueCategories = Array.from(
    new Set(stockLedgerData.map(item => item.type))
  );
  const uniqueItemNames = Array.from(
    new Set(stockLedgerData.map(item => item.type))
  );

  const filteredData = stockLedgerData.filter(item => {
    const matchesSearch = item.type
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || item.type === statusFilter;
    const matchesSex = !sexFilter || item.type === sexFilter;
    const matchesCategory = !categoryFilter || item.type === categoryFilter;
    const matchesItemName = !itemNameFilter || item.type === itemNameFilter;

    return (
      matchesSearch &&
      matchesStatus &&
      matchesSex &&
      matchesCategory &&
      matchesItemName
    );
  });

  const [columns, setColumns] = useState([
    { id: 'id', label: '#', visible: true },
    { id: 'type', label: t('stock.stockLedger.type'), visible: true },
    { id: 'date', label: t('stock.common.date'), visible: true },
    { id: 'in', label: t('stock.stockLedgerAmount.in'), visible: true },
    { id: 'out', label: t('stock.stockLedgerAmount.out'), visible: true },
    { id: 'balance', label: t('stock.stockLedgerAmount.balance'), visible: true },
    { id: 'rateUnit', label: t('stock.stockLedgerAmount.rateUnit'), visible: true },
    { id: 'assetAmount', label: t('stock.stockLedgerAmount.assetAmount'), visible: true },
    { id: 'assetBalance', label: t('stock.stockLedgerAmount.assetBalance'), visible: true }
  ]);

  const handleColumnVisibilityChange = (columnId: string) => {
    setColumns(columns.map(col => 
      col.id === columnId ? { ...col, visible: !col.visible } : col
    ));
  };

  const handleCopy = () => {
    console.log('Copy clicked');
  };

  const handleCSV = () => {
    exportToCSV(stockLedgerData, 'stock_ledger_amount_report');
  };

  const handlePDF = () => {
    console.log('PDF clicked');
  };

  const handlePrint = () => {
    console.log('Print clicked');
  };

  return (
    <PageContainer title={t('stock.stockLedgerAmount.title')}>
      <Alert severity="warning" sx={{ mb: 2 }}>
        {t('stock.common.reportNotConnected')}
      </Alert>

  <Box sx={{ overflowX: 'auto' }}>
  <Typography
    sx={{
      fontSize: 20,
      color: '#2CA58D',
      mb: 2,
      whiteSpace: 'nowrap',   // ⬅ ensures one line
      width: 'max-content'
    }}
  >
    {t('stock.stockLedgerAmount.reportPeriod', { start: localStartDate, end: localEndDate })}
  </Typography>
</Box>
      <Paper
        elevation={3}
        sx={{
         
          borderRadius: '8px',
          backgroundColor: theme.palette.background.paper,
          boxShadow: theme.palette.mode === 'dark' ? '0 4px 12px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.1)',
          overflowX: 'auto'
        }}
      >
       
        <Box
          sx={{
             p: { xs: 1, sm: 2 },
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
                  value={localStartDate}
                  onChange={e => setLocalStartDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  type="date"
                  label={t('stock.common.endDate')}
                  size="small"
                  fullWidth
                  value={localEndDate}
                  onChange={e => setLocalEndDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} md={4} sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="contained"
                  fullWidth={isMobile}
                  sx={{
                    backgroundColor: '#005f73',
                    '&:hover': {
                      backgroundColor: '#003844'
                    },
                    flex: 1
                  }}
                >
                  {t('stock.stockLedgerAmount.getResult')}
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<PrintIcon />}
                  onClick={handlePrint}
                  sx={{
                    borderColor: '#005f73',
                    color: '#005f73',
                    display: { xs: 'none', sm: 'flex' }
                  }}
                >
                  {t('stock.common.print')}
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Box>

        <Box
          sx={{
            mb: 3,
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 2,
            flexWrap: 'wrap'
          }}
        >
          <FormControl size="small" sx={{  width: { xs: '84%', sm: '20%' }, ml:{xs:2,md:4}}}>
            <InputLabel>{t('stock.common.itemName')}</InputLabel>
            <Select
              value={itemNameFilter}
              label={t('stock.common.itemName')}
              onChange={e => setItemNameFilter(e.target.value)}
            >
              <MenuItem value="">{t('stock.common.all')}</MenuItem>
              {uniqueItemNames.map(name => (
                <MenuItem key={name} value={name}>
                  {name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <Box
          sx={{
            mb: 3,
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 1,
            alignItems: { xs: 'stretch', sm: 'center' },
            p: 1,
            borderBottom: '1px solid #e0e0e0'
          }}
        >
          <TableControls
            columns={columns}
            onColumnVisibilityChange={handleColumnVisibilityChange}
            onCopy={handleCopy}
            onCSV={handleCSV}
            onPDF={handlePDF}
            onPrint={handlePrint}
          />
          <Box
            sx={{
              flexGrow: 1,
              display: 'flex',
              alignItems: 'center',
              mt: { xs: 2, sm: 0 }
            }}
          >
            <Box
              component="span"
              sx={{
                mr: 1,
                color: '#666',
                display: { xs: 'none', sm: 'block' }
              }}
            >
              {t('stock.common.searchLabel')}
            </Box>
            <TextField
              size="small"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder={t('stock.common.searchPlaceholder')}
              fullWidth
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '4px',
                  backgroundColor: '#fff'
                }
              }}
            />
          </Box>
        </Box>

        <TableContainer
          sx={{
            maxHeight: { xs: '400px', sm: 'none' },
            overflowX: 'auto'
          }}
        >
          <Table size={isMobile ? 'small' : 'medium'}>
            <TableHead>
              <TableRow sx={{ backgroundColor: theme.palette.mode === 'dark' ? colors.primary[400] : '#F8F9FA' }}>
                {columns.map(column => (
                  column.visible && (
                    <TableCell
                      key={column.id}
                      sx={{
                        color: 'black',
                        fontWeight: 'bold',
                        minWidth: { xs: '50px', sm: 'auto' }
                      }}
                    >
                      {column.label}
                    </TableCell>
                  )
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredData.map(item => (
                <TableRow
                  key={item.id}
                  sx={{
                    '&:hover': { backgroundColor: '#f5f5f5' },
                    '& td': {
                      py: 1.5,
                      borderBottom: '1px solid #e0e0e0',
                      fontSize: { xs: '0.75rem', sm: '0.875rem' }
                    }
                  }}
                >
                  {columns.map(column => (
                    column.visible && (
                      <TableCell key={column.id}>
                        {item[column.id as keyof StockLedgerItem]}
                      </TableCell>
                    )
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </PageContainer>
  );
};

export default StockLedgerAmount;
