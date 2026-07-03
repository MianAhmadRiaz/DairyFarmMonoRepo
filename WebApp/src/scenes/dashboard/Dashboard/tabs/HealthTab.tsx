import React, { useEffect, useState } from 'react';
import { Grid, Box, Typography, CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, useTheme } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import GlassCard from '../../../../shared/components/charts/GlassCard';
import StatTile from '../../../../shared/components/charts/StatTile';
import TrendBarChart from '../../../../shared/components/charts/TrendBarChart';
import EmptyState from '../../../../shared/components/charts/EmptyState';
import { fetchTreatmentSummary, fetchWithdrawals } from '../../../../shared/services/dashboardV2.services';

const formatDate = (d?: string) => (d ? new Date(d).toLocaleDateString() : '—');

const HealthTab: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
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

  const byType = (summary?.byType || []).map((t: any) => ({ type: t.treatmentType, count: Number(t.count || 0) }));

  return (
    <Grid container spacing={2.5}>
      <Grid item xs={6} sm={3}>
        <StatTile label="Sick Animals" value={(summary?.sickAnimals || []).length} icon="🩺" delay={0} accent="#db4f4a" />
      </Grid>
      <Grid item xs={6} sm={3}>
        <StatTile label="Active Withdrawals" value={withdrawals.length} icon="⛔" delay={0.05} accent="#e2a23b" />
      </Grid>
      <Grid item xs={6} sm={3}>
        <StatTile label="Total Treatment Cost" value={`PKR ${Number(summary?.totalCost || 0).toLocaleString()}`} icon="💰" delay={0.1} />
      </Grid>
      <Grid item xs={6} sm={3}>
        <StatTile label="Top Diagnosis" value={summary?.topDiagnoses?.[0]?.diagnosis || '—'} sublabel={summary?.topDiagnoses?.[0] ? `${summary.topDiagnoses[0].count} cases` : undefined} icon="🔬" delay={0.15} />
      </Grid>

      <Grid item xs={12} md={6}>
        <GlassCard delay={0.2}>
          <Typography sx={{ fontWeight: 700, mb: 1 }}>Treatments by Type</Typography>
          {byType.length ? (
            <TrendBarChart data={byType} xKey="type" series={[{ dataKey: 'count', color: '#6870fa', name: 'Count' }]} height={240} />
          ) : (
            <EmptyState title="No treatments recorded yet" icon="💊" />
          )}
        </GlassCard>
      </Grid>

      <Grid item xs={12} md={6}>
        <GlassCard delay={0.25}>
          <Typography sx={{ fontWeight: 700, mb: 1 }}>Top Diagnoses</Typography>
          {(summary?.topDiagnoses || []).length ? (
            <TrendBarChart
              data={summary.topDiagnoses.map((d: any) => ({ diagnosis: d.diagnosis, count: Number(d.count) }))}
              xKey="diagnosis"
              series={[{ dataKey: 'count', color: '#db4f4a', name: 'Cases' }]}
              layout="vertical"
              height={240}
            />
          ) : (
            <EmptyState title="No diagnoses recorded yet" icon="🔬" />
          )}
        </GlassCard>
      </Grid>

      <Grid item xs={12}>
        <GlassCard delay={0.3}>
          <Typography sx={{ fontWeight: 700, mb: 1.5 }}>Active Milk Withdrawals</Typography>
          {withdrawals.length ? (
            <Box sx={{ overflowX: 'auto' }}>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>Animal</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Reason</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Milk Withdrawal Until</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Meat Withdrawal Until</TableCell>
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
            <EmptyState title="No animals under withdrawal right now" icon="✅" />
          )}
        </GlassCard>
      </Grid>

      <Grid item xs={12}>
        <GlassCard delay={0.35}>
          <Typography sx={{ fontWeight: 700, mb: 1.5 }}>Days Since Last Vaccination / Deworming</Typography>
          {(summary?.daysSinceLastVaccinationOrDeworming || []).length ? (
            <Box sx={{ overflowX: 'auto' }}>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>Animal</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Type</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Last Date</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Days Since</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {summary.daysSinceLastVaccinationOrDeworming.slice(0, 15).map((r: any, idx: number) => (
                      <TableRow key={idx} hover onClick={() => r.animal?.uuid && navigate(`/animal/${r.animal.uuid}`)} sx={{ cursor: 'pointer' }}>
                        <TableCell>{r.animal?.name || r.animal?.tagName || '—'}</TableCell>
                        <TableCell sx={{ textTransform: 'capitalize' }}>{r.treatmentType}</TableCell>
                        <TableCell>{formatDate(r.lastDate)}</TableCell>
                        <TableCell>
                          <Chip size="small" label={`${r.daysSince}d`} color={r.daysSince > 365 ? 'error' : r.daysSince > 180 ? 'warning' : 'default'} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          ) : (
            <EmptyState title="No vaccination/deworming records yet" icon="💉" />
          )}
        </GlassCard>
      </Grid>
    </Grid>
  );
};

export default HealthTab;
