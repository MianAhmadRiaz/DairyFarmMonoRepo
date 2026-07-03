import { useTheme } from '@mui/material';
import { useContext } from 'react';
import { ColorModeContext, tokens } from '../theme/theme';

/**
 * Custom hook to access theme colors and mode toggle throughout the app
 *
 * Usage:
 * const { colors, mode, toggleColorMode, isDark } = useThemeColors();
 *
 * Then use:
 * - colors.primary[400] for theme-aware colors
 * - isDark to conditionally render based on mode
 * - toggleColorMode() to switch between light/dark
 */
export const useThemeColors = () => {
  const theme = useTheme();
  const colorMode = useContext(ColorModeContext);
  const colors = tokens(theme.palette.mode);
  const mode = theme.palette.mode;
  const isDark = mode === 'dark';

  return {
    theme,
    colors,
    mode,
    isDark,
    toggleColorMode: colorMode.toggleColorMode,
    // Common color shortcuts for components
    palette: {
      // Background colors
      background: isDark ? colors.primary[500] : '#F4F8F7',
      paper: isDark ? colors.primary[400] : '#FFFFFF',
      card: isDark ? colors.primary[400] : '#FFFFFF',

      // Text colors
      textPrimary: isDark ? colors.grey[100] : colors.grey[100],
      textSecondary: isDark ? colors.grey[300] : colors.grey[500],

      // Table colors
      tableHeader: isDark ? colors.primary[400] : '#F8F9FA',
      tableRow: isDark ? colors.primary[500] : '#FFFFFF',
      tableRowHover: isDark ? colors.primary[400] : '#f8f9fa',
      tableBorder: isDark ? colors.grey[700] : '#e0e0e0',

      // Input colors
      inputBackground: isDark ? colors.primary[400] : '#f8f8f8',
      inputBorder: isDark ? colors.grey[600] : '#d6d6d6',

      // Button colors
      primaryButton: '#005f73',
      secondaryButton: isDark ? colors.grey[600] : '#CECECE',

      // Accent colors
      accent: colors.greenAccent[500],
      error: colors.redAccent[500],
      warning: '#ff9800',
      info: colors.blueAccent[500],

      // Shadow
      shadow: isDark
        ? '0 4px 12px rgba(0, 0, 0, 0.3)'
        : '0 4px 12px rgba(0, 0, 0, 0.1)'
    }
  };
};

export default useThemeColors;
