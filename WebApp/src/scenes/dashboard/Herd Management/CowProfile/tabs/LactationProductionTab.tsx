import React from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Grid, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, useTheme } from '@mui/material';
import GlassCard from '../../../../../shared/components/charts/GlassCard';
import TrendLineChart from '../../../../../shared/components/charts/TrendLineChart';
import EmptyState from '../../../../../shared/components/charts/EmptyState';

const formatDate = (d?: string) => (d ? new Date(d).toLocaleDateString() : '—');

const LactationProductionTab: React.FC<{ profile: any }> = ({ profile }) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { production } = profile;
  const monthly = (production?.milkData || []).map((m: any) => ({ month: m.month?.trim(), milk: Number(m.milk || 0) }));
  const history = production?.lactationHistory || [];

  return (
    <Grid container spacing={2.5}>
      <Grid item xs={12}>
        <GlassCard delay={0}>
          <Typography sx={{ fontWeight: 700, mb: 1 }}>{t('herd.cowProfile.lactation.milkByMonth')}</Typography>
          {monthly.length ? (
            <TrendLineChart data={monthly} xKey="month" series={[{ dataKey: 'milk', color: '#4cceac', area: true, name: t('herd.cowProfile.lactation.milkL') }]} height={260} />
          ) : (
            <EmptyState title={t('herd.cowProfile.lactation.noMilkRecords')} icon="📈" />
          )}
        </GlassCard>
      </Grid>

      <Grid item xs={12}>
        <GlassCard delay={0.1}>
          <Typography sx={{ fontWeight: 700, mb: 1.5 }}>{t('herd.cowProfile.lactation.historyTitle')}</Typography>
          {history.length ? (
            <Box sx={{ overflowX: 'auto' }}>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>{t('herd.cowProfile.lactation.lactation')}</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>{t('herd.cowProfile.lactation.calvingDate')}</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>{t('herd.cowProfile.lactation.daysInMilk')}</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>{t('herd.cowProfile.lactation.totalMilkL')}</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>{t('herd.cowProfile.lactation.peakYieldL')}</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>{t('herd.cowProfile.lactation.daysToPeak')}</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>{t('herd.cowProfile.lactation.yield305L')}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {history.map((h: any) => (
                      <TableRow key={h.lactation} hover>
                        <TableCell>{h.lactation}</TableCell>
                        <TableCell>{formatDate(h.calvingDate)}</TableCell>
                        <TableCell>{h.daysInMilk ?? '—'}</TableCell>
                        <TableCell>{Number(h.totalMilk || 0).toFixed(1)}</TableCell>
                        <TableCell>{h.peakYield ?? '—'}</TableCell>
                        <TableCell>{h.daysToPeak ?? '—'}</TableCell>
                        <TableCell>{h.yield305 ?? '—'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          ) : (
            <EmptyState title={t('herd.cowProfile.lactation.noHistory')} subtitle={t('herd.cowProfile.lactation.noHistorySub')} icon="🐄" />
          )}
        </GlassCard>
      </Grid>
    </Grid>
  );
};

export default LactationProductionTab;
