import React from 'react';
import { Box } from '@mui/material';
import Header from '../Header/Header';
import useLayoutShift from '../Hooks/useLayoutShift';
import { getSidebarOffset, TOPBAR_HEIGHT } from './layoutConstants';

interface PageContainerProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  maxWidth?: number | string;
}

// Single shared layout shell for every page: owns the sidebar-offset margin,
// the fixed-Topbar top offset, content centering, and the page title/subtitle.
// Replaces the ~110 hand-copied (and mutually inconsistent) per-page Box+Header
// boilerplate blocks that previously each guessed their own margin-left value.
const PageContainer: React.FC<PageContainerProps> = ({ title, subtitle, children, actions, maxWidth = 1400 }) => {
  const { isMobile, isCollapsed } = useLayoutShift();
  const offset = getSidebarOffset(isMobile, isCollapsed);

  return (
    <Box
      sx={{
        ml: { xs: 0, md: `${offset}px` },
        mt: `${TOPBAR_HEIGHT}px`,
        transition: 'margin-left 0.3s ease',
        minHeight: `calc(100vh - ${TOPBAR_HEIGHT}px)`,
        px: { xs: 2, sm: 3 },
        py: { xs: 2, sm: 3 }
      }}
    >
      <Box sx={{ maxWidth, width: '100%', mx: 'auto' }}>
        <Header title={title} subtitle={subtitle} actions={actions} />
        {children}
      </Box>
    </Box>
  );
};

export default PageContainer;
