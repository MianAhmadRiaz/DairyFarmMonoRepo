import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  useTheme
} from '@mui/material';
import { tokens } from '../../theme/theme.jsx';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  onSubmit?: () => void;
  submitText?: string;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

const Modal: React.FC<ModalProps> = ({
  open,
  onClose,
  title,
  children,
  onSubmit,
  submitText = 'Submit',
  maxWidth = 'sm'
}) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={maxWidth}
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '12px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
        }
      }}
    >
      <DialogTitle>
        <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#00000' }}>
          {title}
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ py: 2 }}>{children}</Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{
            borderRadius: '8px',
            textTransform: 'none',
            px: 3
          }}
        >
          Cancel
        </Button>
        {onSubmit && (
          <Button
            onClick={onSubmit}
            variant="contained"
            sx={{
              borderRadius: '8px',
              textTransform: 'none',
              backgroundColor: '#005f73',
              color: '#ffffff',
              px: 3
            }}
          >
            {submitText}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default Modal;
