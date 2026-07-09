import React from 'react';
import { Box, Typography, Chip } from '@mui/material';
import { useTranslation } from 'react-i18next';

interface StatusProps {
  status: 'active' | 'inactive' | 'pending' | 'completed' | 'cancelled';
  label?: string;
  size?: 'small' | 'medium' | 'large';
}

const Status: React.FC<StatusProps> = ({ status, label, size = 'medium' }) => {
  const { t } = useTranslation();

  const getStatusColor = () => {
    switch (status) {
      case 'active':
        return { bg: '#E9F4D1', text: '#7DAD3F', label: t('shared.status.active') };
      case 'inactive':
        return { bg: '#FCD1B259', text: '#F79009', label: t('shared.status.inactive') };
      case 'pending':
        return { bg: '#fff3e0', text: '#ef6c00', label: t('shared.status.pending') };
      case 'completed':
        return { bg: '#e3f2fd', text: '#1565c0', label: t('shared.status.completed') };
      case 'cancelled':
        return { bg: '#f5f5f5', text: '#616161', label: t('shared.status.cancelled') };
      default:
        return { bg: '#f5f5f5', text: '#616161', label: t('shared.status.unknown') };
    }
  };

  const statusColor = getStatusColor();

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Chip
        label={statusColor.label}
        sx={{
          backgroundColor: statusColor.bg,
          color: statusColor.text,
          fontWeight: 'bold',
          borderRadius: '20px',
          height:
            size === 'small' ? '24px' : size === 'large' ? '32px' : '28px',
          '& .MuiChip-label': {
            px: size === 'small' ? 1 : size === 'large' ? 2.3 : 2.2,
            fontSize:
              size === 'small'
                ? '0.75rem'
                : size === 'large'
                ? '1rem'
                : '0.875rem'
          }
        }}
      />
    </Box>
  );
};

export default Status;
