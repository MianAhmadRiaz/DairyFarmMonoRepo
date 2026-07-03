import React from 'react';
import { Box, Grid, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, useTheme } from '@mui/material';
import GlassCard from '../../../../../shared/components/charts/GlassCard';
import TrendLineChart from '../../../../../shared/components/charts/TrendLineChart';
import EmptyState from '../../../../../shared/components/charts/EmptyState';

const formatDate = (d?: string) => (d ? new Date(d).toLocaleDateString() : '—');

const LactationProductionTab: React.FC<{ profile: any }> = ({ profile }) => {
  const theme = useTheme();
  const { production } = profile;
  const monthly = (production?.milkData || []).map((m: any) => ({ month: m.month?.trim(), milk: Number(m.milk || 0) }));
  const history = production?.lactationHistory || [];

  return (
    <Grid container spacing={2.5}>
      <Grid item xs={12}>
        <GlassCard delay={0}>
          <Typography sx={{ fontWeight: 700, mb: 1 }}>Milk Production by Month</Typography>
          {monthly.length ? (
            <TrendLineChart data={monthly} xKey="month" series={[{ dataKey: 'milk', color: '#4cceac', area: true, name: 'Milk (L)' }]} height={260} />
          ) : (
            <EmptyState title="No milk records yet for this animal" icon="📈" />
          )}
        </GlassCard>
      </Grid>

      <Grid item xs={12}>
        <GlassCard delay={0.1}>
          <Typography sx={{ fontWeight: 700, mb: 1.5 }}>Lactation-to-Lactation History</Typography>
          {history.length ? (
            <Box sx={{ overflowX: 'auto' }}>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>Lactation</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Calving Date</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Days in Milk</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Total Milk (L)</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Peak Yield (L)</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Days to Peak</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>305-Day Yield (L)</TableCell>
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
            <EmptyState title="No lactation history recorded yet" subtitle="Lactation cycles will appear here as calving events are logged." icon="🐄" />
          )}
        </GlassCard>
      </Grid>
    </Grid>
  );
};

export default LactationProductionTab;
