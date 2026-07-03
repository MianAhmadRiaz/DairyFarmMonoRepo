import React from 'react';
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
const calcAge = (birthdate?: string) => {
  if (!birthdate) return '—';
  const diffMs = Date.now() - new Date(birthdate).getTime();
  const years = diffMs / (1000 * 60 * 60 * 24 * 365.25);
  return years >= 1 ? `${years.toFixed(1)} yrs` : `${Math.round(years * 12)} mo`;
};

const OverviewTab: React.FC<{ profile: any }> = ({ profile }) => {
  const { identity, status, production } = profile;

  const sparklineData = (production?.milkData || []).map((m: any) => ({
    month: m.month?.trim(),
    milk: Number(m.milk || 0),
  }));

  return (
    <Grid container spacing={2.5}>
      <Grid item xs={12} md={5}>
        <GlassCard delay={0}>
          <Typography sx={{ fontWeight: 700, mb: 1.5 }}>Identity</Typography>
          <InfoRow label="Name" value={identity?.name} />
          <InfoRow label="Tag" value={identity?.tagName || identity?.electronicId} />
          <InfoRow label="Breed" value={identity?.breedType} />
          <InfoRow label="Gender" value={identity?.gender} />
          <InfoRow label="Age" value={calcAge(identity?.birthdate)} />
          <InfoRow label="Birthdate" value={formatDate(identity?.birthdate)} />
          <InfoRow label="Arrival Date" value={formatDate(identity?.arrivalDate)} />
          <InfoRow label="Purchase Price" value={identity?.purchasePrice ? `PKR ${Number(identity.purchasePrice).toLocaleString()}` : '—'} />
          <InfoRow label="Current Pen" value={identity?.pen?.name || '—'} />
        </GlassCard>
      </Grid>

      <Grid item xs={12} md={7}>
        <Grid container spacing={2}>
          <Grid item xs={6} sm={3}>
            <StatTile label="Lactation" value={identity?.lactation ?? '—'} icon="🥛" delay={0.05} />
          </Grid>
          <Grid item xs={6} sm={3}>
            <StatTile label="DIM" value={status?.DIM ?? '—'} sublabel="days in milk" icon="📅" delay={0.1} />
          </Grid>
          <Grid item xs={6} sm={3}>
            <StatTile
              label="Pregnancy"
              value={identity?.ispregnant ? 'Pregnant' : (identity?.pregnancyStatus || 'Open')}
              icon="🤰"
              delay={0.15}
            />
          </Grid>
          <Grid item xs={6} sm={3}>
            <StatTile
              label="Last Weight"
              value={status?.lastWeight ? `${status.lastWeight.weight} kg` : '—'}
              sublabel={status?.lastWeight ? formatDate(status.lastWeight.date) : undefined}
              icon="⚖️"
              delay={0.2}
            />
          </Grid>
          <Grid item xs={6} sm={3}>
            <StatTile label="Lifetime Milk" value={`${Number(production?.totalMilk || 0).toFixed(0)} L`} icon="🧴" delay={0.25} />
          </Grid>
          <Grid item xs={6} sm={3}>
            <StatTile label="Health Status" value={identity?.healthStatus} icon="🩺" delay={0.3} accent={identity?.healthStatus === 'sick' ? '#db4f4a' : undefined} />
          </Grid>
          <Grid item xs={6} sm={3}>
            <StatTile label="Sire" value={identity?.fatherId ? 'Linked' : '—'} icon="🐂" delay={0.35} />
          </Grid>
          <Grid item xs={6} sm={3}>
            <StatTile label="Dam" value={identity?.motherId ? 'Linked' : '—'} icon="🐄" delay={0.4} />
          </Grid>
        </Grid>
      </Grid>

      <Grid item xs={12}>
        <GlassCard delay={0.3}>
          <Typography sx={{ fontWeight: 700, mb: 1 }}>Production Sparkline (this lactation, monthly)</Typography>
          {sparklineData.length ? (
            <TrendLineChart data={sparklineData} xKey="month" series={[{ dataKey: 'milk', color: '#4cceac', area: true, name: 'Milk (L)' }]} height={200} />
          ) : (
            <EmptyState title="No milk records yet for this animal" icon="🥛" />
          )}
        </GlassCard>
      </Grid>
    </Grid>
  );
};

export default OverviewTab;
