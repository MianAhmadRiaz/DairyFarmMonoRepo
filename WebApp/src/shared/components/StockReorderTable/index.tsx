import React, { useState } from 'react';
import {
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
  useTheme
} from '@mui/material';
import { tokens } from '../../theme/theme.jsx';
import {
  ContentCopy as CopyIcon,
  FileDownload as CSVIcon,
  PictureAsPdf as PDFIcon,
  Print as PrintIcon,
  Visibility as VisibilityIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import { InputAdornment } from '@mui/material';
import PageContainer from '../../../shared/components/Layout/PageContainer';

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
  data: StockReorderItem[];
}

const StockReorderTable: React.FC<StockReorderTableProps> = ({ data }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredData = data.filter(item =>
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
    <PageContainer title="Stock Reorder Report">
      <Paper
        elevation={3}
        sx={{
          p: 3,
          borderRadius: '8px',
          backgroundColor: theme.palette.background.paper,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          width: '100%'
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 3,
            pb: 2,
            borderBottom: '1px solid #e0e0e0'
          }}
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: { xs: 'flex-start', sm: 'flex-end' },
              width: '100%',
              mt: 2
            }}
          >
            <Box
              sx={{
                display: 'flex',
                gap: 1,
                width: { xs: '100%', sm: 'auto' },
                flexDirection: 'row'
              }}
            >
              <Button
                variant="contained"
                sx={{
                  backgroundColor: '#005f73',
                  '&:hover': {
                    backgroundColor: '#003844'
                  },
                  mr: 1
                }}
              >
                View
              </Button>
              <Button
                variant="outlined"
                startIcon={<PrintIcon />}
                sx={{ borderColor: '#005f73', color: '#005f73' }}
                onClick={handlePrint}
              >
                Print
              </Button>
            </Box>
          </Box>
        </Box>
        {/* Tools Row */}
        <Box
          sx={{
            mb: 3,
            display: 'flex',
            gap: 1,
            alignItems: 'center',
            p: 1,
            borderBottom: '1px solid #e0e0e0'
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
              width: { xs: '100%', sm: 'auto' },
              fontSize: '0.7rem',
              px: 0.5
            }}
          >
            Column visibility
          </Button>
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
          <Box sx={{ flexGrow: 1 }} />
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box component="span" sx={{ mr: 1, color: '#666' }}>
              Search:
            </Box>
            <TextField
              size="small"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '4px',
                  backgroundColor: '#fff'
                }
              }}
            />
          </Box>
        </Box>

        {/* Table */}
        <Box sx={{ mx: { xs: -1, md: -3 } }}>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow
                  sx={{
                    backgroundColor:
                      theme.palette.mode === 'dark'
                        ? colors.primary[400]
                        : '#f8f9fA'
                  }}
                >
                  <TableCell sx={{ color: 'black', fontWeight: 'bold' }}>
                    #
                  </TableCell>
                  <TableCell sx={{ color: 'black', fontWeight: 'bold' }}>
                    Products
                  </TableCell>
                  <TableCell sx={{ color: 'black', fontWeight: 'bold' }}>
                    Head
                  </TableCell>
                  <TableCell sx={{ color: 'black', fontWeight: 'bold' }}>
                    Priority
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{ color: 'black', fontWeight: 'bold' }}
                  >
                    Current Qty
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{ color: 'black', fontWeight: 'bold' }}
                  >
                    Re-Order/Notify Qty
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{ color: 'black', fontWeight: 'bold' }}
                  >
                    Difference Qty
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredData.map(item => (
                  <TableRow
                    key={item.id}
                    sx={{
                      '&:hover': {
                        backgroundColor:
                          theme.palette.mode === 'dark'
                            ? colors.primary[400]
                            : '#f5f5f5'
                      },
                      '& td': {
                        py: 1.5,
                        borderBottom: '1px solid #e0e0e0'
                      }
                    }}
                  >
                    <TableCell>{item.id}</TableCell>
                    <TableCell>{item.products}</TableCell>
                    <TableCell>{item.head}</TableCell>
                    <TableCell>{item.priority}</TableCell>
                    <TableCell align="center">{item.currentQty}</TableCell>
                    <TableCell align="center">{item.reorderQty}</TableCell>
                    <TableCell align="center">{item.differenceQty}</TableCell>
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

export default StockReorderTable;
