import React from 'react';
import { Box, Typography, useTheme, alpha } from '@mui/material';
import GlassCard from './GlassCard';

interface StatTileProps {
  icon?: string;
  label: string;
  value: React.ReactNode;
  sublabel?: string;
  accent?: string;
  delay?: number;
  trend?: { direction: 'up' | 'down' | 'flat'; label: string };
}

const StatTile: React.FC<StatTileProps> = ({ icon, label, value, sublabel, accent, delay = 0, trend }) => {
  const theme = useTheme();
  const color = accent || theme.palette.secondary.main;

  const trendColor =
    trend?.direction === 'up' ? '#3da58a' : trend?.direction === 'down' ? '#db4f4a' : theme.palette.text.secondary;
  const trendArrow = trend?.direction === 'up' ? '▲' : trend?.direction === 'down' ? '▼' : '→';

  return (
    <GlassCard delay={delay} glow={color} sx={{ height: '100%' }}>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <Box>
          <Typography sx={{ fontSize: 12, color: theme.palette.text.secondary, letterSpacing: 0.4, mb: 0.5 }}>
            {label}
          </Typography>
          <Typography sx={{ fontSize: { xs: 22, sm: 26 }, fontWeight: 800, lineHeight: 1.15, color: theme.palette.text.primary }}>
            {value}
          </Typography>
          {sublabel && (
            <Typography sx={{ fontSize: 11.5, color: theme.palette.text.secondary, mt: 0.5 }}>{sublabel}</Typography>
          )}
          {trend && (
            <Typography sx={{ fontSize: 11.5, color: trendColor, fontWeight: 600, mt: 0.5 }}>
              {trendArrow} {trend.label}
            </Typography>
          )}
        </Box>
        {icon && (
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 20,
              background: alpha(color, theme.palette.mode === 'dark' ? 0.18 : 0.12),
              flexShrink: 0,
            }}
          >
            {icon}
          </Box>
        )}
      </Box>
    </GlassCard>
  );
};

export default StatTile;
