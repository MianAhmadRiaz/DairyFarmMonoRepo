import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Modal } from '@mui/material';
import { useTranslation } from 'react-i18next';

interface AddItemModalProps {
  label:string
  isOpen: boolean;
  onClose: () => void;
  onAdd: (penID: string) => void;
}

const AddItemModal: React.FC<AddItemModalProps> = ({
  label,
  isOpen,
  onClose,
  onAdd
}) => {
  const { t } = useTranslation();
  const [newItem, setNewItem] = useState('');

  const handleAddNewItem = () => {
    if (newItem.trim() !== '') {
      onAdd(newItem.trim());
      setNewItem('');
      onClose();
    }
  };

  return (
    <Modal open={isOpen} onClose={onClose} aria-labelledby="add-pen-modal">
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 400,
          bgcolor: 'background.paper',
          borderRadius: 2,
          boxShadow: 24,
          p: 3,
          outline: 'none'
        }}
      >
        <Typography id="add-pen-modal" variant="h6" fontWeight="bold" mb={2}>
          {t('itemModal.addNew', { label })}
        </Typography>

        <TextField
          fullWidth
          label={t('itemModal.newLabel', { label })}
          variant="outlined"
          value={newItem}
          onChange={e => setNewItem(e.target.value)}
          sx={{ mb: 2 }}
        />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
          <Button
            variant="outlined"
            onClick={onClose}
            sx={{
              textTransform: 'none',
              padding: '8px 20px',
              borderRadius: '8px',
              fontWeight: 'bold'
            }}
          >
            {t('common.cancel')}
          </Button>

          <Button
            variant="contained"
            onClick={handleAddNewItem}
            sx={{
              backgroundColor: '#005f73',
              color: '#ffffff',
              textTransform: 'none',
              padding: '8px 20px',
              borderRadius: '8px',
              fontWeight: 'bold',
              '&:hover': { backgroundColor: '#007f91' }
            }}
          >
            {t('common.add')}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default AddItemModal;
