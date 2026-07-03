import React from 'react';
import { TextField } from '@mui/material';
import { GlobalTextFieldProps } from './types';

const GlobalTextField: React.FC<GlobalTextFieldProps> = ({
  name,
  label,
  type = 'text',
  value,
  onChange,
  error,
  helperText,
  select,
  children,
  fullWidth = true,
  ...props
}) => {
  return (
    <TextField
      name={name}
      label={label}
      type={type}
      value={value}
      onChange={onChange}
      error={error}
      helperText={helperText}
      select={select}
      fullWidth={fullWidth}
      variant="outlined"
      sx={{
        '& .MuiOutlinedInput-root': {
          borderRadius: '8px',
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#1976d2'
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#1976d2',
            borderWidth: '2px'
          }
        },
        '& .MuiInputLabel-root': {
          color: '#666',
          '&.Mui-focused': {
            color: '#1976d2'
          }
        },
        '& .MuiInputBase-input': {
          padding: '12px 14px'
        },
        '& .MuiSelect-select': {
          padding: '12px 14px'
        }
      }}
      {...props}
    >
      {children}
    </TextField>
  );
};

export default GlobalTextField;
