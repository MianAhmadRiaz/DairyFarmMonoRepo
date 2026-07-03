import React, { useEffect, useState } from 'react';
import { Grid, Box, Typography, CircularProgress, ToggleButton, ToggleButtonGroup, useTheme } from '@mui/material';
import GlassCard from '../../../../shared/components/charts/GlassCard';
import StatTile from '../../../../shared/components/charts/StatTile';
import TrendLineChart from '../../../../shared/components/charts/TrendLineChart';
import EmptyState from '../../../../shared/components/charts/EmptyState';
import { fetch_Today_Yesterday_Average_Milk_and_Production_Trend_Graph } from '../../../../shared/services/herdinfo.services';

const toISO = (d: Date) => d.toISOString().split('T')[0];

const ProductionTab: React.FC = () => {
  const theme = useTheme();
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
        <StatTile label="Today's Milk" value={`${Number(milkInfo?.today_total_milk || 0).toFixed(0)} L`} icon="🥛" delay={0} />
      </Grid>
      <Grid item xs={6} sm={3}>
        <StatTile label="Yesterday" value={`${Number(milkInfo?.yesterday_total_milk || 0).toFixed(0)} L`} icon="📅" delay={0.05} />
      </Grid>
      <Grid item xs={6} sm={3}>
        <StatTile label="Avg / Cow" value={`${Number(milkInfo?.avg_milk_per_cow || 0).toFixed(1)} L`} icon="📊" delay={0.1} />
      </Grid>
      <Grid item xs={6} sm={3}>
        <StatTile label="Current Filter Total" value={`${Number(milkInfo?.currentFilterMilk || 0).toFixed(0)} L`} icon="🧮" delay={0.15} />
      </Grid>

      <Grid item xs={12}>
        <GlassCard delay={0.2}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5, flexWrap: 'wrap', gap: 1 }}>
            <Typography sx={{ fontWeight: 700 }}>Milk Production Trend</Typography>
            <ToggleButtonGroup
              size="small"
              exclusive
              value={filter}
              onChange={(_, v) => v && setFilter(v)}
              sx={{ '& .MuiToggleButton-root': { textTransform: 'none', fontSize: 12, px: 1.5, py: 0.4 } }}
            >
              <ToggleButton value="week">Week</ToggleButton>
              <ToggleButton value="month">Month</ToggleButton>
              <ToggleButton value="year">Year</ToggleButton>
            </ToggleButtonGroup>
          </Box>
          {loading ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress size={30} sx={{ color: theme.palette.secondary.main }} />
            </Box>
          ) : trend.length ? (
            <TrendLineChart data={trend} xKey="period" series={[{ dataKey: 'milk', color: '#4cceac', area: true, name: 'Milk (L)' }]} height={280} />
          ) : (
            <EmptyState title="No milk records in this range" icon="📈" />
          )}
        </GlassCard>
      </Grid>
    </Grid>
  );
};

export default ProductionTab;
