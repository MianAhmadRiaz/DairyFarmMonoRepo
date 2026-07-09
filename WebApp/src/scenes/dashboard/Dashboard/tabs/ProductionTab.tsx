import React, { useEffect, useState } from 'react';
import { Grid, Box, Typography, CircularProgress, ToggleButton, ToggleButtonGroup, useTheme } from '@mui/material';
import { useTranslation } from 'react-i18next';
import GlassCard from '../../../../shared/components/charts/GlassCard';
import StatTile from '../../../../shared/components/charts/StatTile';
import TrendLineChart from '../../../../shared/components/charts/TrendLineChart';
import EmptyState from '../../../../shared/components/charts/EmptyState';
import { fetch_Today_Yesterday_Average_Milk_and_Production_Trend_Graph } from '../../../../shared/services/herdinfo.services';

const toISO = (d: Date) => d.toISOString().split('T')[0];

const ProductionTab: React.FC = () => {
  const theme = useTheme();
  const { t } = useTranslation();
  const [filter, setFilter] = useState<'week' | 'month' | 'year'>('week');
  const [milkInfo, setMilkInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const end = new Date();
    const start = new Date();
    if (filter === 'week') start.setDate(start.getDate() - 7 * 12);
    else if (filter === 'month') start.setMonth(start.getMonth() - 12);
    else start.setFullYear(start.getFullYear() - 3);

    fetch_Today_Yesterday_Average_Milk_and_Production_Trend_Graph(filter, toISO(start), toISO(end))
      .then(setMilkInfo)
      .catch(() => setMilkInfo(null))
      .finally(() => setLoading(false));
  }, [filter]);

  const trend = (milkInfo?.milkData || []).map((m: any) => ({
    period: new Date(m.period).toLocaleDateString('en-US', filter === 'year' ? { year: 'numeric' } : { month: 'short', day: filter === 'month' ? undefined : 'numeric' }),
    milk: Number(m.total_milk || 0),
  }));

  return (
    <Grid container spacing={2.5}>
      <Grid item xs={6} sm={3}>
        <StatTile label={t('dashboard.production.stats.todaysMilk')} value={`${Number(milkInfo?.today_total_milk || 0).toFixed(0)} L`} icon="🥛" delay={0} />
      </Grid>
      <Grid item xs={6} sm={3}>
        <StatTile label={t('dashboard.production.stats.yesterday')} value={`${Number(milkInfo?.yesterday_total_milk || 0).toFixed(0)} L`} icon="📅" delay={0.05} />
      </Grid>
      <Grid item xs={6} sm={3}>
        <StatTile label={t('dashboard.production.stats.avgPerCow')} value={`${Number(milkInfo?.avg_milk_per_cow || 0).toFixed(1)} L`} icon="📊" delay={0.1} />
      </Grid>
      <Grid item xs={6} sm={3}>
        <StatTile label={t('dashboard.production.stats.currentFilterTotal')} value={`${Number(milkInfo?.currentFilterMilk || 0).toFixed(0)} L`} icon="🧮" delay={0.15} />
      </Grid>

      <Grid item xs={12}>
        <GlassCard delay={0.2}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5, flexWrap: 'wrap', gap: 1 }}>
            <Typography sx={{ fontWeight: 700 }}>{t('dashboard.production.trendTitle')}</Typography>
            <ToggleButtonGroup
              size="small"
              exclusive
              value={filter}
              onChange={(_, v) => v && setFilter(v)}
              sx={{ '& .MuiToggleButton-root': { textTransform: 'none', fontSize: 12, px: 1.5, py: 0.4 } }}
            >
              <ToggleButton value="week">{t('dashboard.production.range.week')}</ToggleButton>
              <ToggleButton value="month">{t('dashboard.production.range.month')}</ToggleButton>
              <ToggleButton value="year">{t('dashboard.production.range.year')}</ToggleButton>
            </ToggleButtonGroup>
          </Box>
          {loading ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress size={30} sx={{ color: theme.palette.secondary.main }} />
            </Box>
          ) : trend.length ? (
            <TrendLineChart data={trend} xKey="period" series={[{ dataKey: 'milk', color: '#4cceac', area: true, name: t('dashboard.production.milkSeries') }]} height={280} />
          ) : (
            <EmptyState title={t('dashboard.production.noMilkRecords')} icon="📈" />
          )}
        </GlassCard>
      </Grid>
    </Grid>
  );
};

export default ProductionTab;
