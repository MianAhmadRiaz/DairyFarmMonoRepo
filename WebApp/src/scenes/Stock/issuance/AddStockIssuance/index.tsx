import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  MenuItem,
  Typography,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import PageContainer from '../../../../shared/components/Layout/PageContainer';
import {
  getAllStockItems,
  addStockTransaction,
  StockItemRow
} from '../../../../shared/services/stockModule.services';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useTranslation } from 'react-i18next';

interface IssuanceItem {
  itemId: string;
  currentQty: number;
  qtyToIssue: number;
  note: string;
}

const emptyRow = (): IssuanceItem => ({ itemId: '', currentQty: 0, qtyToIssue: 0, note: '' });

const AddStockIssuance: React.FC = () => {
  const { t } = useTranslation();
  const [transactionDate, setTransactionDate] = useState<string>('');
  const [items, setItems] = useState<IssuanceItem[]>([emptyRow()]);
  const [stockItems, setStockItems] = useState<StockItemRow[]>([]);
  const [loading, setLoading] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    const today = new Date();
    setTransactionDate(today.toISOString().split('T')[0]);

    const fetchData = async () => {
      try {
        setLoading(true);
        const allItems = await getAllStockItems();
        setStockItems(allItems);
      } catch (error: any) {
        toast.error(error?.response?.data?.message || t('stock.common.fetchItemsError'));
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleAddItem = () => {
    setItems([...items, emptyRow()]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(prev => (prev.length > 1 ? prev.filter((_, i) => i !== index) : prev));
  };

  const handleItemChange = (index: number, itemId: string) => {
    const selectedItem = stockItems.find(item => item.uuid === itemId);
    const newItems = [...items];
    newItems[index] = {
      ...newItems[index],
      itemId,
      currentQty: Number(selectedItem?.stockLevel?.quantity) || 0
    };
    setItems(newItems);
  };

  const handleQtyChange = (index: number, qty: string) => {
    const newItems = [...items];
    newItems[index].qtyToIssue = parseFloat(qty) || 0;
    setItems(newItems);
  };

  const handleNoteChange = (index: number, note: string) => {
    const newItems = [...items];
    newItems[index].note = note;
    setItems(newItems);
  };

  const handleSubmit = async () => {
    const validRows = items.filter(item => item.itemId && item.qtyToIssue > 0);
    if (validRows.length === 0) {
      toast.warning(t('stock.addStockIssuance.selectItemWarning'));
      return;
    }
    try {
      setLoading(true);
      for (const row of validRows) {
        // eslint-disable-next-line no-await-in-loop
        await addStockTransaction({
          itemId: row.itemId,
          quantity: row.qtyToIssue,
          transaction_type: 'usage',
          note: row.note || undefined,
          date: transactionDate || undefined
        });
      }
      toast.success(t('stock.addStockIssuance.saveSuccess'));
      setItems([emptyRow()]);
      // refresh current quantities after issuing
      const allItems = await getAllStockItems();
      setStockItems(allItems);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || t('stock.addStockIssuance.saveError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer title={t('stock.addStockIssuance.title')} subtitle={t('stock.addStockIssuance.subtitle')}>
      <Container maxWidth="lg" sx={{ px: isMobile ? '11px' : undefined }}>
        <Paper
          elevation={3}
          sx={{
            p: { sm: '1', md: '4' },
            borderRadius: '12px',
            backgroundColor: 'white',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              justifyContent: 'space-between',
              alignItems: { xs: 'flex-start', sm: 'center' },
              gap: { xs: 2, sm: 0 },
              mb: 2,
              p: { xs: 1, sm: 2 },
              borderRadius: '8px'
            }}
          >
            <Typography
              variant="h6"
              sx={{
                fontWeight: 'bold',
                fontSize: { xs: '1rem', sm: '1.25rem' }
              }}
            >
              {t('stock.addStockIssuance.title')}
            </Typography>
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                gap: 2,
                width: { xs: '100%', sm: 'auto' }
              }}
            >
              <TextField
                type="date"
                label={t('stock.common.date')}
                size="small"
                value={transactionDate}
                onChange={e => setTransactionDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{
                  width: { xs: '100%', sm: '250px' },
                  mr: { xs: 0, sm: '10px' }
                }}
              />
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={loading}
                fullWidth={isMobile}
                sx={{
                  backgroundColor: '#005f73',
                  '&:hover': {
                    backgroundColor: '#ffffff',
                    color: '#005f73',
                    border: '1px solid #005f73'
                  }
                }}
              >
                {t('stock.common.saveChanges')}
              </Button>
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={handleAddItem}
                disabled={loading}
              >
                {t('stock.addStockIssuance.addItem')}
              </Button>
            </Box>
          </Box>

          <Box sx={{ width: '100%', borderRadius: '8px', overflowX: 'auto' }}>
            <TableContainer sx={{ p: 0 }}>
              <Table
                size={isMobile ? 'small' : 'medium'}
                sx={{
                  minWidth: 'auto',
                  tableLayout: 'fixed'
                }}
              >
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f8f9fA' }}>
                    <TableCell sx={{ fontWeight: 'bold' }}>{t('stock.common.item')}</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>{t('stock.addStockIssuance.currentQty')}</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>{t('stock.common.qty')}</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>{t('stock.addStockIssuance.note')}</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', width: '60px' }} />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {items.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <TextField
                          select
                          fullWidth
                          size="small"
                          value={item.itemId}
                          onChange={e => handleItemChange(index, e.target.value)}
                          disabled={loading}
                        >
                          <MenuItem value="">{t('stock.addStockIssuance.selectItem')}</MenuItem>
                          {stockItems.map(stockItem => (
                            <MenuItem key={stockItem.uuid} value={stockItem.uuid}>
                              {stockItem.name}
                            </MenuItem>
                          ))}
                        </TextField>
                      </TableCell>
                      <TableCell>
                        <TextField
                          size="small"
                          fullWidth
                          value={item.currentQty.toFixed(2)}
                          InputProps={{ readOnly: true }}
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          type="number"
                          size="small"
                          fullWidth
                          value={item.qtyToIssue}
                          onChange={e => handleQtyChange(index, e.target.value)}
                          disabled={loading}
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          size="small"
                          fullWidth
                          placeholder={t('stock.addStockIssuance.optionalNote')}
                          value={item.note}
                          onChange={e => handleNoteChange(index, e.target.value)}
                          disabled={loading}
                        />
                      </TableCell>
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={() => handleRemoveItem(index)}
                          disabled={loading || items.length === 1}
                          sx={{ color: '#d32f2f' }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </Paper>

        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </Container>
    </PageContainer>
  );
};

export default AddStockIssuance;
