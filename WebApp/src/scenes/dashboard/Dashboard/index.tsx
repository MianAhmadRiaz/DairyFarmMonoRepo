import React, { useState } from 'react';
import { Box, Tabs, Tab, Typography, useTheme } from '@mui/material';
import PageContainer from '../../../shared/components/Layout/PageContainer';
import { useScrollToTopOnMount } from '../../../shared/components/Hooks/useScrollToTop';

import OverviewTab from './tabs/OverviewTab';
import ProductionTab from './tabs/ProductionTab';
import ReproductionTab from './tabs/ReproductionTab';
import HealthTab from './tabs/HealthTab';
import CompositionTab from './tabs/CompositionTab';
import FinancialsTab from './tabs/FinancialsTab';
import YearOverYearTab from './tabs/YearOverYearTab';
import AlertsTab from './tabs/AlertsTab';

const TABS = [
  { label: 'Overview', component: OverviewTab },
  { label: 'Production', component: ProductionTab },
  { label: 'Reproduction', component: ReproductionTab },
  { label: 'Health & Disease', component: HealthTab },
  { label: 'Composition', component: CompositionTab },
  { label: 'Financials', component: FinancialsTab },
  { label: 'Year-over-Year', component: YearOverYearTab },
  { label: 'Alerts & Tasks', component: AlertsTab },
];

const HerdDashboard: React.FC = () => {
  const theme = useTheme();
  useScrollToTopOnMount();
  const [tab, setTab] = useState(0);

  const ActiveTabComponent = TABS[tab].component;

  return (
    <PageContainer title="Herd Dashboard" subtitle="Your farm, at a glance — production, health, breeding & more" maxWidth={1250}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3, overflowX: 'auto' }}>
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            minHeight: 42,
            '& .MuiTab-root': { textTransform: 'none', fontSize: 13.5, minHeight: 42, fontWeight: 600 },
          }}
        >
          {TABS.map((t) => (
            <Tab key={t.label} label={t.label} />
          ))}
        </Tabs>
      </Box>

      <ActiveTabComponent />
    </PageContainer>
  );
};

export default HerdDashboard;
