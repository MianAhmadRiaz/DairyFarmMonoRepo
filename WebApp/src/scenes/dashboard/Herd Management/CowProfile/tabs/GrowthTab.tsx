import React from 'react';
import { Grid, Typography } from '@mui/material';
import GlassCard from '../../../../../shared/components/charts/GlassCard';
import TrendLineChart from '../../../../../shared/components/charts/TrendLineChart';
import EmptyState from '../../../../../shared/components/charts/EmptyState';

const formatDate = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

const GrowthTab: React.FC<{ profile: any }> = ({ profile }) => {
  const { weight } = profile;
  const data = (weight?.history || []).map((w: any) => ({ date: formatDate(w.date), weight: Number(w.weight) }));

  return (
    <Grid container spacing={2.5}>
      <Grid item xs={12}>
        <GlassCard delay={0}>
          <Typography sx={{ fontWeight: 700, mb: 1 }}>Weight Trend</Typography>
          {data.length ? (
            <TrendLineChart data={data} xKey="date" series={[{ dataKey: 'weight', color: '#e2a23b', area: true, name: 'Weight (kg)' }]} height={280} />
          ) : (
            <EmptyState title="No weight records yet for this animal" icon="⚖️" />
          )}
        </GlassCard>
      </Grid>
      <Grid item xs={12}>
        <GlassCard delay={0.1}>
          <Typography sx={{ fontSize: 12.5, color: 'text.secondary' }}>
            A breed-standard growth benchmark curve isn't tracked in the system yet — only actual recorded weights are shown above.
            This trend alone is still useful for spotting growth plateaus or unexpected drops.
          </Typography>
        </GlassCard>
      </Grid>
    </Grid>
  );
};

export default GrowthTab;
