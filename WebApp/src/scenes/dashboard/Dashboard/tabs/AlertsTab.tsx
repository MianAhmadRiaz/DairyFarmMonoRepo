import React, { useEffect, useState } from 'react';
import { Grid, Box, Typography, CircularProgress, Chip, useTheme } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import GlassCard from '../../../../shared/components/charts/GlassCard';
import EmptyState from '../../../../shared/components/charts/EmptyState';
import { fetchHerdAlerts } from '../../../../shared/services/dashboardV2.services';

const AlertsTab: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [alerts, setAlerts] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const SECTIONS: { key: string; title: string; icon: string; color: string; detail: (a: any) => string }[] = [
    { key: 'heatWatch', title: t('dashboard.alerts.sections.heatWatch'), icon: '🔥', color: '#e2a23b', detail: (a) => a.reason || '—' },
    { key: 'pregnancyCheckDue', title: t('dashboard.alerts.sections.pregnancyCheckDue'), icon: '🤰', color: '#6870fa', detail: () => t('dashboard.alerts.detail.inseminated') },
    { key: 'dryOffDue', title: t('dashboard.alerts.sections.dryOffDue'), icon: '🛑', color: '#db4f4a', detail: (a) => t('dashboard.alerts.detail.due', { date: a.dryOffDueDate || '—' }) },
    { key: 'calvingExpected', title: t('dashboard.alerts.sections.calvingExpected'), icon: '🐄', color: '#4cceac', detail: (a) => t('dashboard.alerts.detail.expected', { date: a.expectedCalvingDate || '—' }) },
  ];

  useEffect(() => {
    fetchHerdAlerts()
      .then(setAlerts)
      .catch(() => setAlerts(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" py={6}>
        <CircularProgress size={40} sx={{ color: theme.palette.secondary.main }} />
      </Box>
    );
  }

  return (
    <Grid container spacing={2.5}>
      {SECTIONS.map((section, sIdx) => {
        const items = alerts?.[section.key] || [];
        return (
          <Grid item xs={12} md={6} key={section.key}>
            <GlassCard delay={sIdx * 0.08} glow={section.color}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                <Typography sx={{ fontWeight: 700, fontSize: 14 }}>
                  {section.icon} {section.title}
                </Typography>
                <Chip size="small" label={items.length} sx={{ bgcolor: section.color, color: '#fff', fontWeight: 700 }} />
              </Box>
              {items.length ? (
                items.map((a: any, idx: number) => (
                  <Box
                    key={idx}
                    onClick={() => a.uuid && navigate(`/animal/${a.uuid}`)}
                    sx={{
                      py: 0.9,
                      borderBottom: idx < items.length - 1 ? `1px solid ${theme.palette.divider}` : 'none',
                      cursor: a.uuid ? 'pointer' : 'default',
                      display: 'flex',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Typography sx={{ fontSize: 12.5, fontWeight: 600 }}>{a.name || a.tagName || t('dashboard.alerts.unnamed')}</Typography>
                    <Typography sx={{ fontSize: 11.5, color: theme.palette.text.secondary }}>{section.detail(a)}</Typography>
                  </Box>
                ))
              ) : (
                <EmptyState title={t('dashboard.alerts.nothingHere')} icon="✅" />
              )}
            </GlassCard>
          </Grid>
        );
      })}
    </Grid>
  );
};

export default AlertsTab;
