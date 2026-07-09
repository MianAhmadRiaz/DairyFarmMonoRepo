import React, { useState } from 'react';
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
  Card,
  CardContent,
  Grid,
  IconButton,
  InputAdornment,
  useTheme,
  useMediaQuery,
  Stack,
  Typography
} from '@mui/material';
import {
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import PageContainer from '../../../../../shared/components/Layout/PageContainer';
import { useTranslation } from 'react-i18next';

const dummyData = [
  {
    id: 1,
    date: '08-Apr-2025',
    item: 'Diesel (Purchase) (Stockable)',
    qty: 38.13,
    rate: 256.9,
    amount: 3795.6,
    income: '[FLEET] FAT 450s Feed',
    use: 'Aarangzab'
  },
  {
    id: 2,
    date: '10-Apr-2025',
    item: 'Diesel (Purchase) (Stockable)',
    qty: 88.0,
    rate: 256.9,
    amount: 22607.2,
    income: '[FLEET] MF465 (A) Front Bade',
    use: 'Aarangzab'
  }
];

const ConsumptionExpense = () => {
  const { t } = useTranslation();
  const [startDate, setStartDate] = useState('2025-04-08');
  const [endDate, setEndDate] = useState('2025-04-26');
  const [searchQuery, setSearchQuery] = useState('');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const filteredData = dummyData.filter(
    item =>
      item.item.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.income.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.use.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const [formData, setFormData] = useState({
    date: 'DD-MM-YY',
    currentQuantity: -954788.35,
    quantity: 0,
    expenseAccount: 'Semen Expense Bal: 4,854,192.24',
    stockItem: 'Silage Stock (Sale)',
    rate: -4.634154312838023,
    amount: 0
  });

  const renderFormSection = () => (
    <Card sx={{ mb: 3, borderRadius: '12px', boxShadow: 3 }}>
      <CardContent>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  label={t('stock.common.date')}
                  value={formData.date}
                  fullWidth
                  size="small"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label={t('stock.consumptionExpense.currentQuantity')}
                  value={formData.currentQuantity}
                  fullWidth
                  size="small"
                  InputProps={{
                    readOnly: true,
                    sx: {
                      color:
                        formData.currentQuantity < 0 ? 'error.main' : 'inherit'
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label={t('stock.common.quantity')}
                  type="number"
                  value={formData.quantity}
                  fullWidth
                  size="small"
                  onChange={e =>
                    setFormData({ ...formData, quantity: e.target.value })
                  }
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label={t('stock.consumptionExpense.expenseAccount')}
                  value={formData.expenseAccount}
                  fullWidth
                  size="small"
                  InputProps={{ readOnly: true }}
                />
              </Grid>
            </Grid>
          </Grid>

          <Grid item xs={12} md={6}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  label={t('stock.consumptionExpense.stockItem')}
                  value={formData.stockItem}
                  fullWidth
                  size="small"
                  InputProps={{ readOnly: true }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label={t('stock.common.rate')}
                  value={formData.rate}
                  fullWidth
                  size="small"
                  InputProps={{
                    readOnly: true,
                    sx: { color: formData.rate < 0 ? 'error.main' : 'inherit' }
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label={t('stock.common.amount')}
                  value={formData.amount}
                  fullWidth
                  size="small"
                  InputProps={{ readOnly: true }}
                />
              </Grid>
            </Grid>
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button
                variant="outlined"
                sx={{ color: '#005f73', borderColor: '#005f73' }}
              >
                {t('stock.common.reset')}
              </Button>

              <Button
                variant="contained"
                sx={{
                  backgroundColor: '#005f73',
                  '&:hover': { backgroundColor: '#003844' }
                }}
              >
                {t('stock.common.saveChanges')}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
  return (
    <PageContainer title={t('stock.consumptionExpense.title')} subtitle={t('stock.consumptionExpense.subtitle')}>
      <Container maxWidth="lg"  sx={{
    px: isMobile ? '11px' : undefined,
  }}>
        {renderFormSection()}
        <Paper
          elevation={3}
          sx={{
            // p: 4,
            borderRadius: '12px',
            backgroundColor: 'white',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}
        >
          <Box sx={{ p:2 }}>
            <CardContent>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={3}>
                  <TextField
                    type="date"
                    label={t('stock.common.startDate')}
                    size="small"
                    fullWidth
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField
                    type="date"
                    label={t('stock.common.endDate')}
                    size="small"
                    fullWidth
                    value={endDate}
                    onChange={e => setEndDate(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder={t('stock.common.searchPlaceholder')}
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon />
                        </InputAdornment>
                      )
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={2}>
                  <Button
                    fullWidth
                    variant="contained"
                    sx={{
                      backgroundColor: '#005f73',
                      '&:hover': { backgroundColor: '#003844' }
                    }}
                  >
                    {t('stock.common.filter')}
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Box>

          {isMobile ? (
            <Box sx={{ width: '100%' }}>
              {filteredData.map(item => (
                <Card key={item.id} sx={{ mb: 2, boxShadow: 3 }}>
                  <CardContent>
                    <Stack spacing={1}>
                      <Typography variant="subtitle1">{item.date}</Typography>
                      <Typography variant="body2">{t('stock.common.item')}: {item.item}</Typography>
                      <Typography variant="body2">{t('stock.common.qty')}: {item.qty}</Typography>
                      <Typography variant="body2">{t('stock.common.rate')}: {item.rate}</Typography>
                      <Typography variant="body2">
                        {t('stock.common.amount')}: {item.amount.toFixed(2)}
                      </Typography>
                      <Typography variant="body2">
                        {t('stock.consumptionExpense.income')}: {item.income}
                      </Typography>
                      <Typography variant="body2">{t('stock.consumptionExpense.use')}: {item.use}</Typography>
                      <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                        <IconButton size="small">
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small">
                          <DeleteIcon fontSize="small" color="error" />
                        </IconButton>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              ))}
            </Box>
          ) : (
            <Paper
              elevation={3}
              sx={{ borderRadius: '12px', overflowX: 'auto' }}
            >
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#f8f9fA' }}>
                      <TableCell sx={{ fontWeight: 600 }}>{t('stock.common.date')}</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>{t('stock.common.item')}</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>{t('stock.common.qty')}</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>{t('stock.common.rate')}</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>{t('stock.common.amount')}</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>{t('stock.consumptionExpense.income')}</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>{t('stock.consumptionExpense.use')}</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>{t('stock.common.actions')}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredData.map(item => (
                      <TableRow key={item.id} hover>
                        <TableCell>{item.date}</TableCell>
                        <TableCell>{item.item}</TableCell>
                        <TableCell>{item.qty}</TableCell>
                        <TableCell>{item.rate}</TableCell>
                        <TableCell>{item.amount.toFixed(2)}</TableCell>
                        <TableCell>{item.income}</TableCell>
                        <TableCell>{item.use}</TableCell>
                        <TableCell>
                          <IconButton size="small">
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton size="small">
                            <DeleteIcon fontSize="small" color="error" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          )}
        </Paper>
      </Container>
    </PageContainer>
  );
};

export default ConsumptionExpense;
