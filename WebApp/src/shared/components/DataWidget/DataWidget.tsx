import React from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import { tokens } from '../../theme/theme';

interface DataWidgetItem {
  icon: string;
  value: string | number;
  label: string;
}

interface DataWidgetProps {
  items: DataWidgetItem[];
}

const DataWidget: React.FC<DataWidgetProps> = ({ items }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
        p: { xs: 1, sm: 2 },
        backgroundColor: theme.palette.background.paper,
        borderRadius: '12px',
        boxShadow:
          theme.palette.mode === 'dark'
            ? '0 2px 4px rgba(0,0,0,0.3)'
            : '0 2px 4px rgba(0,0,0,0.1)',
        width: '100%',
        minWidth: { xs: '100%', sm: '240px' },
        flex: 1
      }}
    >
      {items.map((item, index) => (
        <Box
          key={index}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            py: 1,
            borderBottom:
              index !== items.length - 1
                ? `1px solid ${theme.palette.divider}`
                : 'none'
          }}
        >
          <Box
            sx={{
              width: { xs: 36, sm: 40 },
              height: { xs: 36, sm: 40 },
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: { xs: '1rem', sm: '1.25rem' },
              backgroundColor:
                theme.palette.mode === 'dark' ? colors.primary[400] : '#e0f7fa',
              borderRadius: '50%'
            }}
          >
            {item.icon}
          </Box>
          <Box>
            <Typography
              variant="h6"
              fontWeight="bold"
              sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}
            >
              {item.value}
            </Typography>
            <Typography
              variant="body2"
              color="textSecondary"
              sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
            >
              {item.label}
            </Typography>
          </Box>
        </Box>
      ))}
    </Box>
  );
};

export default DataWidget;
