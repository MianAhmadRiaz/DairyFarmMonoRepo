// src/components/Dropdown.tsx
import React from 'react';
import {
  TextField,
  MenuItem,
  TextFieldProps,
  SelectChangeEvent
} from '@mui/material';
import { useTranslation } from 'react-i18next';

export interface Option {
  /** value stored in state / sent to backend */
  value: string;
  /** text the user sees */
  label: string;
}

export interface DropdownProps {
  /** Field label shown above the input */
  label: string;
  /** Name attribute — keeps your existing handleInputChange logic working */
  name: string;
  /** Currently-selected value */
  value: string;
  /** List of options to show */
  options: Option[];
  /** Standard onChange handler you already pass to TextField */
  onChange: (event: SelectChangeEvent<string>) => void;
  /** Optional “+ Add New …” callback */
  onAddNew?: () => void;
  /** Text for that “add new” row (default: "+ Add New") */
  addLabel?: string;
  /** Pass through most TextField props (size, disabled, etc.) */
  textFieldProps?: Omit<
    TextFieldProps,
    'select' | 'name' | 'value' | 'onChange' | 'label'
  >;
}

const Dropdown: React.FC<DropdownProps> = ({
  label,
  name,
  value,
  options,
  onChange,
  onAddNew,
  addLabel,
  textFieldProps
}) => {
  const { t } = useTranslation();

  return (
  <TextField
    select
    fullWidth
    variant="outlined"
    label={label}
    name={name}
    value={value}
    onChange={onChange}
    {...textFieldProps}
  >
    {options.map(opt => (
      <MenuItem key={opt.value} value={opt.value}>
        {opt.label}
      </MenuItem>
    ))}

    {onAddNew && (
      <MenuItem
        onClick={onAddNew}
        sx={{
          color: '#1976d2',
          fontWeight: 'bold',
          borderTop: '1px solid #ddd'
        }}
      >
        {addLabel || t('shared.dropdown.addNew')}
      </MenuItem>
    )}
  </TextField>
  );
};

export default Dropdown;
