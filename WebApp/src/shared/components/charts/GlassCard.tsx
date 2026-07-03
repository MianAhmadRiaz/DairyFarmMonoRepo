import React from 'react';
import { Box, BoxProps, useTheme, alpha, keyframes } from '@mui/material';

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

interface GlassCardProps extends BoxProps {
  delay?: number;
  glow?: string;
}

// Theme-aware glass card — same visual language as the Login/AfterLogin
// redesign (blurred translucent surface, subtle accent glow, fade-up entrance)
// but driven by theme.palette.mode instead of a fixed dark background, so it
// looks right in both light and dark mode.
const GlassCard: React.FC<GlassCardProps> = ({ children, delay = 0, glow, sx, ...rest }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const accent = glow || theme.palette.secondary.main;

  return (
    <Box
      sx={{
        position: 'relative',
        borderRadius: '16px',
        p: { xs: 2, sm: 2.5 },
        background: isDark ? alpha(theme.palette.background.paper, 0.6) : alpha('#ffffff', 0.75),
        border: `1px solid ${alpha(accent, isDark ? 0.25 : 0.18)}`,
        backdropFilter: 'blur(10px)',
        boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.35)' : '0 4px 20px rgba(0,0,0,0.06)',
        animation: `${fadeUp} 0.5s ease both`,
        animationDelay: `${delay}s`,
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        '&:hover': {
          boxShadow: isDark ? '0 8px 28px rgba(0,0,0,0.45)' : '0 8px 28px rgba(0,0,0,0.1)',
        },
        ...sx,
      }}
      {...rest}
    >
      {children}
    </Box>
  );
};

export default GlassCard;
