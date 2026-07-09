import React, { useEffect, useState } from 'react';
import { Grid, Box, Typography, CircularProgress, useTheme } from '@mui/material';
import { useTranslation } from 'react-i18next';
import GlassCard from '../../../../shared/components/charts/GlassCard';
import StatTile from '../../../../shared/components/charts/StatTile';
import TrendLineChart from '../../../../shared/components/charts/TrendLineChart';
import EmptyState from '../../../../shared/components/charts/EmptyState';
import { fetchHerdComparison } from '../../../../shared/services/dashboardV2.services';

const pctChange = (current: number, prev: number) => {
  if (!prev) return null;
  return Number((((current - prev) / prev) * 100).toFixed(1));
};

const YearOverYearTab: React.FC = () => {
  const theme = useTheme();
  const { t } = useTranslation();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHerdComparison()
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" py={6}>
        <CircularProgress size={40} sx={{ color: theme.palette.secondary.main }} />
      </Box>
    );
  }

  if (!data) {
    return <EmptyState title={t('dashboard.yearOverYear.unableToLoad')} icon="📉" />;
  }

  const { currentYear, compareYear, totals, monthlyMilkTrend } = data;
  const cur = totals[currentYear];
  const prev = totals[compareYear];

  const metrics = [
    { key: 'totalMilk', label: t('dashboard.yearOverYear.metrics.totalMilk'), cur: cur.totalMilk, prev: prev.totalMilk, unit: 'L', icon: '🥛' },
    { key: 'avgMilkPerCow', label: t('dashboard.yearOverYear.metrics.avgMilkPerCow'), cur: cur.avgMilkPerCow, prev: prev.avgMilkPerCow, unit: 'L', icon: '📊' },
    { key: 'calvings', label: t('dashboard.yearOverYear.metrics.calvings'), cur: cur.calvingCount, prev: prev.calvingCount, unit: '', icon: '🐄' },
    { key: 'treatments', label: t('dashboard.yearOverYear.metrics.treatments'), cur: cur.treatmentCount, prev: prev.treatmentCount, unit: '', icon: '💊' },
    { key: 'treatmentCost', label: t('dashboard.yearOverYear.metrics.treatmentCost'), cur: cur.treatmentCost, prev: prev.treatmentCost, unit: 'PKR', icon: '💰' },
    { key: 'mortality', label: t('dashboard.yearOverYear.metrics.mortality'), cur: cur.mortalityCount, prev: prev.mortalityCount, unit: '', icon: '⚠️' },
  ];

  return (
    <Grid container spacing={2.5}>
      {metrics.map((m, idx) => {
        const change = pctChange(m.cur, m.prev);
        const isGoodDirection = m.key === 'mortality' || m.key === 'treatmentCost' ? (change ?? 0) <= 0 : (change ?? 0) >= 0;
        return (
          <Grid item xs={6} sm={4} key={m.key}>
            <StatTile
              label={m.label}
              value={m.unit === 'PKR' ? `PKR ${m.cur.toLocaleString()}` : `${m.cur.toLocaleString()} ${m.unit}`}
              sublabel={`${compareYear}: ${m.unit === 'PKR' ? 'PKR ' : ''}${m.prev.toLocaleString()} ${m.unit !== 'PKR' ? m.unit : ''}`}
              icon={m.icon}
              delay={idx * 0.04}
              trend={change !== null ? { direction: change === 0 ? 'flat' : isGoodDirection ? 'up' : 'down', label: t('dashboard.yearOverYear.vsCompare', { change: `${change > 0 ? '+' : ''}${change}`, year: compareYear }) } : undefined}
            />
          </Grid>
        );
      })}

      <Grid item xs={12}>
        <GlassCard delay={0.3}>
          <Typography sx={{ fontWeight: 700, mb: 1 }}>{t('dashboard.yearOverYear.monthlyTrendTitle', { currentYear, compareYear })}</Typography>
          {monthlyMilkTrend?.length ? (
            <TrendLineChart
              data={monthlyMilkTrend}
              xKey="month"
              series={[
                { dataKey: String(currentYear), color: '#4cceac', name: String(currentYear) },
                { dataKey: String(compareYear), color: '#6870fa', name: String(compareYear) },
              ]}
              height={280}
              showLegend
            />
          ) : (
            <EmptyState title={t('dashboard.yearOverYear.noMonthlyData')} icon="📈" />
          )}
        </GlassCard>
      </Grid>

      <Grid item xs={12}>
        <Typography sx={{ fontSize: 11.5, color: theme.palette.text.secondary, fontStyle: 'italic' }}>
          {data.currentAnimalCountsNote}
        </Typography>
      </Grid>
    </Grid>
  );
};

export default YearOverYearTab;
