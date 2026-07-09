import React, { useEffect, useState } from 'react';
import { Grid, Box, Typography, CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, useTheme } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import GlassCard from '../../../../shared/components/charts/GlassCard';
import StatTile from '../../../../shared/components/charts/StatTile';
import TrendBarChart from '../../../../shared/components/charts/TrendBarChart';
import EmptyState from '../../../../shared/components/charts/EmptyState';
import { fetchTreatmentSummary, fetchWithdrawals } from '../../../../shared/services/dashboardV2.services';

const formatDate = (d?: string) => (d ? new Date(d).toLocaleDateString() : '—');

const HealthTab: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [summary, setSummary] = useState<any>(null);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchTreatmentSummary().catch(() => null), fetchWithdrawals().catch(() => [])]).then(([s, w]) => {
      setSummary(s);
      setWithdrawals(w);
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

  const byType = (summary?.byType || []).map((item: any) => ({ type: item.treatmentType, count: Number(item.count || 0) }));

  return (
    <Grid container spacing={2.5}>
      <Grid item xs={6} sm={3}>
        <StatTile label={t('dashboard.health.stats.sickAnimals')} value={(summary?.sickAnimals || []).length} icon="🩺" delay={0} accent="#db4f4a" />
      </Grid>
      <Grid item xs={6} sm={3}>
        <StatTile label={t('dashboard.health.stats.activeWithdrawals')} value={withdrawals.length} icon="⛔" delay={0.05} accent="#e2a23b" />
      </Grid>
      <Grid item xs={6} sm={3}>
        <StatTile label={t('dashboard.health.stats.totalTreatmentCost')} value={`PKR ${Number(summary?.totalCost || 0).toLocaleString()}`} icon="💰" delay={0.1} />
      </Grid>
      <Grid item xs={6} sm={3}>
        <StatTile label={t('dashboard.health.stats.topDiagnosis')} value={summary?.topDiagnoses?.[0]?.diagnosis || '—'} sublabel={summary?.topDiagnoses?.[0] ? t('dashboard.health.casesCount', { count: summary.topDiagnoses[0].count }) : undefined} icon="🔬" delay={0.15} />
      </Grid>

      <Grid item xs={12} md={6}>
        <GlassCard delay={0.2}>
          <Typography sx={{ fontWeight: 700, mb: 1 }}>{t('dashboard.health.treatmentsByTypeTitle')}</Typography>
          {byType.length ? (
            <TrendBarChart data={byType} xKey="type" series={[{ dataKey: 'count', color: '#6870fa', name: t('dashboard.health.countSeries') }]} height={240} />
          ) : (
            <EmptyState title={t('dashboard.health.noTreatments')} icon="💊" />
          )}
        </GlassCard>
      </Grid>

      <Grid item xs={12} md={6}>
        <GlassCard delay={0.25}>
          <Typography sx={{ fontWeight: 700, mb: 1 }}>{t('dashboard.health.topDiagnosesTitle')}</Typography>
          {(summary?.topDiagnoses || []).length ? (
            <TrendBarChart
              data={summary.topDiagnoses.map((d: any) => ({ diagnosis: d.diagnosis, count: Number(d.count) }))}
              xKey="diagnosis"
              series={[{ dataKey: 'count', color: '#db4f4a', name: t('dashboard.health.casesSeries') }]}
              layout="vertical"
              height={240}
            />
          ) : (
            <EmptyState title={t('dashboard.health.noDiagnoses')} icon="🔬" />
          )}
        </GlassCard>
      </Grid>

      <Grid item xs={12}>
        <GlassCard delay={0.3}>
          <Typography sx={{ fontWeight: 700, mb: 1.5 }}>{t('dashboard.health.activeWithdrawalsTitle')}</Typography>
          {withdrawals.length ? (
            <Box sx={{ overflowX: 'auto' }}>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>{t('dashboard.health.withdrawalColumns.animal')}</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>{t('dashboard.health.withdrawalColumns.reason')}</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>{t('dashboard.health.withdrawalColumns.milkUntil')}</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>{t('dashboard.health.withdrawalColumns.meatUntil')}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {withdrawals.map((w: any) => (
                      <TableRow key={w.uuid} hover onClick={() => w.animal?.uuid && navigate(`/animal/${w.animal.uuid}`)} sx={{ cursor: 'pointer' }}>
                        <TableCell>{w.animal?.name || w.animal?.tagName || '—'}</TableCell>
                        <TableCell>{w.diagnosis || w.treatmentType}</TableCell>
                        <TableCell><Chip size="small" color="warning" label={formatDate(w.milkWithdrawalUntil)} /></TableCell>
                        <TableCell>{formatDate(w.meatWithdrawalUntil)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          ) : (
            <EmptyState title={t('dashboard.health.noWithdrawals')} icon="✅" />
          )}
        </GlassCard>
      </Grid>

      <Grid item xs={12}>
        <GlassCard delay={0.35}>
          <Typography sx={{ fontWeight: 700, mb: 1.5 }}>{t('dashboard.health.daysSinceTitle')}</Typography>
          {(summary?.daysSinceLastVaccinationOrDeworming || []).length ? (
            <Box sx={{ overflowX: 'auto' }}>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>{t('dashboard.health.daysSinceColumns.animal')}</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>{t('dashboard.health.daysSinceColumns.type')}</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>{t('dashboard.health.daysSinceColumns.lastDate')}</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>{t('dashboard.health.daysSinceColumns.daysSince')}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {summary.daysSinceLastVaccinationOrDeworming.slice(0, 15).map((r: any, idx: number) => (
                      <TableRow key={idx} hover onClick={() => r.animal?.uuid && navigate(`/animal/${r.animal.uuid}`)} sx={{ cursor: 'pointer' }}>
                        <TableCell>{r.animal?.name || r.animal?.tagName || '—'}</TableCell>
                        <TableCell sx={{ textTransform: 'capitalize' }}>{r.treatmentType}</TableCell>
                        <TableCell>{formatDate(r.lastDate)}</TableCell>
                        <TableCell>
                          <Chip size="small" label={t('dashboard.health.daysShort', { count: r.daysSince })} color={r.daysSince > 365 ? 'error' : r.daysSince > 180 ? 'warning' : 'default'} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          ) : (
            <EmptyState title={t('dashboard.health.noVaccinationRecords')} icon="💉" />
          )}
        </GlassCard>
      </Grid>
    </Grid>
  );
};

export default HealthTab;
