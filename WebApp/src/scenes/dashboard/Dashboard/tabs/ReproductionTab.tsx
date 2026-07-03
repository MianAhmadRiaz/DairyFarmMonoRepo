import React, { useEffect, useState } from 'react';
import { Grid, Box, Typography, CircularProgress, useTheme } from '@mui/material';
import GlassCard from '../../../../shared/components/charts/GlassCard';
import StatTile from '../../../../shared/components/charts/StatTile';
import TrendBarChart from '../../../../shared/components/charts/TrendBarChart';
import EmptyState from '../../../../shared/components/charts/EmptyState';
import { fetchReproductionSummary } from '../../../../shared/services/dashboardV2.services';

const ReproductionTab: React.FC = () => {
  const theme = useTheme();
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
        { stage: 'Heat', count: summary.funnel.heatEvents },
        { stage: 'AI/Bull', count: summary.funnel.aiEvents + summary.funnel.bullEvents },
        { stage: 'Confirmed Pregnant', count: summary.funnel.pregnancyConfirmed },
        { stage: 'Calved', count: summary.funnel.calvings },
      ]
    : [];

  return (
    <Grid container spacing={2.5}>
      <Grid item xs={6} sm={3}>
        <StatTile label="Avg Calving Interval" value={summary?.avgCalvingIntervalDays ?? '—'} sublabel="days" icon="🔁" delay={0} />
      </Grid>
      <Grid item xs={6} sm={3}>
        <StatTile label="Avg Days Open" value={summary?.avgDaysOpen ?? '—'} icon="📆" delay={0.05} />
      </Grid>
      <Grid item xs={6} sm={3}>
        <StatTile label="Avg Services / Conception" value={summary?.avgServicesPerConception ?? '—'} icon="💉" delay={0.1} />
      </Grid>
      <Grid item xs={6} sm={3}>
        <StatTile label="Pregnancy Rate" value={`${summary?.pregnancyRate ?? 0}%`} icon="🤰" delay={0.15} />
      </Grid>

      <Grid item xs={12}>
        <GlassCard delay={0.2}>
          <Typography sx={{ fontWeight: 700, mb: 1 }}>Breeding Funnel</Typography>
          {funnel.some(f => f.count > 0) ? (
            <TrendBarChart data={funnel} xKey="stage" series={[{ dataKey: 'count', color: '#6870fa', name: 'Events' }]} height={260} />
          ) : (
            <EmptyState title="No breeding events recorded yet" icon="💛" />
          )}
        </GlassCard>
      </Grid>
    </Grid>
  );
};

export default ReproductionTab;
