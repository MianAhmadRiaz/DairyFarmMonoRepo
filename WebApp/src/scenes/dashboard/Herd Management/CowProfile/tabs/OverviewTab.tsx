import React from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Grid, Typography, useTheme } from '@mui/material';
import GlassCard from '../../../../../shared/components/charts/GlassCard';
import StatTile from '../../../../../shared/components/charts/StatTile';
import TrendLineChart from '../../../../../shared/components/charts/TrendLineChart';
import EmptyState from '../../../../../shared/components/charts/EmptyState';

const InfoRow: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => {
  const theme = useTheme();
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.75, borderBottom: `1px solid ${theme.palette.divider}` }}>
      <Typography sx={{ fontSize: 12.5, color: theme.palette.text.secondary }}>{label}</Typography>
      <Typography sx={{ fontSize: 12.5, fontWeight: 600 }}>{value ?? '—'}</Typography>
    </Box>
  );
};

const formatDate = (d?: string) => (d ? new Date(d).toLocaleDateString() : '—');
const calcAge = (t: (key: string, opts?: any) => string, birthdate?: string) => {
  if (!birthdate) return '—';
  const diffMs = Date.now() - new Date(birthdate).getTime();
  const years = diffMs / (1000 * 60 * 60 * 24 * 365.25);
  return years >= 1
    ? t('herd.cowProfile.overview.ageYears', { count: Number(years.toFixed(1)) })
    : t('herd.cowProfile.overview.ageMonths', { count: Math.round(years * 12) });
};

const OverviewTab: React.FC<{ profile: any }> = ({ profile }) => {
  const { t } = useTranslation();
  const { identity, status, production } = profile;

  const sparklineData = (production?.milkData || []).map((m: any) => ({
    month: m.month?.trim(),
    milk: Number(m.milk || 0),
  }));

  return (
    <Grid container spacing={2.5}>
      <Grid item xs={12} md={5}>
        <GlassCard delay={0}>
          <Typography sx={{ fontWeight: 700, mb: 1.5 }}>{t('herd.cowProfile.overview.identity')}</Typography>
          <InfoRow label={t('herd.cowProfile.overview.name')} value={identity?.name} />
          <InfoRow label={t('herd.cowProfile.overview.tag')} value={identity?.tagName || identity?.electronicId} />
          <InfoRow label={t('herd.cowProfile.overview.breed')} value={identity?.breedType} />
          <InfoRow label={t('herd.cowProfile.overview.gender')} value={identity?.gender} />
          <InfoRow label={t('herd.cowProfile.overview.age')} value={calcAge(t, identity?.birthdate)} />
          <InfoRow label={t('herd.cowProfile.overview.birthdate')} value={formatDate(identity?.birthdate)} />
          <InfoRow label={t('herd.cowProfile.overview.arrivalDate')} value={formatDate(identity?.arrivalDate)} />
          <InfoRow label={t('herd.cowProfile.overview.purchasePrice')} value={identity?.purchasePrice ? `PKR ${Number(identity.purchasePrice).toLocaleString()}` : '—'} />
          <InfoRow label={t('herd.cowProfile.overview.currentPen')} value={identity?.pen?.name || '—'} />
        </GlassCard>
      </Grid>

      <Grid item xs={12} md={7}>
        <Grid container spacing={2}>
          <Grid item xs={6} sm={3}>
            <StatTile label={t('herd.cowProfile.overview.lactation')} value={identity?.lactation ?? '—'} icon="🥛" delay={0.05} />
          </Grid>
          <Grid item xs={6} sm={3}>
            <StatTile label={t('herd.cowProfile.overview.dim')} value={status?.DIM ?? '—'} sublabel={t('herd.cowProfile.overview.daysInMilk')} icon="📅" delay={0.1} />
          </Grid>
          <Grid item xs={6} sm={3}>
            <StatTile
              label={t('herd.cowProfile.overview.pregnancy')}
              value={identity?.ispregnant ? t('herd.cowProfile.overview.pregnant') : (identity?.pregnancyStatus || t('herd.cowProfile.overview.open'))}
              icon="🤰"
              delay={0.15}
            />
          </Grid>
          <Grid item xs={6} sm={3}>
            <StatTile
              label={t('herd.cowProfile.overview.lastWeight')}
              value={status?.lastWeight ? `${status.lastWeight.weight} kg` : '—'}
              sublabel={status?.lastWeight ? formatDate(status.lastWeight.date) : undefined}
              icon="⚖️"
              delay={0.2}
            />
          </Grid>
          <Grid item xs={6} sm={3}>
            <StatTile label={t('herd.cowProfile.overview.lifetimeMilk')} value={`${Number(production?.totalMilk || 0).toFixed(0)} L`} icon="🧴" delay={0.25} />
          </Grid>
          <Grid item xs={6} sm={3}>
            <StatTile label={t('herd.cowProfile.overview.healthStatus')} value={identity?.healthStatus} icon="🩺" delay={0.3} accent={identity?.healthStatus === 'sick' ? '#db4f4a' : undefined} />
          </Grid>
          <Grid item xs={6} sm={3}>
            <StatTile label={t('herd.cowProfile.overview.sire')} value={identity?.fatherId ? t('herd.cowProfile.overview.linked') : '—'} icon="🐂" delay={0.35} />
          </Grid>
          <Grid item xs={6} sm={3}>
            <StatTile label={t('herd.cowProfile.overview.dam')} value={identity?.motherId ? t('herd.cowProfile.overview.linked') : '—'} icon="🐄" delay={0.4} />
          </Grid>
        </Grid>
      </Grid>

      <Grid item xs={12}>
        <GlassCard delay={0.3}>
          <Typography sx={{ fontWeight: 700, mb: 1 }}>{t('herd.cowProfile.overview.productionSparkline')}</Typography>
          {sparklineData.length ? (
            <TrendLineChart data={sparklineData} xKey="month" series={[{ dataKey: 'milk', color: '#4cceac', area: true, name: t('herd.cowProfile.overview.milkL') }]} height={200} />
          ) : (
            <EmptyState title={t('herd.cowProfile.overview.noMilkRecords')} icon="🥛" />
          )}
        </GlassCard>
      </Grid>
    </Grid>
  );
};

export default OverviewTab;
