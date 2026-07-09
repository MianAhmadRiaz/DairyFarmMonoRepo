import React, { useEffect, useState } from 'react';
import { Grid, Box, Typography, CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, useTheme } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import GlassCard from '../../../../shared/components/charts/GlassCard';
import EmptyState from '../../../../shared/components/charts/EmptyState';
import EstimateBadge from '../../../../shared/components/charts/EstimateBadge';
import { fetchFinancialsEstimate } from '../../../../shared/services/dashboardV2.services';

const FinancialsTab: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFinancialsEstimate()
      .then(setData)
      .catch(() => setData(null))
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
      <Grid item xs={12}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: -1 }}>
          <Typography sx={{ fontWeight: 700, fontSize: 15 }}>{t('dashboard.financials.title')}</Typography>
          {data?.isEstimate && <EstimateBadge notes={data.estimateNotes} />}
        </Box>
      </Grid>

      <Grid item xs={12}>
        <GlassCard delay={0.05}>
          {!data?.hasFeedData && (
            <Typography sx={{ fontSize: 12, color: theme.palette.text.secondary, mb: 1.5, fontStyle: 'italic' }}>
              {t('dashboard.financials.noFeedData')}
            </Typography>
          )}
          {(data?.bottomPerformers || []).length ? (
            <Box sx={{ overflowX: 'auto' }}>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>{t('dashboard.financials.columns.animal')}</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>{t('dashboard.financials.columns.totalMilk')}</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>{t('dashboard.financials.columns.realCost')}</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>{t('dashboard.financials.columns.estMilkIncome')}</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>{t('dashboard.financials.columns.estNetProfit')}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {data.bottomPerformers.map((p: any) => (
                      <TableRow key={p.uuid} hover onClick={() => navigate(`/animal/${p.uuid}`)} sx={{ cursor: 'pointer' }}>
                        <TableCell>{p.name || p.tagName || '—'}</TableCell>
                        <TableCell>{p.totalMilk.toFixed(1)}</TableCell>
                        <TableCell>PKR {p.realCostOfCare.toLocaleString()}</TableCell>
                        <TableCell>PKR {p.estimatedMilkIncome.toLocaleString()}</TableCell>
                        <TableCell sx={{ color: p.estimatedNetProfit < 0 ? '#db4f4a' : '#3da58a', fontWeight: 700 }}>
                          PKR {p.estimatedNetProfit.toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          ) : (
            <EmptyState title={t('dashboard.financials.notEnoughData')} icon="📊" />
          )}
        </GlassCard>
      </Grid>
    </Grid>
  );
};

export default FinancialsTab;
