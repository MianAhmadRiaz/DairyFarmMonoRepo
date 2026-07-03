import React from 'react';
import { Grid, Box, Typography, Chip, useTheme } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import GlassCard from '../../../../../shared/components/charts/GlassCard';
import EmptyState from '../../../../../shared/components/charts/EmptyState';

const formatDate = (d?: string) => (d ? new Date(d).toLocaleDateString() : '—');

const OffspringTab: React.FC<{ profile: any }> = ({ profile }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const offspring = profile?.offspring || [];

  return (
    <Grid container spacing={2.5}>
      <Grid item xs={12}>
        <GlassCard delay={0}>
          <Typography sx={{ fontWeight: 700, mb: 1.5 }}>Offspring ({offspring.length})</Typography>
          {offspring.length ? (
            <Grid container spacing={1.5}>
              {offspring.map((o: any) => (
                <Grid item xs={12} sm={6} md={4} key={o.uuid}>
                  <Box
                    onClick={() => navigate(`/animal/${o.uuid}`)}
                    sx={{
                      p: 1.5,
                      borderRadius: '10px',
                      border: `1px solid ${theme.palette.divider}`,
                      cursor: 'pointer',
                      transition: 'transform 0.15s ease',
                      '&:hover': { transform: 'translateY(-2px)', borderColor: theme.palette.secondary.main },
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography sx={{ fontWeight: 700, fontSize: 13.5 }}>{o.name || 'Unnamed'}</Typography>
                      <Chip size="small" label={o.gender} sx={{ textTransform: 'capitalize' }} />
                    </Box>
                    <Typography sx={{ fontSize: 12, color: theme.palette.text.secondary }}>{o.tagName || '—'}</Typography>
                    <Typography sx={{ fontSize: 11.5, color: theme.palette.text.secondary, mt: 0.5 }}>
                      Born: {formatDate(o.calving_date)}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          ) : (
            <EmptyState title="No offspring on record" subtitle="Calves linked to this animal as dam will appear here." icon="👶" />
          )}
        </GlassCard>
      </Grid>
    </Grid>
  );
};

export default OffspringTab;
