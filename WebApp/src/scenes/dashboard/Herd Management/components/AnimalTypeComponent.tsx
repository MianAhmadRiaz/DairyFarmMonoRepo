import { Grid, MenuItem, TextField } from '@mui/material';
import React, { useState } from 'react';

const AnimalTypeComponent = () => {
  const [animalType, setAnimalType] = useState(false);
  const [typeOptions, setTypeOptions] = useState(['Cattle', 'Buffalo', 'Goat']);

  return (
    <>
      <Grid item xs={12} md={4}>
        <TextField
          fullWidth
          select
          label="Animal Type"
          variant="outlined"
          value={animalType}
          onChange={(e: any) => setAnimalType(e.target.value)}
        >
          {typeOptions.map((option, index) => (
            <MenuItem key={index} value={option}>
              {option}
            </MenuItem>
          ))}
        </TextField>
      </Grid>
    </>
  );
};

export default AnimalTypeComponent;
