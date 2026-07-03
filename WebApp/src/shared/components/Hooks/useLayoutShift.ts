// src/hooks/useLayoutShift.ts
import {  useSelector } from 'react-redux';
import { useTheme, useMediaQuery } from '@mui/material';

import { RootState } from '../../store';
const useLayoutShift = () => {

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const isCollapsed = useSelector(
    (state: RootState) => state.sidebar.sidebarCollapsed
  );

  return { isMobile, isCollapsed };
};

export default useLayoutShift;
