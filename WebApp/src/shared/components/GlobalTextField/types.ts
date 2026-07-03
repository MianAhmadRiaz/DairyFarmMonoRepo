import { TextFieldProps } from '@mui/material/TextField';

// Base props for GlobalTextField
export interface GlobalTextFieldProps extends Omit<TextFieldProps, 'variant'> {
  name?: string;
  label: string;
  type?: string;
  value?: string | number;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  error?: boolean;
  helperText?: string;
  select?: boolean;
  children?: React.ReactNode;
  fullWidth?: boolean;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  multiline?: boolean;
  rows?: number;
  maxRows?: number;
  minRows?: number;
  size?: 'small' | 'medium';
  color?: 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
  margin?: 'none' | 'dense' | 'normal';
  autoFocus?: boolean;
  autoComplete?: string;
  inputProps?: object;
  InputProps?: object;
  inputRef?: React.RefObject<HTMLInputElement>;
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
  onFocus?: (event: React.FocusEvent<HTMLInputElement>) => void;
  onKeyDown?: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  onKeyUp?: (event: React.KeyboardEvent<HTMLInputElement>) => void;
}

// Props for Select Field
export interface GlobalSelectFieldProps extends GlobalTextFieldProps {
  options: SelectOption[];
}

// Select Option Type
export interface SelectOption {
  value: string | number;
  label: string;
}

// Props for Number Field
export interface GlobalNumberFieldProps extends GlobalTextFieldProps {
  min?: number;
  max?: number;
  step?: number;
}

// Props for Date Field
export interface GlobalDateFieldProps extends GlobalTextFieldProps {
  minDate?: string;
  maxDate?: string;
}

// Props for Time Field
export interface GlobalTimeFieldProps extends GlobalTextFieldProps {
  minTime?: string;
  maxTime?: string;
}

// Props for Password Field
export interface GlobalPasswordFieldProps extends GlobalTextFieldProps {
  showPassword?: boolean;
  onTogglePassword?: () => void;
}

// Props for Search Field
export interface GlobalSearchFieldProps extends GlobalTextFieldProps {
  onSearch?: (value: string) => void;
  debounceTime?: number;
}

// Props for Currency Field
export interface GlobalCurrencyFieldProps extends GlobalTextFieldProps {
  currency?: string;
  decimalPlaces?: number;
}

// Props for Phone Field
export interface GlobalPhoneFieldProps extends GlobalTextFieldProps {
  countryCode?: string;
  format?: string;
}

// Props for Email Field
export interface GlobalEmailFieldProps extends GlobalTextFieldProps {
  domain?: string;
}

// Props for URL Field
export interface GlobalURLFieldProps extends GlobalTextFieldProps {
  protocol?: string;
}

// Props for File Upload Field
export interface GlobalFileUploadFieldProps extends GlobalTextFieldProps {
  accept?: string;
  multiple?: boolean;
  maxSize?: number;
  onFileChange?: (files: FileList | null) => void;
}

// Props for Rich Text Field
export interface GlobalRichTextFieldProps extends GlobalTextFieldProps {
  toolbar?: boolean;
  placeholder?: string;
  onContentChange?: (content: string) => void;
}

// Props for AutoComplete Field
export interface GlobalAutoCompleteFieldProps extends GlobalTextFieldProps {
  options: string[];
  onOptionSelect?: (value: string) => void;
  freeSolo?: boolean;
}

// Props for Tag Field
export interface GlobalTagFieldProps extends GlobalTextFieldProps {
  tags: string[];
  onTagsChange?: (tags: string[]) => void;
  maxTags?: number;
}

// Props for Rating Field
export interface GlobalRatingFieldProps extends GlobalTextFieldProps {
  max?: number;
  precision?: number;
  readOnly?: boolean;
  onRatingChange?: (value: number) => void;
}

// Props for Slider Field
export interface GlobalSliderFieldProps extends GlobalTextFieldProps {
  min?: number;
  max?: number;
  step?: number;
  marks?: boolean;
  valueLabelDisplay?: 'on' | 'auto' | 'off';
  onSliderChange?: (value: number | number[]) => void;
}
