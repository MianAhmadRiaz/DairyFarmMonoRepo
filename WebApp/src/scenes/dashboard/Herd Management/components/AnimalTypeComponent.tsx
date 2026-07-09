import { Grid, MenuItem, TextField } from '@mui/material';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

const AnimalTypeComponent = () => {
  const { t } = useTranslation();
  const [animalType, setAnimalType] = useState(false);
  const [typeOptions, setTypeOptions] = useState(['Cattle', 'Buffalo', 'Goat']);

  return (
    <>
      <Grid item xs={12} md={4}>
        <TextField
          fullWidth
          select
          label={t('herd.common.animalType')}
          variant="outlined"
          value={animalType}
          onChange={(e: any) => setAnimalType(e.target.value)}
        >
          {typeOptions.map((option, index) => (
            <MenuItem key={index} value={option}>
              {t('herd.animalTypes.' + option, option)}
            </MenuItem>
          ))}
        </TextField>
      </Grid>
    </>
  );
};

export default AnimalTypeComponent;
