import React from 'react';
import { Box, Typography, useTheme } from '@mui/material';

interface EmptyStateProps {
  icon?: string;
  title: string;
  subtitle?: string;
}

// Honest "not tracked" / "no data yet" state — used instead of ever showing a
// fabricated zero or fake chart when the underlying data genuinely doesn't exist.
const EmptyState: React.FC<EmptyStateProps> = ({ icon = '📭', title, subtitle }) => {
  const theme = useTheme();
  return (
    <Box sx={{ textAlign: 'center', py: 4, color: theme.palette.text.secondary }}>
      <Typography sx={{ fontSize: 28, mb: 1 }}>{icon}</Typography>
      <Typography sx={{ fontSize: 13.5, fontWeight: 600 }}>{title}</Typography>
      {subtitle && <Typography sx={{ fontSize: 12, mt: 0.5 }}>{subtitle}</Typography>}
    </Box>
  );
};

export default EmptyState;
