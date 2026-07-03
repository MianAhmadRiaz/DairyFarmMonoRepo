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
  Paper,
  IconButton,
  TextField,
  Typography,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  Grid,
  Divider,
  DialogActions,
  Menu,
  MenuItem,
  Checkbox,
  useTheme
} from '@mui/material';
import { tokens } from '../../theme/theme.jsx';
import {
  Edit as EditIcon,
  ContentCopy as CopyIcon,
  FileDownload as CSVIcon,
  PictureAsPdf as PDFIcon,
  Print as PrintIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import GlobalTextField from '../GlobalTextField/GlobalTextField';
import { exportToCSV } from '../../utils/exportUtils';

interface StockItem {
  itemName: string;
  unit: string;
  purchaseRate: number;
  unitPrice: number;
  quantity: number;
  reorderLevel: number;
  amount: number;
}

interface StockInventoryTableProps {
  title: string;
  data: StockItem[];
  onEdit?: (item: StockItem) => void;
}

interface Column {
  id: string;
  label: string;
  visible: boolean;
  align?: 'left' | 'right' | 'center';
}

const StockInventoryTable: React.FC<StockInventoryTableProps> = ({
  title,
  data,
  onEdit
}) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<StockItem | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [columns, setColumns] = useState<Column[]>([
    { id: 'itemName', label: 'Item Name', visible: true, align: 'left' },
    { id: 'unit', label: 'Unit', visible: true, align: 'right' },
    { id: 'purchaseRate', label: 'Purchase Rate', visible: true, align: 'right' },
    { id: 'unitPrice', label: 'Unit Price', visible: true, align: 'right' },
    { id: 'quantity', label: 'Quantity', visible: true, align: 'right' },
    { id: 'reorderLevel', label: 'Reorder Level', visible: true, align: 'right' },
    { id: 'amount', label: 'Amount', visible: true, align: 'right' },
    { id: 'actions', label: 'Actions', visible: true, align: 'center' }
  ]);

  const filteredData = data.filter(item =>
    item.itemName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCopy = () => {
    console.log('Copy clicked');
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

  const handleCSV = () => {
    // Prepare data for CSV export
    const csvData = filteredData.map(item => {
      const row: any = {};
      columns.forEach(column => {
        if (column.visible && column.id !== 'actions') {
          row[column.label] = item[column.id as keyof StockItem];
        }
      });
      return row;
    });

    // Export to CSV
    exportToCSV(csvData, 'stock_inventory_report');
  };

  const handlePDF = () => {
    console.log('PDF clicked');
  };

  const handlePrint = () => {
    console.log('Print clicked');
  };
  const handleEdit = (item: any) => {
    setSelectedItem(item);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedItem(null);
  };
  return (
    <Card
      elevation={3}
      sx={{
        // p: 4,
        borderRadius: '12px',
        backgroundColor: theme.palette.background.paper,
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
      }}
    >
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center',p:3 }}>
        <Button
          variant="outlined"
          size="small"
          startIcon={<VisibilityIcon />}
          onClick={handleColumnVisibilityClick}
          sx={{
            textTransform: 'none',
            borderColor: '#ddd',
            color: 'text.primary',
            '&:hover': {
              borderColor: '#aaa'
            }
          }}
        >
          Column visibility
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
              {column.label}
            </MenuItem>
          ))}
        </Menu>
        <IconButton
          size="small"
          onClick={handleCopy}
          sx={{
            border: '1px solid #ddd',
            borderRadius: '4px',
            '&:hover': {
              borderColor: '#aaa'
            }
          }}
        >
          <CopyIcon />
        </IconButton>
        <IconButton
          size="small"
          onClick={handleCSV}
          sx={{
            border: '1px solid #ddd',
            borderRadius: '4px',
            '&:hover': {
              borderColor: '#aaa'
            }
          }}
        >
          <CSVIcon />
        </IconButton>
        <IconButton
          size="small"
          onClick={handlePDF}
          sx={{
            border: '1px solid #ddd',
            borderRadius: '4px',
            '&:hover': {
              borderColor: '#aaa'
            }
          }}
        >
          <PDFIcon />
        </IconButton>
        <IconButton
          size="small"
          onClick={handlePrint}
          sx={{
            border: '1px solid #ddd',
            borderRadius: '4px',
            '&:hover': {
              borderColor: '#aaa'
            }
          }}
        >
          <PrintIcon />
        </IconButton>
        <Box sx={{ flexGrow: 1 }} />
        <TextField
          size="small"
          placeholder="Search..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          sx={{
            width: 300,
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                borderColor: '#ddd'
              },
              '&:hover fieldset': {
                borderColor: '#aaa'
              }
            }
          }}
        />
      </Box>

      <Card
        sx={{
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
          border: '1px solid rgba(0,0,0,0.05)'
        }}
      >
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: theme.palette.mode === 'dark' ? colors.primary[400] : '#f8f9fA' }}>
                {columns.map((column) => (
                  column.visible && (
                    <TableCell
                      key={column.id}
                      align={column.align}
                      sx={{
                        fontWeight: 'bold',
                        borderBottom: '2px solid rgba(0,0,0,0.1)',
                        py: 1.5
                      }}
                    >
                      {column.label}
                    </TableCell>
                  )
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredData.map((item) => (
                <TableRow key={item.itemName}>
                  {columns.map((column) => (
                    column.visible && (
                      <TableCell
                        key={column.id}
                        align={column.align}
                        sx={{
                          borderBottom: '1px solid rgba(0,0,0,0.1)',
                          py: 1.5
                        }}
                      >
                        {column.id === 'actions' ? (
                          <IconButton
                            size="small"
                            onClick={() => handleEdit(item)}
                            sx={{
                              color: '#1976d2',

                              '&:hover': {
                                backgroundColor: 'rgba(0,0,0,0.04)'
                              }
                            }}
                          >
                            <EditIcon />
                          </IconButton>
                        ) : (
                          item[column.id as keyof StockItem]
                        )}
                      </TableCell>
                    )
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      <Dialog
        open={isEditModalOpen}
        onClose={handleCloseEditModal}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ borderBottom: '1px solid #e0e0e0', pb: 2 }}>
          Edit Stock Item
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {selectedItem && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography
                  variant="subtitle1"
                  fontWeight="bold"
                  color="primary"
                >
                  Basic Information
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <GlobalTextField
                  name="name"
                  label="Item Name"
                  value={selectedItem?.itemName || ''}
                  onChange={e =>
                    setSelectedItem(prev =>
                      prev ? { ...prev, itemName: e.target.value } : null
                    )
                  }
                  fullWidth
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <GlobalTextField
                  name="reorder_level"
                  label="Reorder Level"
                  type="number"
                  value={selectedItem?.reorderLevel || ''}
                  onChange={e =>
                    setSelectedItem(prev =>
                      prev ? { ...prev, reorderLevel: Number(e.target.value) } : null
                    )
                  }
                  fullWidth
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <GlobalTextField
                  name="quantity"
                  label="Quantity"
                  type="number"
                  value={selectedItem?.quantity || ''}
                  onChange={e =>
                    setSelectedItem(prev =>
                      prev ? { ...prev, quantity: Number(e.target.value) } : null
                    )
                  }
                  fullWidth
                />
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
              </Grid>

              <Grid item xs={12}>
                <Typography
                  variant="subtitle1"
                  fontWeight="bold"
                  color="primary"
                >
                  Stock Details
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <GlobalTextField
                  name="amount"
                  label="Amount"
                  type="number"
                  value={selectedItem?.amount || ''}
                  onChange={e =>
                    setSelectedItem(prev =>
                      prev ? { ...prev, amount: Number(e.target.value) } : null
                    )
                  }
                  fullWidth
                />
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, borderTop: '1px solid #e0e0e0' }}>
          <Button
            onClick={handleCloseEditModal}
            variant="outlined"
            color="inherit"
          >
            Cancel
          </Button>
          <Button
            // onClick={handleSaveEdit}
            variant="contained"
            sx={{
              backgroundColor: '#005f73',
              color: '#ffffff',
              border: '1px solid #005f73',
              '&:hover': {
                backgroundColor: '#ffffff',
                color: '#005f73',
                border: '1px solid #005f73'
              }
            }}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

export default StockInventoryTable;
