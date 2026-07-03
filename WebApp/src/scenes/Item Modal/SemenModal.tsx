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
          Add New
        </Typography>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </Box>

      <DialogContent dividers>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <TextField
              label="Sire Name"
              placeholder="Semen Name Here"
              value={sireName}
              onChange={(e) => setSireName(e.target.value)}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel id="unit-label">Choose Unit</InputLabel>
              <Select
                labelId="unit-label"
                label="Choose Unit"
                value={unit}
                onChange={(e) => setUnit(e.target.value as string)}
              >
                <MenuItem value="">
                  <em>Select</em>
                </MenuItem>
                <MenuItem value="Straw">Straw</MenuItem>
                <MenuItem value="ml">ml</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              label="Rate w.r.t 1 Unit"
              placeholder="0"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              label="Opening Stock Quantity"
              placeholder="0"
              value={openingStockQty}
              onChange={(e) => setOpeningStockQty(e.target.value)}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              label="Opening Stock rate w.r.t 1 Unit"
              placeholder="0"
              value={openingStockRate}
              onChange={(e) => setOpeningStockRate(e.target.value)}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel id="company-label">Company</InputLabel>
              <Select
                labelId="company-label"
                label="Company"
                value={company}
                onChange={(e) => setCompany(e.target.value as string)}
              >
                <MenuItem value="">
                  <em>Select</em>
                </MenuItem>
                <MenuItem value="Semex">Semex</MenuItem>
                <MenuItem value="Genex">Genex</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel id="tech-label">Tech</InputLabel>
              <Select
                labelId="tech-label"
                label="Tech"
                value={tech}
                onChange={(e) => setTech(e.target.value as string)}
              >
                <MenuItem value="">
                  <em>Select</em>
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
          Cancel
        </Button>
        <Button
          variant="contained"
          sx={{ backgroundColor: '#005f73' }}
          onClick={handleSaveClick}
        >
          Add New
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddSemen;
