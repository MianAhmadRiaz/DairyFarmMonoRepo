import React from 'react';
import { Chip, Tooltip } from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { useTranslation } from 'react-i18next';

interface EstimateBadgeProps {
  notes: string;
}

// Shared disclosure chip for any approximated number (per-cow profitability,
// estimated milk income, etc.) — never shown mixed in with real numbers
// without this label.
const EstimateBadge: React.FC<EstimateBadgeProps> = ({ notes }) => {
  const { t } = useTranslation();

  return (
  <Tooltip title={notes} arrow placement="top">
    <Chip
      size="small"
      icon={<InfoOutlinedIcon sx={{ fontSize: 14 }} />}
      label={t('shared.estimateBadge.estimated')}
      sx={{
        height: 20,
        fontSize: 10.5,
        fontWeight: 600,
        bgcolor: 'transparent',
        border: '1px solid',
        borderColor: 'warning.main',
        color: 'warning.main',
        '& .MuiChip-icon': { color: 'warning.main', ml: '4px' },
      }}
    />
  </Tooltip>
  );
};

export default EstimateBadge;
