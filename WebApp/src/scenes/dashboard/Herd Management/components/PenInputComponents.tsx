import { Grid, MenuItem, Modal, TextField } from '@mui/material';
import React, { useState } from 'react';
import AddItemModal from '../../../Item Modal/AddItemModal';

const PenInputComponent = () => {
  const [isModalOpen, setModalOpen] = useState(false);
  const [penOptions, setPenOptions] = useState([
    'Close Up Animals',
    'Heifers',
    'Sucklers (Heifers)'
  ]);

  const [penID, setPenID] = useState('');
  const handleOpenModal = () => setModalOpen(true);
  const handleCloseModal = () => setModalOpen(false);

  const handleAddNewPenID = (newPenID: string) => {
    setPenOptions([...penOptions, newPenID]);
  };

  return (
    <>
      <Grid item xs={12} md={4}>
        <TextField
          fullWidth
          select
          label="Pen ID"
          variant="outlined"
          value={penID}
          onChange={e => setPenID(e.target.value)}
          SelectProps={{
            MenuProps: {
              PaperProps: {
                style: {
                  maxHeight: 200,
                  overflowY: 'auto'
                }
              }
            }
          }}
        >
          {penOptions.map((option, index) => (
            <MenuItem key={index} value={option}>
              {option}
            </MenuItem>
          ))}
          <MenuItem
            onClick={handleOpenModal}
            sx={{
              color: '#1976d2',
              fontWeight: 'bold',
              borderTop: '1px solid #ddd'
            }}
          >
            Add New Pen ID
          </MenuItem>
        </TextField>
      </Grid>
      {/* Modal for Adding New Pen ID */}
      <Modal open={isModalOpen} onClose={handleCloseModal}>
        <AddItemModal
          label="Pen ID"
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onAdd={handleAddNewPenID}
        />
      </Modal>
    </>
  );
};

export default PenInputComponent;
