import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Grid,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useTranslation } from 'react-i18next';

interface AddSemen {
  open: boolean;
  onClose: () => void;
  onSave: (data: any) => void;  // or replace `any` with a proper interface
}

const AddSemen: React.FC<AddSemen> = ({
  open,
  onClose,
  onSave
}) => {
  const { t } = useTranslation();
  // Local form fields
  const [sireName, setSireName] = useState('');
  const [unit, setUnit] = useState('');
  const [rate, setRate] = useState('');
  const [openingStockQty, setOpeningStockQty] = useState('');
  const [openingStockRate, setOpeningStockRate] = useState('');
  const [company, setCompany] = useState('');
  const [tech, setTech] = useState('');

  const handleSaveClick = () => {
    const newData = {
      sireName,
      unit,
      rate,
      openingStockQty,
      openingStockRate,
      company,
      tech
    };

    onSave(newData);   // pass data back to parent
    onClose();         // close dialog
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
    >
      {/* Title row with close icon */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          p: 2
        }}
      >
        <Typography variant="h6" fontWeight="bold">
          {t('itemModal.semen.addNew')}
        </Typography>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </Box>

      <DialogContent dividers>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <TextField
              label={t('itemModal.semen.sireName')}
              placeholder={t('itemModal.semen.sireNamePlaceholder')}
              value={sireName}
              onChange={(e) => setSireName(e.target.value)}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel id="unit-label">{t('itemModal.semen.chooseUnit')}</InputLabel>
              <Select
                labelId="unit-label"
                label={t('itemModal.semen.chooseUnit')}
                value={unit}
                onChange={(e) => setUnit(e.target.value as string)}
              >
                <MenuItem value="">
                  <em>{t('itemModal.semen.select')}</em>
                </MenuItem>
                <MenuItem value="Straw">{t('itemModal.semen.units.straw')}</MenuItem>
                <MenuItem value="ml">ml</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              label={t('itemModal.semen.ratePerUnit')}
              placeholder="0"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              label={t('itemModal.semen.openingStockQty')}
              placeholder="0"
              value={openingStockQty}
              onChange={(e) => setOpeningStockQty(e.target.value)}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              label={t('itemModal.semen.openingStockRate')}
              placeholder="0"
              value={openingStockRate}
              onChange={(e) => setOpeningStockRate(e.target.value)}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel id="company-label">{t('itemModal.semen.company')}</InputLabel>
              <Select
                labelId="company-label"
                label={t('itemModal.semen.company')}
                value={company}
                onChange={(e) => setCompany(e.target.value as string)}
              >
                <MenuItem value="">
                  <em>{t('itemModal.semen.select')}</em>
                </MenuItem>
                <MenuItem value="Semex">Semex</MenuItem>
                <MenuItem value="Genex">Genex</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel id="tech-label">{t('itemModal.semen.tech')}</InputLabel>
              <Select
                labelId="tech-label"
                label={t('itemModal.semen.tech')}
                value={tech}
                onChange={(e) => setTech(e.target.value as string)}
              >
                <MenuItem value="">
                  <em>{t('itemModal.semen.select')}</em>
                </MenuItem>
                <MenuItem value="Dr. Smith">Dr. Smith</MenuItem>
                <MenuItem value="Dr. Jones">Dr. Jones</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button variant="outlined" onClick={onClose}>
          {t('common.cancel')}
        </Button>
        <Button
          variant="contained"
          sx={{ backgroundColor: '#005f73' }}
          onClick={handleSaveClick}
        >
          {t('itemModal.semen.addNew')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddSemen;
