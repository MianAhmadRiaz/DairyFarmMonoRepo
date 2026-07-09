import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Grid, Typography, CircularProgress } from '@mui/material';
import GlassCard from '../../../../../shared/components/charts/GlassCard';
import EmptyState from '../../../../../shared/components/charts/EmptyState';
import { fetchAnimalPenHistory, fetchAnimalTagHistory } from '../../../../../shared/services/dashboardV2.services';

const formatDate = (d?: string) => (d ? new Date(d).toLocaleDateString() : '—');

const MovementTaggingTab: React.FC<{ profile: any }> = ({ profile }) => {
  const { t } = useTranslation();
  const animalId = profile?.identity?.uuid;
  const [penHistory, setPenHistory] = useState<any[]>([]);
  const [tagHistory, setTagHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!animalId) return;
    setLoading(true);
    Promise.all([fetchAnimalPenHistory(animalId), fetchAnimalTagHistory(animalId)])
      .then(([pens, tags]) => {
        setPenHistory(Array.isArray(pens) ? pens : []);
        setTagHistory(Array.isArray(tags) ? tags : []);
      })
      .catch((err) => console.error('Error fetching movement/tagging history:', err))
      .finally(() => setLoading(false));
  }, [animalId]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" py={4}>
        <CircularProgress size={30} />
      </Box>
    );
  }

  return (
    <Grid container spacing={2.5}>
      <Grid item xs={12} md={6}>
        <GlassCard delay={0}>
          <Typography sx={{ fontWeight: 700, mb: 1.5 }}>{t('herd.cowProfile.movement.penMovementHistory')}</Typography>
          {penHistory.length ? (
            penHistory.map((p, idx) => (
              <Box key={idx} sx={{ py: 1, borderBottom: idx < penHistory.length - 1 ? '1px solid' : 'none', borderColor: 'divider' }}>
                <Typography sx={{ fontSize: 13, fontWeight: 600 }}>{p.reason || t('herd.cowProfile.movement.movedPen')}</Typography>
                <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>{formatDate(p.date)}</Typography>
              </Box>
            ))
          ) : (
            <EmptyState title={t('herd.cowProfile.movement.noPenMovement')} icon="🏠" />
          )}
        </GlassCard>
      </Grid>
      <Grid item xs={12} md={6}>
        <GlassCard delay={0.1}>
          <Typography sx={{ fontWeight: 700, mb: 1.5 }}>{t('herd.cowProfile.movement.tagHistory')}</Typography>
          {tagHistory.length ? (
            tagHistory.map((th, idx) => (
              <Box key={idx} sx={{ py: 1, borderBottom: idx < tagHistory.length - 1 ? '1px solid' : 'none', borderColor: 'divider' }}>
                <Typography sx={{ fontSize: 13, fontWeight: 600 }}>{t('herd.cowProfile.movement.tagUpdated')}</Typography>
                <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>{formatDate(th.date)}</Typography>
              </Box>
            ))
          ) : (
            <EmptyState title={t('herd.cowProfile.movement.noTagChanges')} icon="🏷️" />
          )}
        </GlassCard>
      </Grid>
    </Grid>
  );
};

export default MovementTaggingTab;
