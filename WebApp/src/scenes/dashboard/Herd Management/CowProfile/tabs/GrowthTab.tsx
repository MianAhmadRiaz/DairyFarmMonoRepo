import React from 'react';
import { useTranslation } from 'react-i18next';
import { Grid, Typography } from '@mui/material';
import GlassCard from '../../../../../shared/components/charts/GlassCard';
import TrendLineChart from '../../../../../shared/components/charts/TrendLineChart';
import EmptyState from '../../../../../shared/components/charts/EmptyState';

const formatDate = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

const GrowthTab: React.FC<{ profile: any }> = ({ profile }) => {
  const { t } = useTranslation();
  const { weight } = profile;
  const data = (weight?.history || []).map((w: any) => ({ date: formatDate(w.date), weight: Number(w.weight) }));

  return (
    <Grid container spacing={2.5}>
      <Grid item xs={12}>
        <GlassCard delay={0}>
          <Typography sx={{ fontWeight: 700, mb: 1 }}>{t('herd.cowProfile.growth.weightTrend')}</Typography>
          {data.length ? (
            <TrendLineChart data={data} xKey="date" series={[{ dataKey: 'weight', color: '#e2a23b', area: true, name: t('herd.cowProfile.growth.weightKg') }]} height={280} />
          ) : (
            <EmptyState title={t('herd.cowProfile.growth.noWeightRecords')} icon="⚖️" />
          )}
        </GlassCard>
      </Grid>
      <Grid item xs={12}>
        <GlassCard delay={0.1}>
          <Typography sx={{ fontSize: 12.5, color: 'text.secondary' }}>
            {t('herd.cowProfile.growth.benchmarkNote')}
          </Typography>
        </GlassCard>
      </Grid>
    </Grid>
  );
};

export default GrowthTab;
