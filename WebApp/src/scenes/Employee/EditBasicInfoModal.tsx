import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Modal,
  TextField,
  Button,
  IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

export interface BasicInfoValues {
  name: string;
  phone: string;
  city: string;
  address: string;
}

interface EditBasicInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialValues?: Partial<BasicInfoValues>;
  onSave?: (values: BasicInfoValues) => Promise<void> | void;
}

const EditBasicInfoModal: React.FC<EditBasicInfoModalProps> = ({
  isOpen,
  onClose,
  initialValues,
  onSave
}) => {
  const [values, setValues] = useState<BasicInfoValues>({
    name: '',
    phone: '',
    city: '',
    address: ''
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setValues({
        name: initialValues?.name || '',
        phone: initialValues?.phone || '',
        city: initialValues?.city || '',
        address: initialValues?.address || ''
      });
    }
  }, [isOpen, initialValues]);

  const handleChange = (field: keyof BasicInfoValues, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleUpdate = async () => {
    setSaving(true);
    try {
      await onSave?.(values);
      onClose();
    } catch (error) {
      console.error('Failed to update basic info', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={isOpen} onClose={onClose}>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '80%',
          maxWidth: 700,
          bgcolor: 'background.paper',
          borderRadius: 2,
          boxShadow: 24,
          p: 4,
          outline: 'none'
        }}
      >
        <Box display="flex" justifyContent="space-between" mb={3}>
          <Typography variant="h6" fontWeight="bold">
            Edit Basic Info
          </Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>

        <Box display="grid" gridTemplateColumns="repeat(2, 1fr)" gap={2}>
          <TextField
            label="Employee Name"
            value={values.name}
            onChange={(e) => handleChange('name', e.target.value)}
            fullWidth
          />
          <TextField
            label="Phone Number"
            value={values.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            fullWidth
          />
          <TextField
            label="City"
            value={values.city}
            onChange={(e) => handleChange('city', e.target.value)}
            fullWidth
          />
          <TextField
            label="Address"
            value={values.address}
            onChange={(e) => handleChange('address', e.target.value)}
            fullWidth
          />
        </Box>

        <Box display="flex" justifyContent="center" mt={4} gap={2}>
          <Button
            variant="outlined"
            onClick={onClose}
            sx={{
              borderRadius: '8px',
              textTransform: 'none',
              fontWeight: 'bold'
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleUpdate}
            disabled={saving}
            sx={{
              backgroundColor: '#005f73',
              color: '#fff',
              borderRadius: '8px',
              textTransform: 'none',
              fontWeight: 'bold',
              '&:hover': {
                backgroundColor: '#007f91'
              }
            }}
          >
            {saving ? 'Updating...' : 'Update'}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default EditBasicInfoModal;
