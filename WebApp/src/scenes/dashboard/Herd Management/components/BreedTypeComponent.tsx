import { Grid, MenuItem, Modal, TextField } from '@mui/material';
import React, { useState } from 'react';
import AddItemModal from '../../../Item Modal/AddItemModal';

const BreedTypeComponent = () => {
  const [isModalOpen, setModalOpen] = useState(false);
  const [typeOptions, setTypeOptions] = useState(['Angus', 'Australian']);

  const [breedType, setBreedType] = useState('');
  const handleOpenModal = () => setModalOpen(true);
  const handleCloseModal = () => setModalOpen(false);

  const handleAddBreedType = (newPenID: string) => {
    setTypeOptions([...typeOptions, newPenID]);
  };

  return (
    <>
      <Grid item xs={12} md={4}>
        <TextField
          fullWidth
          select
          label="BreedType"
          variant="outlined"
          value={breedType}
          onChange={e => setBreedType(e.target.value)}
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
          {typeOptions?.map((option, index) => (
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
            Add New Breed Type
          </MenuItem>
        </TextField>
      </Grid>
      {/* Modal for Adding New Pen ID */}
      <Modal open={isModalOpen} onClose={handleCloseModal}>
        <AddItemModal
          label="Breed Type"
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onAdd={handleAddBreedType}
        />
      </Modal>
    </>
  );
};

export default BreedTypeComponent;
