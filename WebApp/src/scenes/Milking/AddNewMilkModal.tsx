// src/scenes/Milking/AddMilkingModal.tsx
import React, { useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import { tokens } from '../../shared/theme/theme';

interface AddMilkingModalProps {
  open: boolean;
  cowId: number | null;
  onClose: () => void;
}

const AddMilkingModal: React.FC<AddMilkingModalProps> = ({
  open,
  cowId,
  onClose,
}) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  // Local form states
  const [milkingTime, setMilkingTime] = useState('');
  const [liters, setLiters] = useState('0');
  const [remarks, setRemarks] = useState('');
  const [tech, setTech] = useState('');

  // If you want to sync the cow ID as well, or show it read-only, up to you:
  const [selectedCowId, setSelectedCowId] = useState<number | 'Select'>(
    cowId || 'Select'
  );

  // If the modal re-opens for a new cow, you might want to reset states (not shown here).

  const handleSave = () => {
    // TODO: Validate & submit form data
    console.log('Saving new milking entry:', {
      cowId: selectedCowId,
      milkingTime,
      liters,
      remarks,
      tech,
    });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ fontWeight: 'bold' }}>Add New</DialogTitle>

      <DialogContent>
        {/* Top row: Cow ID, Milking Time, Amount */}
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          {/* Cow ID */}
          <FormControl fullWidth>
            <InputLabel id="cow-id-modal-label">Cow ID</InputLabel>
            <Select
              labelId="cow-id-modal-label"
              label="Cow ID"
              value={selectedCowId}
              onChange={(e) => setSelectedCowId(e.target.value as number | 'Select')}
            >
              <MenuItem value="Select">Select</MenuItem>
              {/* Example cow IDs, or map your real IDs here */}
              <MenuItem value={1246}>1246</MenuItem>
              <MenuItem value={5674}>5674</MenuItem>
              <MenuItem value={9999}>9999</MenuItem>
            </Select>
          </FormControl>

          {/* Milking Time */}
          <FormControl fullWidth>
            <InputLabel id="milking-time-label">Milking Time</InputLabel>
            <Select
              labelId="milking-time-label"
              label="Milking Time"
              value={milkingTime}
              onChange={(e) => setMilkingTime(e.target.value as string)}
            >
              <MenuItem value="">Select</MenuItem>
              <MenuItem value="Morning">Morning</MenuItem>
              <MenuItem value="Afternoon">Afternoon</MenuItem>
              <MenuItem value="Evening">Evening</MenuItem>
            </Select>
          </FormControl>

          {/* Amount in Liters */}
          <TextField
            label="Amount in Liters"
            type="number"
            value={liters}
            onChange={(e) => setLiters(e.target.value)}
            fullWidth
          />
        </Box>

        {/* Remarks field */}
        <Box sx={{ mb: 2 }}>
          <TextField
            label="Remarks"
            multiline
            rows={4}
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            fullWidth
          />
        </Box>

        {/* Report to dropdown */}
        <Box sx={{ width: '50%' }}>
          <FormControl fullWidth>
            <InputLabel id="report-to-label">Report to</InputLabel>
            <Select
              labelId="report-to-label"
              label="Select Tech"
              value={tech}
              onChange={(e) => setTech(e.target.value as string)}
            >
              <MenuItem value="">Select Tech</MenuItem>
              <MenuItem value="Tech A">Tech A</MenuItem>
              <MenuItem value="Tech B">Tech B</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </DialogContent>

      <DialogActions sx={{ pr: 3, pb: 2 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{ textTransform: 'none', mr: 2 }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          sx={{
            backgroundColor: '#295d5d',
            ':hover': { backgroundColor: '#1f4848' },
            textTransform: 'none',
          }}
        >
          Add
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddMilkingModal;
