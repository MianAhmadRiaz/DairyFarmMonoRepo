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
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();
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
      <DialogTitle sx={{ fontWeight: 'bold' }}>{t('milking.common.addNew')}</DialogTitle>

      <DialogContent>
        {/* Top row: Cow ID, Milking Time, Amount */}
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          {/* Cow ID */}
          <FormControl fullWidth>
            <InputLabel id="cow-id-modal-label">{t('milking.common.cowId')}</InputLabel>
            <Select
              labelId="cow-id-modal-label"
              label={t('milking.common.cowId')}
              value={selectedCowId}
              onChange={(e) => setSelectedCowId(e.target.value as number | 'Select')}
            >
              <MenuItem value="Select">{t('milking.common.select')}</MenuItem>
              {/* Example cow IDs, or map your real IDs here */}
              <MenuItem value={1246}>1246</MenuItem>
              <MenuItem value={5674}>5674</MenuItem>
              <MenuItem value={9999}>9999</MenuItem>
            </Select>
          </FormControl>

          {/* Milking Time */}
          <FormControl fullWidth>
            <InputLabel id="milking-time-label">{t('milking.common.milkingTime')}</InputLabel>
            <Select
              labelId="milking-time-label"
              label={t('milking.common.milkingTime')}
              value={milkingTime}
              onChange={(e) => setMilkingTime(e.target.value as string)}
            >
              <MenuItem value="">{t('milking.common.select')}</MenuItem>
              <MenuItem value="Morning">{t('milking.common.milkingTimes.morning')}</MenuItem>
              <MenuItem value="Afternoon">{t('milking.common.milkingTimes.afternoon')}</MenuItem>
              <MenuItem value="Evening">{t('milking.common.milkingTimes.evening')}</MenuItem>
            </Select>
          </FormControl>

          {/* Amount in Liters */}
          <TextField
            label={t('milking.common.amountInLiters')}
            type="number"
            value={liters}
            onChange={(e) => setLiters(e.target.value)}
            fullWidth
          />
        </Box>

        {/* Remarks field */}
        <Box sx={{ mb: 2 }}>
          <TextField
            label={t('milking.common.remarks')}
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
            <InputLabel id="report-to-label">{t('milking.common.reportTo')}</InputLabel>
            <Select
              labelId="report-to-label"
              label={t('milking.common.selectTech')}
              value={tech}
              onChange={(e) => setTech(e.target.value as string)}
            >
              <MenuItem value="">{t('milking.common.selectTech')}</MenuItem>
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
          {t('common.cancel')}
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
          {t('common.add')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddMilkingModal;
