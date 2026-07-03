import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Tabs, Tab, Typography, CircularProgress, Button, Chip, useTheme, useMediaQuery } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PageContainer from '../../../../shared/components/Layout/PageContainer';
import useLayoutShift from '../../../../shared/components/Hooks/useLayoutShift';
import { useScrollToTopOnMount } from '../../../../shared/components/Hooks/useScrollToTop';
import { fetchAnimalProfile } from '../../../../shared/services/dashboardV2.services';

import OverviewTab from './tabs/OverviewTab';
import LactationProductionTab from './tabs/LactationProductionTab';
import ReproductionTab from './tabs/ReproductionTab';
import HealthDiseaseTab from './tabs/HealthDiseaseTab';
import GrowthTab from './tabs/GrowthTab';
import FinancialsTab from './tabs/FinancialsTab';
import MovementTaggingTab from './tabs/MovementTaggingTab';
import OffspringTab from './tabs/OffspringTab';

const TABS = [
  { label: 'Overview', component: OverviewTab },
  { label: 'Lactation & Production', component: LactationProductionTab },
  { label: 'Reproduction', component: ReproductionTab },
  { label: 'Health & Disease', component: HealthDiseaseTab },
  { label: 'Growth', component: GrowthTab },
  { label: 'Financials', component: FinancialsTab },
  { label: 'Movement & Tagging', component: MovementTaggingTab },
  { label: 'Offspring', component: OffspringTab },
];

const CowProfile: React.FC = () => {
  const { animalId } = useParams<{ animalId: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const { isMobile } = useLayoutShift();
  useScrollToTopOnMount();

  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState(0);

  const load = async () => {
    if (!animalId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAnimalProfile(animalId);
      setProfile(data);
    } catch (err: any) {
      console.error('Error fetching animal profile:', err);
      setError('Failed to load this animal’s profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animalId]);

  const ActiveTabComponent = TABS[tab].component;

  return (
    <PageContainer
      title={profile?.identity?.name ? `${profile.identity.name}` : 'Cow Profile'}
      subtitle={
        profile?.identity
          ? `${profile.identity.tagName || profile.identity.electronicId || ''} · ${profile.identity.breedType || ''}`
          : 'Complete history for this animal'
      }
      maxWidth={1250}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/animal-info')}
          size="small"
          sx={{ textTransform: 'none', color: theme.palette.text.secondary }}
        >
          Back to Herd
        </Button>
      </Box>

      {profile?.identity && (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3, mt: -2 }}>
          <Chip size="small" label={profile.identity.animalCategory} sx={{ textTransform: 'capitalize' }} />
          <Chip
            size="small"
            label={profile.identity.healthStatus}
            color={profile.identity.healthStatus === 'sick' ? 'error' : 'default'}
            sx={{ textTransform: 'capitalize' }}
          />
          {profile.identity.ispregnant && <Chip size="small" label="Pregnant" color="success" />}
          {profile.status?.DIM !== null && profile.status?.DIM !== undefined && (
            <Chip size="small" label={`DIM: ${profile.status.DIM}`} />
          )}
        </Box>
      )}

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" height="40vh">
          <CircularProgress size={isMobile ? 30 : 46} sx={{ color: theme.palette.secondary.main }} />
        </Box>
      ) : error ? (
        <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="40vh" gap={2}>
          <Typography color="error">{error}</Typography>
          <Button variant="contained" onClick={load}>Retry</Button>
        </Box>
      ) : (
        <>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3, overflowX: 'auto' }}>
            <Tabs
              value={tab}
              onChange={(_, v) => setTab(v)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                minHeight: 40,
                '& .MuiTab-root': { textTransform: 'none', fontSize: 13.5, minHeight: 40, fontWeight: 600 },
              }}
            >
              {TABS.map((t) => (
                <Tab key={t.label} label={t.label} />
              ))}
            </Tabs>
          </Box>
          <ActiveTabComponent profile={profile} />
        </>
      )}
    </PageContainer>
  );
};

export default CowProfile;
