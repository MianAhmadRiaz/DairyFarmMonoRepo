import React, { useEffect, useState } from 'react';
import { Grid, Box, Typography, CircularProgress, useTheme } from '@mui/material';
import { useTranslation } from 'react-i18next';
import GlassCard from '../../../../shared/components/charts/GlassCard';
import StatTile from '../../../../shared/components/charts/StatTile';
import TrendBarChart from '../../../../shared/components/charts/TrendBarChart';
import EmptyState from '../../../../shared/components/charts/EmptyState';
import { fetchReproductionSummary } from '../../../../shared/services/dashboardV2.services';

const ReproductionTab: React.FC = () => {
  const theme = useTheme();
  const { t } = useTranslation();
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReproductionSummary()
      .then(setSummary)
      .catch(() => setSummary(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" py={6}>
        <CircularProgress size={40} sx={{ color: theme.palette.secondary.main }} />
      </Box>
    );
  }

  const funnel = summary?.funnel
    ? [
        { stage: t('dashboard.reproduction.funnel.heat'), count: summary.funnel.heatEvents },
        { stage: t('dashboard.reproduction.funnel.aiBull'), count: summary.funnel.aiEvents + summary.funnel.bullEvents },
        { stage: t('dashboard.reproduction.funnel.confirmedPregnant'), count: summary.funnel.pregnancyConfirmed },
        { stage: t('dashboard.reproduction.funnel.calved'), count: summary.funnel.calvings },
      ]
    : [];

  return (
    <Grid container spacing={2.5}>
      <Grid item xs={6} sm={3}>
        <StatTile label={t('dashboard.reproduction.stats.avgCalvingInterval')} value={summary?.avgCalvingIntervalDays ?? '—'} sublabel={t('dashboard.reproduction.stats.days')} icon="🔁" delay={0} />
      </Grid>
      <Grid item xs={6} sm={3}>
        <StatTile label={t('dashboard.reproduction.stats.avgDaysOpen')} value={summary?.avgDaysOpen ?? '—'} icon="📆" delay={0.05} />
      </Grid>
      <Grid item xs={6} sm={3}>
        <StatTile label={t('dashboard.reproduction.stats.avgServicesPerConception')} value={summary?.avgServicesPerConception ?? '—'} icon="💉" delay={0.1} />
      </Grid>
      <Grid item xs={6} sm={3}>
        <StatTile label={t('dashboard.reproduction.stats.pregnancyRate')} value={`${summary?.pregnancyRate ?? 0}%`} icon="🤰" delay={0.15} />
      </Grid>

      <Grid item xs={12}>
        <GlassCard delay={0.2}>
          <Typography sx={{ fontWeight: 700, mb: 1 }}>{t('dashboard.reproduction.funnelTitle')}</Typography>
          {funnel.some(f => f.count > 0) ? (
            <TrendBarChart data={funnel} xKey="stage" series={[{ dataKey: 'count', color: '#6870fa', name: t('dashboard.reproduction.eventsSeries') }]} height={260} />
          ) : (
            <EmptyState title={t('dashboard.reproduction.noBreedingEvents')} icon="💛" />
          )}
        </GlassCard>
      </Grid>
    </Grid>
  );
};

export default ReproductionTab;
