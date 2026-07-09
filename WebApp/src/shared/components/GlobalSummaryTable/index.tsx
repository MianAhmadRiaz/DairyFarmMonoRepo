import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Card,
  IconButton,
  TextField,
  Paper,
  CardContent,
  Grid,
  useMediaQuery,
  useTheme,
  Menu,
  MenuItem,
  Checkbox
} from '@mui/material';
import { tokens } from '../../theme/theme.jsx';
import {
  ContentCopy as CopyIcon,
  FileDownload as CSVIcon,
  PictureAsPdf as PDFIcon,
  Print as PrintIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import { InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { exportToCSV } from '../../utils/exportUtils';

import useLayoutShift from '../../../shared/components/Hooks/useLayoutShift';
import PageContainer from '../../../shared/components/Layout/PageContainer';

interface SummaryItem {
  id: number;
  code: string;
  products: string;
  type: string;
  opening: {
    qty: number,
    amount: number
  };
  purchase: {
    qty: number,
    rate: number,
    amount: number
  };
  consumption: {
    qty: number,
    rate: number,
    amount: number
  };
  saleReturn: {
    qty: number,
    amount: number
  };
  closing: {
    qty: number,
    amount: number
  };
}

interface GlobalSummaryTableProps {
  title: string;
  startDate: string;
  endDate: string;
  data: SummaryItem[];
  onDateChange?: (startDate: string, endDate: string) => void;
}

interface Column {
  id: string;
  visible: boolean;
}

const GlobalSummaryTable: React.FC<GlobalSummaryTableProps> = ({
  title,
  startDate,
  endDate,
  data,
  onDateChange
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
    const { isMobile } = useLayoutShift();
  const [searchTerm, setSearchTerm] = useState('');
  const [localStartDate, setLocalStartDate] = useState(startDate);
  const [localEndDate, setLocalEndDate] = useState(endDate);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [columns, setColumns] = useState<Column[]>([
    { id: 'id', visible: true },
    { id: 'code', visible: true },
    { id: 'products', visible: true },
    { id: 'type', visible: true },
    { id: 'openingQty', visible: true },
    { id: 'openingAmount', visible: true },
    { id: 'purchaseQty', visible: true },
    { id: 'purchaseRate', visible: true },
    { id: 'purchaseAmount', visible: true },
    { id: 'consumptionQty', visible: true },
    { id: 'consumptionRate', visible: true },
    { id: 'consumptionAmount', visible: true },
    { id: 'saleReturnQty', visible: true },
    { id: 'saleReturnAmount', visible: true },
    { id: 'closingQty', visible: true },
    { id: 'closingAmount', visible: true }
  ]);

  const getColumnLabel = (columnId: string) =>
    t(`shared.globalSummaryTable.columns.${columnId}`);

  const filteredData = data.filter(item =>
    item.products.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleView = () => {
    if (onDateChange) {
      onDateChange(localStartDate, localEndDate);
    }
  };

  const handleCopy = () => {
    console.log('Copy clicked');
  };

  const handleCSV = () => {
    // Prepare data for CSV export
    const csvData = filteredData.map(item => {
      const row: any = {};
      columns.forEach(column => {
        if (column.visible) {
          switch (column.id) {
            case 'id':
              row[getColumnLabel(column.id)] = item.id;
              break;
            case 'code':
              row[getColumnLabel(column.id)] = item.code;
              break;
            case 'products':
              row[getColumnLabel(column.id)] = item.products;
              break;
            case 'type':
              row[getColumnLabel(column.id)] = item.type;
              break;
            case 'openingQty':
              row[getColumnLabel(column.id)] = item.opening.qty;
              break;
            case 'openingAmount':
              row[getColumnLabel(column.id)] = item.opening.amount;
              break;
            case 'purchaseQty':
              row[getColumnLabel(column.id)] = item.purchase.qty;
              break;
            case 'purchaseRate':
              row[getColumnLabel(column.id)] = item.purchase.rate;
              break;
            case 'purchaseAmount':
              row[getColumnLabel(column.id)] = item.purchase.amount;
              break;
            case 'consumptionQty':
              row[getColumnLabel(column.id)] = item.consumption.qty;
              break;
            case 'consumptionRate':
              row[getColumnLabel(column.id)] = item.consumption.rate;
              break;
            case 'consumptionAmount':
              row[getColumnLabel(column.id)] = item.consumption.amount;
              break;
            case 'saleReturnQty':
              row[getColumnLabel(column.id)] = item.saleReturn.qty;
              break;
            case 'saleReturnAmount':
              row[getColumnLabel(column.id)] = item.saleReturn.amount;
              break;
            case 'closingQty':
              row[getColumnLabel(column.id)] = item.closing.qty;
              break;
            case 'closingAmount':
              row[getColumnLabel(column.id)] = item.closing.amount;
              break;
          }
        }
      });
      return row;
    });

    // Export to CSV
    exportToCSV(csvData, 'global_summary_report');
  };

  const handlePDF = () => {
    console.log('PDF clicked');
  };

  const handlePrint = () => {
    console.log('Print clicked');
  };

  const handleColumnVisibilityClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleColumnVisibilityClose = () => {
    setAnchorEl(null);
  };

  const handleColumnVisibilityChange = (columnId: string) => {
    setColumns(columns.map(col => 
      col.id === columnId ? { ...col, visible: !col.visible } : col
    ));
  };

  return (
    <PageContainer
      title={title}
      subtitle={t('shared.common.reportPeriod', {
        startDate: localStartDate,
        endDate: localEndDate
      })}
    >
      <Paper
        elevation={3}
        sx={{
          // p: { xs: 1, sm: 3 },
          borderRadius: '8px',
          backgroundColor: theme.palette.background.paper,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          overflowX: 'auto'
        }}
      >
        <Box
          sx={{
           p: { xs: 1, sm: 3 },
          }}
        >
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={4}>
                <TextField
                  type="date"
                  label={t('shared.common.startDate')}
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
                  label={t('shared.common.endDate')}
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
                  onClick={handleView}
                  sx={{
                    backgroundColor: '#005f73',
                    '&:hover': {
                      backgroundColor: '#003844'
                    },
                    flex: 1
                  }}
                >
                  {t('shared.common.viewReport')}
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
                  {t('shared.common.print')}
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Box>
        {/* Tools Row */}
        <Box
          sx={{
            mb: 3,
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 1,
            alignItems: { xs: 'stretch', sm: 'center' },
            backgroundColor: theme.palette.background.paper,
            p: 1,
            borderBottom: '1px solid #e0e0e0'
          }}
        >
          <Box
            sx={{
              display: 'flex',
              gap: 1,
              flexWrap: 'wrap',
              mb: { xs: 2, sm: 0 }
            }}
          >
            <Button
              variant="outlined"
              size="small"
              startIcon={<VisibilityIcon />}
              onClick={handleColumnVisibilityClick}
              sx={{
                textTransform: 'none',
                borderColor: '#005f73',
                color: '#005f73',
                flex: { xs: 1, sm: 'none' }
              }}
            >
              {t('shared.common.columnVisibility')}
            </Button>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleColumnVisibilityClose}
            >
              {columns.map((column) => (
                <MenuItem key={column.id}>
                  <Checkbox
                    checked={column.visible}
                    onChange={() => handleColumnVisibilityChange(column.id)}
                  />
                  {getColumnLabel(column.id)}
                </MenuItem>
              ))}
            </Menu>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton
                size="small"
                onClick={handleCopy}
                sx={{ color: '#005f73' }}
              >
                <CopyIcon />
              </IconButton>
              <IconButton
                size="small"
                onClick={handleCSV}
                sx={{ color: '#005f73' }}
              >
                <CSVIcon />
              </IconButton>
              <IconButton
                size="small"
                onClick={handlePDF}
                sx={{ color: '#005f73' }}
              >
                <PDFIcon />
              </IconButton>
            </Box>
          </Box>
          <Box
            sx={{
              flexGrow: 1,
              display: 'flex',
              alignItems: 'center',
              mt: { xs: 2, sm: 0 }
            }}
          >
            <TextField
              size="small"
              placeholder={t('shared.globalSummaryTable.searchProducts')}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: '#005f73' }} />
                  </InputAdornment>
                )
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '4px',
                  backgroundColor: theme.palette.mode === 'dark' ? colors.primary[400] : '#f8f9fa'
                }
              }}
            />
          </Box>
        </Box>

        {/* Table */}
        <TableContainer
          sx={{
            maxHeight: { xs: '400px', sm: 'none' },
            overflowX: 'auto'
          }}
        >
          <Table size={isMobile ? 'small' : 'medium'}>
            <TableHead>
              <TableRow sx={{ backgroundColor: theme.palette.mode === 'dark' ? colors.primary[400] : '#f8f9fA' }}>
                {columns.map((column) => (
                  column.visible && (
                    <TableCell
                      key={column.id}
                      sx={{
                        color: 'black',
                        fontWeight: 'bold',
                        minWidth: { xs: '80px', sm: 'auto' }
                      }}
                    >
                      {getColumnLabel(column.id)}
                    </TableCell>
                  )
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredData.map((item) => (
                <TableRow
                  key={item.id}
                  sx={{
                    '&:hover': { backgroundColor: theme.palette.mode === 'dark' ? colors.primary[400] : '#f5f5f5' },
                    '& td': {
                      py: 1.5,
                      borderBottom: '1px solid #e0e0e0',
                      fontSize: { xs: '0.75rem', sm: '0.875rem' }
                    }
                  }}
                >
                  {columns.map((column) => (
                    column.visible && (
                      <TableCell key={column.id}>
                        {column.id === 'id' && item.id}
                        {column.id === 'code' && item.code}
                        {column.id === 'products' && item.products}
                        {column.id === 'type' && item.type}
                        {column.id === 'openingQty' && item.opening.qty}
                        {column.id === 'openingAmount' && item.opening.amount}
                        {column.id === 'purchaseQty' && item.purchase.qty}
                        {column.id === 'purchaseRate' && item.purchase.rate}
                        {column.id === 'purchaseAmount' && item.purchase.amount}
                        {column.id === 'consumptionQty' && item.consumption.qty}
                        {column.id === 'consumptionRate' && item.consumption.rate}
                        {column.id === 'consumptionAmount' && item.consumption.amount}
                        {column.id === 'saleReturnQty' && item.saleReturn.qty}
                        {column.id === 'saleReturnAmount' && item.saleReturn.amount}
                        {column.id === 'closingQty' && item.closing.qty}
                        {column.id === 'closingAmount' && item.closing.amount}
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

export default GlobalSummaryTable;
