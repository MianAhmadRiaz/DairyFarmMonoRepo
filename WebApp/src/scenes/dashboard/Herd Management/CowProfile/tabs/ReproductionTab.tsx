import React from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Grid, Typography, Chip, useTheme } from '@mui/material';
import GlassCard from '../../../../../shared/components/charts/GlassCard';
import StatTile from '../../../../../shared/components/charts/StatTile';
import EmptyState from '../../../../../shared/components/charts/EmptyState';

const formatDate = (d?: string) => (d ? new Date(d).toLocaleDateString() : '—');

type EventRow = { date: string; label: string; detail: string; color: string };

const Timeline: React.FC<{ events: EventRow[] }> = ({ events }) => {
  const { t } = useTranslation();
  const theme = useTheme();
  if (!events.length) return <EmptyState title={t('herd.cowProfile.reproduction.noBreedingEvents')} icon="💛" />;
  const sorted = [...events].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  return (
    <Box>
      {sorted.map((e, idx) => (
        <Box key={idx} sx={{ display: 'flex', gap: 1.5, py: 1, borderBottom: idx < sorted.length - 1 ? `1px solid ${theme.palette.divider}` : 'none' }}>
          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: e.color, mt: 0.6, flexShrink: 0 }} />
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography sx={{ fontSize: 13, fontWeight: 600 }}>{e.label}</Typography>
              <Typography sx={{ fontSize: 11.5, color: theme.palette.text.secondary }}>{formatDate(e.date)}</Typography>
            </Box>
            <Typography sx={{ fontSize: 12, color: theme.palette.text.secondary }}>{e.detail}</Typography>
          </Box>
        </Box>
      ))}
    </Box>
  );
};

const ReproductionTab: React.FC<{ profile: any }> = ({ profile }) => {
  const { t } = useTranslation();
  const { reproduction } = profile;

  const events: EventRow[] = [
    ...(reproduction?.heatEvents || []).map((h: any) => ({ date: h.date, label: t('herd.cowProfile.reproduction.heatDetected'), detail: h.reason || '—', color: '#e2a23b' })),
    ...(reproduction?.aiEvents || []).map((a: any) => ({ date: a.date, label: t('herd.cowProfile.reproduction.aiBreeding'), detail: `${a.semen || t('herd.cowProfile.reproduction.semenNA')} · ${t('herd.cowProfile.reproduction.tech', { name: a.tech || '—' })}`, color: '#6870fa' })),
    ...(reproduction?.bullEvents || []).map((b: any) => ({ date: b.date, label: t('herd.cowProfile.reproduction.bullBreeding'), detail: b.comments || '—', color: '#6870fa' })),
    ...(reproduction?.pregnancyEvents || []).map((p: any) => ({
      date: p.date,
      label: t('herd.cowProfile.reproduction.pregnancyCheck', { result: p.result }),
      detail: `${p.technique || ''} · ${t('herd.cowProfile.reproduction.tech', { name: p.tech || '—' })}`,
      color: p.result === 'positive' ? '#4cceac' : '#db4f4a',
    })),
    ...(reproduction?.calvingEvents || []).map((c: any) => ({ date: c.date, label: t('herd.cowProfile.reproduction.calving', { lactation: c.lactation ?? '—' }), detail: c.problems || t('herd.cowProfile.reproduction.routineCalving'), color: '#4cceac' })),
    ...(reproduction?.abortionEvents || []).map((ab: any) => ({ date: ab.date, label: t('herd.cowProfile.reproduction.abortion'), detail: ab.comments || '—', color: '#db4f4a' })),
    ...(reproduction?.dryOffEvents || []).map((d: any) => ({ date: d.date, label: t('herd.cowProfile.reproduction.dryOff', { category: d.category }), detail: d.reason || '—', color: '#e2a23b' })),
  ];

  return (
    <Grid container spacing={2.5}>
      <Grid item xs={6} sm={3}>
        <StatTile label={t('herd.cowProfile.reproduction.calvingInterval')} value={reproduction?.calvingIntervalDays ?? '—'} sublabel={t('herd.cowProfile.reproduction.days')} icon="🔁" delay={0} />
      </Grid>
      <Grid item xs={6} sm={3}>
        <StatTile label={t('herd.cowProfile.reproduction.avgDaysOpen')} value={reproduction?.avgDaysOpen ?? '—'} sublabel={reproduction?.openCycles ? t('herd.cowProfile.reproduction.cyclesStillOpen', { count: reproduction.openCycles }) : undefined} icon="📆" delay={0.05} />
      </Grid>
      <Grid item xs={6} sm={3}>
        <StatTile label={t('herd.cowProfile.reproduction.servicesPerConception')} value={reproduction?.servicesPerConception ?? '—'} icon="💉" delay={0.1} />
      </Grid>
      <Grid item xs={6} sm={3}>
        <StatTile label={t('herd.cowProfile.reproduction.calvingsOnRecord')} value={(reproduction?.calvingEvents || []).length} icon="🐄" delay={0.15} />
      </Grid>

      <Grid item xs={12}>
        <GlassCard delay={0.2}>
          <Typography sx={{ fontWeight: 700, mb: 1.5 }}>{t('herd.cowProfile.reproduction.breedingTimeline')}</Typography>
          <Timeline events={events} />
        </GlassCard>
      </Grid>
    </Grid>
  );
};

export default ReproductionTab;
