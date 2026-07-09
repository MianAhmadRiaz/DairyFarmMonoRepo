import React from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Grid, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, useTheme } from '@mui/material';
import GlassCard from '../../../../../shared/components/charts/GlassCard';
import StatTile from '../../../../../shared/components/charts/StatTile';
import TrendBarChart from '../../../../../shared/components/charts/TrendBarChart';
import EmptyState from '../../../../../shared/components/charts/EmptyState';

const formatDate = (d?: string) => (d ? new Date(d).toLocaleDateString() : '—');

const HealthDiseaseTab: React.FC<{ profile: any }> = ({ profile }) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { health } = profile;
  const breakdown = (health?.treatmentTypeBreakdown || []).map((t: any) => ({ type: t.treatmentType, count: Number(t.count || 0) }));

  return (
    <Grid container spacing={2.5}>
      <Grid item xs={6} sm={3}>
        <StatTile label={t('herd.cowProfile.health.totalTreatments')} value={health?.totalTreatments ?? 0} icon="💊" delay={0} />
      </Grid>
      <Grid item xs={6} sm={3}>
        <StatTile label={t('herd.cowProfile.health.totalVetCost')} value={`PKR ${Number(health?.totalCost || 0).toLocaleString()}`} icon="💰" delay={0.05} />
      </Grid>
      <Grid item xs={6} sm={3}>
        <StatTile
          label={t('herd.cowProfile.health.sinceLastVaccination')}
          value={health?.daysSinceLastVaccination !== null && health?.daysSinceLastVaccination !== undefined ? `${health.daysSinceLastVaccination}d` : '—'}
          icon="💉"
          delay={0.1}
          accent={health?.daysSinceLastVaccination > 365 ? '#db4f4a' : undefined}
        />
      </Grid>
      <Grid item xs={6} sm={3}>
        <StatTile
          label={t('herd.cowProfile.health.sinceLastDeworming')}
          value={health?.daysSinceLastDeworming !== null && health?.daysSinceLastDeworming !== undefined ? `${health.daysSinceLastDeworming}d` : '—'}
          icon="🪱"
          delay={0.15}
          accent={health?.daysSinceLastDeworming > 180 ? '#db4f4a' : undefined}
        />
      </Grid>

      <Grid item xs={12} md={5}>
        <GlassCard delay={0.2}>
          <Typography sx={{ fontWeight: 700, mb: 1 }}>{t('herd.cowProfile.health.treatmentTypeBreakdown')}</Typography>
          {breakdown.length ? (
            <TrendBarChart data={breakdown} xKey="type" series={[{ dataKey: 'count', color: '#6870fa', name: t('herd.cowProfile.health.count') }]} height={220} />
          ) : (
            <EmptyState title={t('herd.cowProfile.health.noTreatmentsRecorded')} icon="🩺" />
          )}
        </GlassCard>
      </Grid>

      <Grid item xs={12} md={7}>
        <GlassCard delay={0.25}>
          <Typography sx={{ fontWeight: 700, mb: 1.5 }}>{t('herd.cowProfile.health.healthStatusTimeline')}</Typography>
          {(health?.healthStatusHistory || []).length ? (
            <Box>
              {health.healthStatusHistory.map((h: any, idx: number) => (
                <Box key={idx} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.75, borderBottom: idx < health.healthStatusHistory.length - 1 ? `1px solid ${theme.palette.divider}` : 'none' }}>
                  <Chip
                    size="small"
                    label={h.healthStatus}
                    color={h.healthStatus === 'sick' ? 'error' : h.healthStatus === 'culling' ? 'warning' : 'success'}
                    sx={{ textTransform: 'capitalize' }}
                  />
                  <Typography sx={{ fontSize: 12, color: theme.palette.text.secondary }}>{formatDate(h.date)}</Typography>
                </Box>
              ))}
            </Box>
          ) : (
            <EmptyState title={t('herd.cowProfile.health.noHealthStatusChanges')} icon="📋" />
          )}
        </GlassCard>
      </Grid>

      <Grid item xs={12}>
        <GlassCard delay={0.3}>
          <Typography sx={{ fontWeight: 700, mb: 1.5 }}>{t('herd.cowProfile.health.treatmentDiseaseHistory')}</Typography>
          {(health?.recentTreatments || []).length ? (
            <Box sx={{ overflowX: 'auto' }}>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>{t('herd.cowProfile.health.date')}</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>{t('herd.cowProfile.health.type')}</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>{t('herd.cowProfile.health.diagnosis')}</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>{t('herd.cowProfile.health.medicine')}</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>{t('herd.cowProfile.health.dosage')}</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>{t('herd.cowProfile.health.vet')}</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>{t('herd.cowProfile.health.cost')}</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>{t('herd.cowProfile.health.milkWithdrawalUntil')}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {health.recentTreatments.map((t: any) => (
                      <TableRow key={t.uuid} hover>
                        <TableCell>{formatDate(t.date)}</TableCell>
                        <TableCell sx={{ textTransform: 'capitalize' }}>{t.treatmentType}</TableCell>
                        <TableCell>{t.diagnosis || '—'}</TableCell>
                        <TableCell>{t.medicineName || '—'}</TableCell>
                        <TableCell>{t.dosage || '—'}</TableCell>
                        <TableCell>{t.vetName || '—'}</TableCell>
                        <TableCell>PKR {Number(t.cost || 0).toLocaleString()}</TableCell>
                        <TableCell>
                          {t.milkWithdrawalUntil && new Date(t.milkWithdrawalUntil) >= new Date() ? (
                            <Chip size="small" color="warning" label={formatDate(t.milkWithdrawalUntil)} />
                          ) : (
                            '—'
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          ) : (
            <EmptyState title={t('herd.cowProfile.health.noTreatmentHistory')} subtitle={t('herd.cowProfile.health.noTreatmentHistorySub')} icon="💊" />
          )}
        </GlassCard>
      </Grid>
    </Grid>
  );
};

export default HealthDiseaseTab;
