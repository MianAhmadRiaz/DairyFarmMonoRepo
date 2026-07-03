import React from 'react';
import { Box, Typography, IconButton, useTheme } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { tokens } from '../../theme/theme';

const ChartHeaderWidget = ({ title }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  return (
    <Box display="flex" justifyContent="space-between" alignItems="center">
      <Typography variant="body1" fontWeight="bold">
        {title}
      </Typography>
      <IconButton
        size="small"
        sx={{
          bgcolor:
            theme.palette.mode === 'dark' ? colors.primary[400] : '#f0f0f0'
        }}
      >
        <MoreVertIcon />
      </IconButton>
    </Box>
  );
};

export default ChartHeaderWidget;
