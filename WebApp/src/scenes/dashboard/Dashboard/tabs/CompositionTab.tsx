import React, { useEffect, useState } from 'react';
import { Grid, Box, Typography, CircularProgress, useTheme } from '@mui/material';
import { useTranslation } from 'react-i18next';
import GlassCard from '../../../../shared/components/charts/GlassCard';
import EmptyState from '../../../../shared/components/charts/EmptyState';
import DonutChart from '../../../../shared/components/DonutChart/DonutChart';
import { fetchDashboardStats } from '../../../../shared/services/herdinfo.services';

const CATEGORY_COLORS: Record<string, string> = {
  milk: '#4cceac',
  dry: '#e2a23b',
  heifers: '#6870fa',
  calves: '#94e2cd',
};

const CompositionTab: React.FC = () => {
  const theme = useTheme();
  const { t } = useTranslation();
  const [herdInfo, setHerdInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats()
      .then(setHerdInfo)
      .catch(() => setHerdInfo(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" py={6}>
        <CircularProgress size={40} sx={{ color: theme.palette.secondary.main }} />
      </Box>
    );
  }

  const categories = ['milk', 'dry', 'heifers', 'calves'].filter(c => (herdInfo as any)?.[c] !== undefined);
  const compositionData = categories.map(c => ({ name: t('dashboard.composition.categories.' + c, c), value: (herdInfo as any)[c] || 0 }));
  const compositionColors = categories.map(c => CATEGORY_COLORS[c]);
  const totalComposition = compositionData.reduce((s, d) => s + d.value, 0);

  return (
    <Grid container spacing={2.5}>
      <Grid item xs={12} md={6}>
        <GlassCard delay={0}>
          <Typography sx={{ fontWeight: 700, mb: 1.5 }}>{t('dashboard.composition.herdCompositionTitle')}</Typography>
          {totalComposition > 0 ? (
            <Box>
              <DonutChart data={compositionData} colors={compositionColors} height={200} />
              <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 2, mt: 1.5 }}>
                {compositionData.map((d, i) => (
                  <Box key={d.name} sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                    <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: compositionColors[i] }} />
                    <Typography sx={{ fontSize: 12, textTransform: 'capitalize' }}>{d.name}: {d.value}</Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          ) : (
            <EmptyState title={t('dashboard.composition.noAnimals')} icon="🐄" />
          )}
        </GlassCard>
      </Grid>

      <Grid item xs={12} md={6}>
        <GlassCard delay={0.1}>
          <Typography sx={{ fontWeight: 700, mb: 1.5 }}>{t('dashboard.composition.pregnancyStatusTitle')}</Typography>
          {herdInfo?.totalAnimals ? (
            <Box>
              <DonutChart
                data={[
                  { name: t('dashboard.composition.pregnant'), value: herdInfo.pregnantPercentage || 0 },
                  { name: t('dashboard.composition.open'), value: 100 - (herdInfo.pregnantPercentage || 0) },
                ]}
                colors={['#4cceac', '#e2a23b']}
                height={200}
              />
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 1.5 }}>
                <Typography sx={{ fontSize: 12 }}>🟢 {t('dashboard.composition.pregnantPct', { pct: (herdInfo.pregnantPercentage || 0).toFixed(1) })}</Typography>
                <Typography sx={{ fontSize: 12 }}>🟠 {t('dashboard.composition.openPct', { pct: (100 - (herdInfo.pregnantPercentage || 0)).toFixed(1) })}</Typography>
              </Box>
            </Box>
          ) : (
            <EmptyState title={t('dashboard.composition.noPregnancyData')} icon="🤰" />
          )}
        </GlassCard>
      </Grid>
    </Grid>
  );
};

export default CompositionTab;
