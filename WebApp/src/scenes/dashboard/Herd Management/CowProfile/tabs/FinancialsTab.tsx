import React from 'react';
import { Box, Grid, Typography } from '@mui/material';
import GlassCard from '../../../../../shared/components/charts/GlassCard';
import StatTile from '../../../../../shared/components/charts/StatTile';
import EstimateBadge from '../../../../../shared/components/charts/EstimateBadge';

const FinancialsTab: React.FC<{ profile: any }> = ({ profile }) => {
  const { financials } = profile;

  return (
    <Grid container spacing={2.5}>
      <Grid item xs={12}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
          <Typography sx={{ fontWeight: 700, fontSize: 15 }}>Financial Snapshot</Typography>
          {financials?.isEstimate && <EstimateBadge notes={financials.estimateNotes} />}
        </Box>
      </Grid>

      <Grid item xs={6} sm={3}>
        <StatTile label="Vet Cost (real)" value={`PKR ${Number(financials?.vetCost || 0).toLocaleString()}`} icon="🩺" delay={0} />
      </Grid>
      <Grid item xs={6} sm={3}>
        <StatTile label="Calving Cost (real)" value={`PKR ${Number(financials?.calvingCost || 0).toLocaleString()}`} icon="🐄" delay={0.05} />
      </Grid>
      <Grid item xs={6} sm={3}>
        <StatTile label="Est. Milk Income" value={`PKR ${Number(financials?.estimatedMilkIncome || 0).toLocaleString()}`} icon="🥛" delay={0.1} accent="#e2a23b" />
      </Grid>
      <Grid item xs={6} sm={3}>
        <StatTile
          label="Est. Net Profit"
          value={`PKR ${Number(financials?.estimatedNetProfit || 0).toLocaleString()}`}
          icon="📊"
          delay={0.15}
          accent={financials?.estimatedNetProfit < 0 ? '#db4f4a' : '#4cceac'}
        />
      </Grid>

      <Grid item xs={12}>
        <GlassCard delay={0.2}>
          <Typography sx={{ fontSize: 12.5, color: 'text.secondary' }}>{financials?.estimateNotes}</Typography>
        </GlassCard>
      </Grid>
    </Grid>
  );
};

export default FinancialsTab;
