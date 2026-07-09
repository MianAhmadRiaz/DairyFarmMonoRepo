import React from 'react';
import { Box, Typography, keyframes } from '@mui/material';
import { useTranslation } from 'react-i18next';

// A fully custom, code-drawn "smart dairy farm" scene: animated gradient sky,
// glowing sensor-tagged herd silhouettes, a live milk-yield graph, and floating
// telemetry chips. No stock photography / raster imagery used.

const drift = keyframes`
  0% { transform: translate3d(0, 0, 0); }
  50% { transform: translate3d(0, -14px, 0); }
  100% { transform: translate3d(0, 0, 0); }
`;

const pulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(76, 206, 172, 0.65); }
  70% { box-shadow: 0 0 0 14px rgba(76, 206, 172, 0); }
  100% { box-shadow: 0 0 0 0 rgba(76, 206, 172, 0); }
`;

const dash = keyframes`
  to { stroke-dashoffset: -400; }
`;

const drawLine = keyframes`
  from { stroke-dashoffset: 340; }
  to { stroke-dashoffset: 0; }
`;

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
`;

const shimmer = keyframes`
  0% { background-position: -400px 0; }
  100% { background-position: 400px 0; }
`;

const glow = keyframes`
  0%, 100% { opacity: 0.35; }
  50% { opacity: 0.75; }
`;

interface TelemetryChipProps {
  label: string;
  value: string;
  top: string;
  left?: string;
  right?: string;
  delay: number;
}

const TelemetryChip: React.FC<TelemetryChipProps> = ({ label, value, top, left, right, delay }) => (
  <Box
    sx={{
      position: 'absolute',
      top,
      left,
      right,
      px: 1.75,
      py: 1,
      borderRadius: '12px',
      background: 'rgba(255,255,255,0.08)',
      border: '1px solid rgba(255,255,255,0.18)',
      backdropFilter: 'blur(10px)',
      animation: `${fadeUp} 0.7s ease both, ${drift} 6s ease-in-out infinite`,
      animationDelay: `${delay}s, ${delay + 0.7}s`,
      minWidth: 118
    }}
  >
    <Typography sx={{ color: 'rgba(255,255,255,0.65)', fontSize: 11, letterSpacing: 0.5, textTransform: 'uppercase' }}>
      {label}
    </Typography>
    <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: 18, lineHeight: 1.3 }}>{value}</Typography>
  </Box>
);

const SensorNode: React.FC<{ cx: number; cy: number; delay: number }> = ({ cx, cy, delay }) => (
  <Box
    sx={{
      position: 'absolute',
      top: cy,
      left: cx,
      width: 10,
      height: 10,
      borderRadius: '50%',
      background: '#4cceac',
      animation: `${pulse} 2.6s ease-out infinite`,
      animationDelay: `${delay}s`
    }}
  />
);

const SmartFarmScene: React.FC = () => {
  const { t } = useTranslation();
  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        height: '100vh',
        overflow: 'hidden',
        background: 'linear-gradient(160deg, #04222b 0%, #063947 42%, #0a5768 78%, #0f7c8f 100%)'
      }}
    >
      {/* animated aurora glows */}
      <Box
        sx={{
          position: 'absolute',
          width: 480,
          height: 480,
          borderRadius: '50%',
          top: -140,
          right: -120,
          background: 'radial-gradient(circle, rgba(76,206,172,0.35) 0%, rgba(76,206,172,0) 70%)',
          animation: `${glow} 5s ease-in-out infinite`
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          width: 420,
          height: 420,
          borderRadius: '50%',
          bottom: -160,
          left: -100,
          background: 'radial-gradient(circle, rgba(15,124,143,0.45) 0%, rgba(15,124,143,0) 70%)',
          animation: `${glow} 6s ease-in-out infinite`,
          animationDelay: '1.2s'
        }}
      />

      {/* faint circuit-style grid overlay */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          opacity: 0.12,
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
          backgroundSize: '48px 48px'
        }}
      />

      {/* brand mark + headline */}
      <Box sx={{ position: 'relative', zIndex: 2, px: { md: 6, lg: 8 }, pt: { md: 7, lg: 9 } }}>
        <Typography
          sx={{
            color: 'rgba(255,255,255,0.7)',
            fontSize: 13,
            letterSpacing: 3,
            textTransform: 'uppercase',
            mb: 1.5,
            animation: `${fadeUp} 0.6s ease both`
          }}
        >
          {t('auth.smartFarmScene.brandLine')}
        </Typography>
        <Typography
          sx={{
            color: '#fff',
            fontWeight: 800,
            fontSize: { md: '2.4rem', lg: '2.8rem' },
            lineHeight: 1.15,
            maxWidth: 480,
            animation: `${fadeUp} 0.7s ease both`,
            animationDelay: '0.1s'
          }}
        >
          {t('auth.smartFarmScene.headlinePlain')}{' '}
          <Box
            component="span"
            sx={{
              background: 'linear-gradient(90deg, #4cceac, #94e2cd, #4cceac)',
              backgroundSize: '200% auto',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              animation: `${shimmer} 3.5s linear infinite`
            }}
          >
            {t('auth.smartFarmScene.headlineHighlight')}
          </Box>
        </Typography>
        <Typography
          sx={{
            color: 'rgba(255,255,255,0.6)',
            fontSize: 15,
            maxWidth: 420,
            mt: 2,
            animation: `${fadeUp} 0.8s ease both`,
            animationDelay: '0.2s'
          }}
        >
          {t('auth.smartFarmScene.subheadline')}
        </Typography>
      </Box>

      {/* herd silhouette row with pulsing sensor tags */}
      <Box sx={{ position: 'absolute', left: '8%', bottom: '26%', zIndex: 2 }}>
        <svg width="260" height="90" viewBox="0 0 260 90" fill="none">
          {[0, 1, 2].map(i => (
            <g key={i} transform={`translate(${i * 85}, ${i % 2 === 0 ? 8 : 0})`} opacity={0.92}>
              <path
                d="M10 55 Q6 40 16 34 Q14 22 26 20 Q30 10 44 12 Q56 10 60 22 Q72 24 70 36 Q78 42 72 55 L72 66 Q72 72 66 72 L54 72 L54 62 L28 62 L28 72 L16 72 Q10 72 10 66 Z"
                fill="rgba(255,255,255,0.14)"
                stroke="rgba(255,255,255,0.35)"
                strokeWidth="1.2"
              />
              <circle cx="41" cy="18" r="3.5" fill="#4cceac">
                <animate attributeName="opacity" values="1;0.3;1" dur="2.4s" repeatCount="indefinite" begin={`${i * 0.4}s`} />
              </circle>
            </g>
          ))}
        </svg>
      </Box>

      {/* animated network lines connecting nodes to a central hub */}
      <Box sx={{ position: 'absolute', inset: 0, zIndex: 1 }}>
        <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0 }}>
          <polyline
            points="140,540 320,480 480,520 640,430"
            fill="none"
            stroke="rgba(148,226,205,0.35)"
            strokeWidth="1.5"
            strokeDasharray="6 8"
            style={{ animation: `${dash} 8s linear infinite` }}
          />
          <polyline
            points="480,520 560,560 700,500"
            fill="none"
            stroke="rgba(148,226,205,0.25)"
            strokeWidth="1.5"
            strokeDasharray="4 7"
            style={{ animation: `${dash} 10s linear infinite` }}
          />
        </svg>
      </Box>

      {/* floating telemetry chips */}
      <TelemetryChip label={t('auth.smartFarmScene.milkYieldToday')} value="612 L" top="18%" right="8%" delay={0.3} />
      <TelemetryChip label={t('auth.smartFarmScene.herdHealth')} value="98.4%" top="34%" right="18%" delay={0.55} />
      <TelemetryChip label={t('auth.smartFarmScene.activeSensors')} value="25 / 25" top="50%" right="6%" delay={0.8} />

      {/* live production graph card */}
      <Box
        sx={{
          position: 'absolute',
          left: { md: '6%', lg: '8%' },
          bottom: '6%',
          width: { md: 300, lg: 340 },
          borderRadius: '16px',
          background: 'rgba(255,255,255,0.08)',
          border: '1px solid rgba(255,255,255,0.18)',
          backdropFilter: 'blur(12px)',
          p: 2.25,
          zIndex: 2,
          animation: `${fadeUp} 0.9s ease both`,
          animationDelay: '0.4s'
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography sx={{ color: '#fff', fontSize: 13, fontWeight: 600 }}>
            {t('auth.smartFarmScene.productionTrend')}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
            <Box
              sx={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                background: '#4cceac',
                animation: `${pulse} 2s ease-out infinite`
              }}
            />
            <Typography sx={{ color: 'rgba(255,255,255,0.55)', fontSize: 11 }}>{t('auth.smartFarmScene.live')}</Typography>
          </Box>
        </Box>
        <svg width="100%" height="64" viewBox="0 0 300 64" preserveAspectRatio="none">
          <defs>
            <linearGradient id="graphFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4cceac" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#4cceac" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            d="M0,46 L25,40 L50,44 L75,26 L100,32 L125,18 L150,24 L175,14 L200,20 L225,10 L250,16 L275,6 L300,12 L300,64 L0,64 Z"
            fill="url(#graphFill)"
          />
          <path
            d="M0,46 L25,40 L50,44 L75,26 L100,32 L125,18 L150,24 L175,14 L200,20 L225,10 L250,16 L275,6 L300,12"
            fill="none"
            stroke="#94e2cd"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="340"
            style={{ animation: `${drawLine} 2.2s ease forwards` }}
          />
        </svg>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
          <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontSize: 10 }}>{t('auth.smartFarmScene.historyYears')}</Typography>
          <Typography sx={{ color: '#94e2cd', fontSize: 11, fontWeight: 600 }}>▲ 12.4%</Typography>
        </Box>
      </Box>

      {/* scattered sensor nodes across the scene */}
      <SensorNode cx={120} cy={200} delay={0} />
      <SensorNode cx={260} cy={340} delay={0.6} />
      <SensorNode cx={60} cy={420} delay={1.1} />
    </Box>
  );
};

export default SmartFarmScene;
