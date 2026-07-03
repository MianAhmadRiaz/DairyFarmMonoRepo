import React from 'react';
import { Typography, Box, useTheme } from '@mui/material';
import { tokens } from '../../theme/theme';

interface HeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

const Header: React.FC<HeaderProps> = ({ title, subtitle, actions }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette?.mode || 'light');

  return (
    <Box
      mb={4}
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: { xs: 'flex-start', sm: 'center' },
        justifyContent: 'space-between',
        gap: { xs: 1.5, sm: 2 }
      }}
    >
      <Box>
        <Typography
          variant="h2"
          sx={{
            color: colors.grey?.[100] || '#000',
            fontWeight: 'bold',
            margin: '0 0 5px 0',
            fontSize: {
              xs: '1.5rem',
              sm: '1.8rem',
              md: '2rem',
              lg: '2.2rem'
            },
            lineHeight: {
              xs: 1.2,
              sm: 1.3,
              md: 1.4
            }
          }}
        >
          {title}
        </Typography>
        {subtitle && (
          <Typography
            variant="h5"
            sx={{
              color: colors.greenAccent?.[400] || '#00FF00',
              fontSize: {
                xs: '0.9rem',
                sm: '1rem',
                md: '1.1rem',
                lg: '1.2rem'
              },
              lineHeight: {
                xs: 1.3,
                sm: 1.4,
                md: 1.5
              }
            }}
          >
            {subtitle}
          </Typography>
        )}
      </Box>
      {actions && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
          {actions}
        </Box>
      )}
    </Box>
  );
};

export default Header;
