import React from 'react';
import { Box, Grid, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, useTheme } from '@mui/material';
import GlassCard from '../../../../../shared/components/charts/GlassCard';
import StatTile from '../../../../../shared/components/charts/StatTile';
import TrendBarChart from '../../../../../shared/components/charts/TrendBarChart';
import EmptyState from '../../../../../shared/components/charts/EmptyState';

const formatDate = (d?: string) => (d ? new Date(d).toLocaleDateString() : '—');

const HealthDiseaseTab: React.FC<{ profile: any }> = ({ profile }) => {
  const theme = useTheme();
  const { health } = profile;
  const breakdown = (health?.treatmentTypeBreakdown || []).map((t: any) => ({ type: t.treatmentType, count: Number(t.count || 0) }));

  return (
    <Grid container spacing={2.5}>
      <Grid item xs={6} sm={3}>
        <StatTile label="Total Treatments" value={health?.totalTreatments ?? 0} icon="💊" delay={0} />
      </Grid>
      <Grid item xs={6} sm={3}>
        <StatTile label="Total Vet Cost" value={`PKR ${Number(health?.totalCost || 0).toLocaleString()}`} icon="💰" delay={0.05} />
      </Grid>
      <Grid item xs={6} sm={3}>
        <StatTile
          label="Since Last Vaccination"
          value={health?.daysSinceLastVaccination !== null && health?.daysSinceLastVaccination !== undefined ? `${health.daysSinceLastVaccination}d` : '—'}
          icon="💉"
          delay={0.1}
          accent={health?.daysSinceLastVaccination > 365 ? '#db4f4a' : undefined}
        />
      </Grid>
      <Grid item xs={6} sm={3}>
        <StatTile
          label="Since Last Deworming"
          value={health?.daysSinceLastDeworming !== null && health?.daysSinceLastDeworming !== undefined ? `${health.daysSinceLastDeworming}d` : '—'}
          icon="🪱"
          delay={0.15}
          accent={health?.daysSinceLastDeworming > 180 ? '#db4f4a' : undefined}
        />
      </Grid>

      <Grid item xs={12} md={5}>
        <GlassCard delay={0.2}>
          <Typography sx={{ fontWeight: 700, mb: 1 }}>Treatment Type Breakdown</Typography>
          {breakdown.length ? (
            <TrendBarChart data={breakdown} xKey="type" series={[{ dataKey: 'count', color: '#6870fa', name: 'Count' }]} height={220} />
          ) : (
            <EmptyState title="No treatments recorded yet" icon="🩺" />
          )}
        </GlassCard>
      </Grid>

      <Grid item xs={12} md={7}>
        <GlassCard delay={0.25}>
          <Typography sx={{ fontWeight: 700, mb: 1.5 }}>Health Status Timeline</Typography>
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
            <EmptyState title="No health status changes recorded" icon="📋" />
          )}
        </GlassCard>
      </Grid>

      <Grid item xs={12}>
        <GlassCard delay={0.3}>
          <Typography sx={{ fontWeight: 700, mb: 1.5 }}>Treatment & Disease History</Typography>
          {(health?.recentTreatments || []).length ? (
            <Box sx={{ overflowX: 'auto' }}>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Type</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Diagnosis</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Medicine</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Dosage</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Vet</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Cost</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Milk Withdrawal Until</TableCell>
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
            <EmptyState title="No treatment history yet" subtitle="Disease and treatment records will appear here." icon="💊" />
          )}
        </GlassCard>
      </Grid>
    </Grid>
  );
};

export default HealthDiseaseTab;
