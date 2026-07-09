import React, { useEffect, useState } from 'react';
import { Grid, Box, Typography, CircularProgress, useTheme } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import GlassCard from '../../../../shared/components/charts/GlassCard';
import StatTile from '../../../../shared/components/charts/StatTile';
import TrendLineChart from '../../../../shared/components/charts/TrendLineChart';
import EmptyState from '../../../../shared/components/charts/EmptyState';
import {
  fetchDashboardStats,
  fetch_Today_Yesterday_Average_Milk_and_Production_Trend_Graph,
} from '../../../../shared/services/herdinfo.services';
import { fetchHerdAlerts, fetchReproductionSummary } from '../../../../shared/services/dashboardV2.services';

const toISO = (d: Date) => d.toISOString().split('T')[0];

const OverviewTab: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [herdInfo, setHerdInfo] = useState<any>(null);
  const [milkInfo, setMilkInfo] = useState<any>(null);
  const [alerts, setAlerts] = useState<any>(null);
  const [reproSummary, setReproSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 30);

    Promise.all([
      fetchDashboardStats().catch(() => null),
      fetch_Today_Yesterday_Average_Milk_and_Production_Trend_Graph('week', toISO(start), toISO(end)).catch(() => null),
      fetchHerdAlerts().catch(() => null),
      fetchReproductionSummary().catch(() => null),
    ]).then(([herd, milk, alertsData, repro]) => {
      setHerdInfo(herd);
      setMilkInfo(milk);
      setAlerts(alertsData);
      setReproSummary(repro);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" py={6}>
        <CircularProgress size={40} sx={{ color: theme.palette.secondary.main }} />
      </Box>
    );
  }

  const milkTrend = (milkInfo?.milkData || []).map((m: any) => ({
    period: new Date(m.period).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    milk: Number(m.total_milk || 0),
  }));

  const alertItems = [
    ...(alerts?.pregnancyCheckDue || []).map((a: any) => ({ ...a, kind: t('dashboard.overview.alertKinds.pregnancyCheckDue') })),
    ...(alerts?.dryOffDue || []).map((a: any) => ({ ...a, kind: t('dashboard.overview.alertKinds.dryOffDue') })),
    ...(alerts?.calvingExpected || []).map((a: any) => ({ ...a, kind: t('dashboard.overview.alertKinds.calvingExpected') })),
    ...(alerts?.heatWatch || []).map((a: any) => ({ ...a, kind: t('dashboard.overview.alertKinds.heatWatch') })),
  ].slice(0, 5);

  return (
    <Grid container spacing={2.5}>
      <Grid item xs={6} sm={4} md={2}>
        <StatTile label={t('dashboard.overview.stats.totalAnimals')} value={herdInfo?.totalAnimals ?? '—'} icon="🐄" delay={0} />
      </Grid>
      <Grid item xs={6} sm={4} md={2}>
        <StatTile label={t('dashboard.overview.stats.milkingCows')} value={herdInfo?.milk ?? '—'} icon="🥛" delay={0.05} />
      </Grid>
      <Grid item xs={6} sm={4} md={2}>
        <StatTile label={t('dashboard.overview.stats.pregnancyRate')} value={reproSummary?.pregnancyRate !== undefined ? `${reproSummary.pregnancyRate}%` : `${herdInfo?.pregnantPercentage ?? 0}%`} icon="🤰" delay={0.1} />
      </Grid>
      <Grid item xs={6} sm={4} md={2}>
        <StatTile label={t('dashboard.overview.stats.todaysMilk')} value={`${Number(milkInfo?.today_total_milk || 0).toFixed(0)} L`} sublabel={t('dashboard.overview.stats.yesterdayMilk', { value: Number(milkInfo?.yesterday_total_milk || 0).toFixed(0) })} icon="🧴" delay={0.15} />
      </Grid>
      <Grid item xs={6} sm={4} md={2}>
        <StatTile label={t('dashboard.overview.stats.avgPerCow')} value={`${Number(milkInfo?.avg_milk_per_cow || 0).toFixed(1)} L`} icon="📊" delay={0.2} />
      </Grid>
      <Grid item xs={6} sm={4} md={2}>
        <StatTile label={t('dashboard.overview.stats.calvingInterval')} value={reproSummary?.avgCalvingIntervalDays ?? '—'} sublabel={t('dashboard.overview.stats.daysHerdAvg')} icon="🔁" delay={0.25} />
      </Grid>

      <Grid item xs={12} md={8}>
        <GlassCard delay={0.3}>
          <Typography sx={{ fontWeight: 700, mb: 1 }}>{t('dashboard.overview.milkTrendTitle')}</Typography>
          {milkTrend.length ? (
            <TrendLineChart data={milkTrend} xKey="period" series={[{ dataKey: 'milk', color: '#4cceac', area: true, name: t('dashboard.overview.milkSeries') }]} height={240} />
          ) : (
            <EmptyState title={t('dashboard.overview.noMilkRecords')} icon="📈" />
          )}
        </GlassCard>
      </Grid>

      <Grid item xs={12} md={4}>
        <GlassCard delay={0.35} sx={{ height: '100%' }}>
          <Typography sx={{ fontWeight: 700, mb: 1.5 }}>{t('dashboard.overview.todaysAlerts')}</Typography>
          {alertItems.length ? (
            <Box>
              {alertItems.map((a: any, idx: number) => (
                <Box
                  key={idx}
                  onClick={() => a.uuid && navigate(`/animal/${a.uuid}`)}
                  sx={{
                    py: 1,
                    borderBottom: idx < alertItems.length - 1 ? `1px solid ${theme.palette.divider}` : 'none',
                    cursor: a.uuid ? 'pointer' : 'default',
                  }}
                >
                  <Typography sx={{ fontSize: 12.5, fontWeight: 600 }}>{a.kind}</Typography>
                  <Typography sx={{ fontSize: 11.5, color: theme.palette.text.secondary }}>{a.name || a.tagName || t('dashboard.overview.unnamed')}</Typography>
                </Box>
              ))}
            </Box>
          ) : (
            <EmptyState title={t('dashboard.overview.noUrgentAlerts')} icon="✅" />
          )}
        </GlassCard>
      </Grid>
    </Grid>
  );
};

export default OverviewTab;
