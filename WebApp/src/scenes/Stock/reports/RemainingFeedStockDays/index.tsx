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
import { InputAdornment } from '@mui/material';
import PageContainer from '../../../../shared/components/Layout/PageContainer';
import { tokens } from '../../../../shared/theme/theme';
import { useTranslation } from 'react-i18next';

interface StockReorderItem {
  id: number;
  products: string;
  head: string;
  priority: string;
  currentQty: number;
  reorderQty: number;
  differenceQty: number;
}

interface StockReorderTableProps {
  data?: StockReorderItem[];
}
const stockReorderData = [
  {
    id: 1,
    products: 'Suga Pro Glycerol 80%(ltr)',
    head: 'Feeding',
    priority: 'Medium',
    currentQty: 0,
    reorderQty: 70,
    differenceQty: 70
  }
];

const RemainingFeedStockDays: React.FC<StockReorderTableProps> = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [searchTerm, setSearchTerm] = useState('');

  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const filteredData = stockReorderData?.filter(item =>
    item.products.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCopy = () => {
    console.log('Copy clicked');
  };

  const handleCSV = () => {
    console.log('CSV clicked');
  };

  const handleExcel = () => {
    console.log('Excel clicked');
  };

  const handlePDF = () => {
    console.log('PDF clicked');
  };

  const handlePrint = () => {
    console.log('Print clicked');
  };

  return (
    <PageContainer title={t('stock.remainingFeedStockDays.title')}>
      <Alert severity="warning" sx={{ mb: 2 }}>
        {t('stock.common.reportNotConnected')}
      </Alert>

      <Paper
        elevation={3}
        sx={{
          p: { xs: 1, sm: 3 },
          borderRadius: '8px',
          backgroundColor: theme.palette.background.paper,
          boxShadow:
            theme.palette.mode === 'dark'
              ? '0 4px 12px rgba(0,0,0,0.3)'
              : '0 2px 8px rgba(0,0,0,0.1)',
          overflowX: 'auto'
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',

            alignItems: { xs: 'flex-start', sm: 'center' },
            mb: 3,
            pb: 2,
            borderBottom: '1px solid #e0e0e0',
            gap: { xs: 3, sm: 0 },
            justifyContent: { xs: 'flex-start', sm: 'flex-end' }
          }}
        >
          <Box
            sx={{
              display: 'flex',
              gap: 1,
              width: { xs: '50%', sm: 'auto' },
              flexDirection: 'row'
            }}
          >
            <Button
              variant="contained"
              fullWidth={isMobile}
              sx={{
                backgroundColor: '#005f73',
                '&:hover': {
                  backgroundColor: '#003844'
                }
              }}
            >
              {t('stock.common.view')}
            </Button>
            <Button
              variant="outlined"
              startIcon={<PrintIcon />}
              sx={{
                borderColor: '#005f73',
                color: '#005f73'
              }}
              onClick={handlePrint}
            >
              {t('stock.common.print')}
            </Button>
          </Box>
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
              sx={{
                textTransform: 'none',
                borderColor: '#005f73',
                color: '#005f73',
                flex: { xs: 1, sm: 'none' }
              }}
            >
              {t('stock.common.columnVisibility')}
            </Button>
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

        <Box sx={{ mx: { xs: -1, md: -3 } }}>
          <TableContainer
            sx={{
              maxHeight: { xs: '400px', sm: 'none' },
              overflowX: 'auto'
            }}
          >
            <Table size={isMobile ? 'small' : 'medium'}>
              <TableHead>
                <TableRow
                  sx={{
                    backgroundColor:
                      theme.palette.mode === 'dark'
                        ? colors.primary[400]
                        : '#F8F9FA'
                  }}
                >
                  <TableCell
                    sx={{
                      color: 'black',
                      fontWeight: 'bold',
                      minWidth: { xs: '50px', sm: 'auto' }
                    }}
                  >
                    #
                  </TableCell>
                  <TableCell
                    sx={{
                      color: 'black',
                      fontWeight: 'bold',
                      minWidth: { xs: '150px', sm: 'auto' }
                    }}
                  >
                    {t('stock.common.products')}
                  </TableCell>
                  <TableCell
                    sx={{
                      color: 'black',
                      fontWeight: 'bold',
                      minWidth: { xs: '100px', sm: 'auto' }
                    }}
                  >
                    {t('stock.common.currentStock')}
                  </TableCell>
                  <TableCell
                    sx={{
                      color: 'black',
                      fontWeight: 'bold',
                      minWidth: { xs: '100px', sm: 'auto' }
                    }}
                  >
                    {t('stock.remainingFeedStockDays.lastConsumeQty')}
                  </TableCell>
                  <TableCell
                    sx={{
                      color: 'black',
                      fontWeight: 'bold',
                      minWidth: { xs: '80px', sm: 'auto' }
                    }}
                  >
                    {t('stock.remainingFeedStockDays.purchaseRate')}
                  </TableCell>
                  <TableCell
                    sx={{
                      color: 'black',
                      fontWeight: 'bold',
                      minWidth: { xs: '80px', sm: 'auto' }
                    }}
                  >
                    {t('stock.remainingFeedStockDays.days')}
                  </TableCell>
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
                    <TableCell>{item.id}</TableCell>
                    <TableCell>{item.products}</TableCell>
                    <TableCell>{item.head}</TableCell>
                    <TableCell>{item.priority}</TableCell>
                    <TableCell>{item.currentQty}</TableCell>
                    <TableCell>{item.reorderQty}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Paper>
    </PageContainer>
  );
};

export default RemainingFeedStockDays;
