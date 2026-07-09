import React from 'react';
import { Box, Typography, Chip, useMediaQuery, useTheme } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { tokens } from '../../theme/theme';

interface HealthAlertProps {
  title: string;
  cases: number;
  status: 'TREATED' | 'UNTREATED';
}

const HealthAlert: React.FC<HealthAlertProps> = ({ title, cases, status }) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box
      sx={{
        padding: isMobile ? '8px' : '10px',
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: '6px',
        boxShadow:
          theme.palette.mode === 'dark'
            ? '0 1px 2px rgba(0,0,0,0.3)'
            : '0 1px 2px rgba(0,0,0,0.08)',
        backgroundColor: theme.palette.background.paper,
        marginBottom: '6px'
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          justifyContent: 'space-between',
          alignItems: isMobile ? 'flex-start' : 'center',
          gap: isMobile ? 1 : 0
        }}
      >
        <Box>
          <Typography
            variant={isMobile ? 'body2' : 'subtitle2'}
            fontWeight="bold"
            sx={{ fontSize: isMobile ? '0.85rem' : '0.9rem' }}
          >
            {title}
          </Typography>
          <Typography
            variant="caption"
            color="textSecondary"
            sx={{ fontSize: '0.7rem' }}
          >
            {t('shared.healthAlert.cases', { count: cases })}
          </Typography>
        </Box>
        <Chip
          label={t(`shared.healthAlert.status.${status}`, status)}
          color={status === 'TREATED' ? 'success' : 'error'}
          size="small"
          sx={{
            fontWeight: 'bold',
            fontSize: '0.65rem',
            height: '20px'
          }}
        />
      </Box>
    </Box>
  );
};

export default HealthAlert;
