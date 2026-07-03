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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  SelectChangeEvent,
  CardContent,
  Grid,
  Card,
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
import PageContainer from '../../../shared/components/Layout/PageContainer';

interface AnimalCostItem {
  id: number;
  tagId: string;
  animalStatus: string;
  animalSex: string;
  itemCode: string;
  itemName: string;
  category: string;
  days: number;
  qty: number;
  rate: number;
  amount: number;
}

interface AnimalWiseCostTableProps {
  data: AnimalCostItem[];
  startDate: string;
  endDate: string;
  onDateChange: (startDate: string, endDate: string) => void;
}

const AnimalWiseCostTable: React.FC<AnimalWiseCostTableProps> = ({
  data,
  startDate,
  endDate,
  onDateChange
}) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sexFilter, setSexFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [itemNameFilter, setItemNameFilter] = useState('');
  const [localStartDate, setLocalStartDate] = useState(startDate);
  const [localEndDate, setLocalEndDate] = useState(endDate);
  const uniqueStatuses = Array.from(
    new Set(data.map(item => item.animalStatus))
  );
  const uniqueSexes = Array.from(new Set(data.map(item => item.animalSex)));
  const uniqueCategories = Array.from(new Set(data.map(item => item.category)));
  const uniqueItemNames = Array.from(new Set(data.map(item => item.itemName)));

  const filteredData = data.filter(item => {
    const matchesSearch = item.itemName
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || item.animalStatus === statusFilter;
    const matchesSex = !sexFilter || item.animalSex === sexFilter;
    const matchesCategory = !categoryFilter || item.category === categoryFilter;
    const matchesItemName = !itemNameFilter || item.itemName === itemNameFilter;

    return (
      matchesSearch &&
      matchesStatus &&
      matchesSex &&
      matchesCategory &&
      matchesItemName
    );
  });

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

  const handleView = () => {
    onDateChange(startDate, endDate);
  };

  return (
    <PageContainer
      title="Animal Wise Cost Report"
      subtitle={`Report Period: ${localStartDate} to ${localEndDate}`}
    >
      <Paper
        elevation={3}
        sx={{
          borderRadius: '8px',
          backgroundColor: theme.palette.background.paper,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}
      >
        <Box
          sx={{
            p: { xs: 1, sm: 2 }
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
                  value={localStartDate}
                  onChange={e => setLocalStartDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  type="date"
                  label="End Date"
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
                  //   onClick={handleSearch}
                  sx={{
                    backgroundColor: '#005f73',
                    '&:hover': {
                      backgroundColor: '#003844'
                    },
                    flex: 1
                  }}
                >
                  View Report
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<PrintIcon />}
                  onClick={handlePrint}
                  sx={{ borderColor: '#005f73', color: '#005f73' }}
                >
                  Print
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Box>
        <Box
          sx={{
            mb: 3,
            display: 'flex',
            gap: 2,
            flexWrap: 'wrap'
          }}
        >
          <FormControl
            size="small"
            sx={{ minWidth: 200, ml: { xs: 3, md: 4 } }}
          >
            <InputLabel>Animal Status</InputLabel>
            <Select
              value={statusFilter}
              label="Animal Status"
              onChange={e => setStatusFilter(e.target.value)}
            >
              <MenuItem value="">All</MenuItem>
              {uniqueStatuses.map(status => (
                <MenuItem key={status} value={status}>
                  {status}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl
            size="small"
            sx={{ minWidth: 200, ml: { xs: 3, md: 0 } }}
          >
            <InputLabel>Animal Sex</InputLabel>
            <Select
              value={sexFilter}
              label="Animal Sex"
              onChange={e => setSexFilter(e.target.value)}
            >
              <MenuItem value="">All</MenuItem>
              {uniqueSexes.map(sex => (
                <MenuItem key={sex} value={sex}>
                  {sex}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl
            size="small"
            sx={{ minWidth: 200, ml: { xs: 3, md: 0 } }}
          >
            <InputLabel>Category</InputLabel>
            <Select
              value={categoryFilter}
              label="Category"
              onChange={e => setCategoryFilter(e.target.value)}
            >
              <MenuItem value="">All</MenuItem>
              {uniqueCategories.map(category => (
                <MenuItem key={category} value={category}>
                  {category}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl
            size="small"
            sx={{ minWidth: 200, ml: { xs: 3, md: 0 } }}
          >
            <InputLabel>Item Name</InputLabel>
            <Select
              value={itemNameFilter}
              label="Item Name"
              onChange={e => setItemNameFilter(e.target.value)}
            >
              <MenuItem value="">All</MenuItem>
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
              color: '#005f73'
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
                  Tag ID
                </TableCell>
                <TableCell sx={{ color: 'black', fontWeight: 'bold' }}>
                  Animal Status
                </TableCell>
                <TableCell sx={{ color: 'black', fontWeight: 'bold' }}>
                  Animal Sex
                </TableCell>
                <TableCell sx={{ color: 'black', fontWeight: 'bold' }}>
                  Item Code
                </TableCell>
                <TableCell sx={{ color: 'black', fontWeight: 'bold' }}>
                  Item Name
                </TableCell>
                <TableCell sx={{ color: 'black', fontWeight: 'bold' }}>
                  Category
                </TableCell>
                <TableCell
                  align="right"
                  sx={{ color: 'black', fontWeight: 'bold' }}
                >
                  Days
                </TableCell>
                <TableCell
                  align="right"
                  sx={{ color: 'black', fontWeight: 'bold' }}
                >
                  Qty
                </TableCell>
                <TableCell
                  align="right"
                  sx={{ color: 'black', fontWeight: 'bold' }}
                >
                  Rate
                </TableCell>
                <TableCell
                  align="right"
                  sx={{ color: 'black', fontWeight: 'bold' }}
                >
                  Amount
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
                  <TableCell>{item.tagId}</TableCell>
                  <TableCell>{item.animalStatus}</TableCell>
                  <TableCell>{item.animalSex}</TableCell>
                  <TableCell>{item.itemCode}</TableCell>
                  <TableCell>{item.itemName}</TableCell>
                  <TableCell>{item.category}</TableCell>
                  <TableCell align="right">{item.days}</TableCell>
                  <TableCell align="right">{item.qty}</TableCell>
                  <TableCell align="right">{item.rate}</TableCell>
                  <TableCell align="right">{item.amount}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </PageContainer>
  );
};

export default AnimalWiseCostTable;
