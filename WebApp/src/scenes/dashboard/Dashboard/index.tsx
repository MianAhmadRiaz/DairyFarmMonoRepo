import React, { useState } from 'react';
import { Box, Tabs, Tab, Typography, useTheme } from '@mui/material';
import { useTranslation } from 'react-i18next';
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

const TAB_COMPONENTS = [
  { key: 'overview', component: OverviewTab },
  { key: 'production', component: ProductionTab },
  { key: 'reproduction', component: ReproductionTab },
  { key: 'health', component: HealthTab },
  { key: 'composition', component: CompositionTab },
  { key: 'financials', component: FinancialsTab },
  { key: 'yearOverYear', component: YearOverYearTab },
  { key: 'alerts', component: AlertsTab },
];

const HerdDashboard: React.FC = () => {
  const theme = useTheme();
  const { t } = useTranslation();
  useScrollToTopOnMount();
  const [tab, setTab] = useState(0);

  const ActiveTabComponent = TAB_COMPONENTS[tab].component;

  return (
    <PageContainer title={t('dashboard.pageTitle')} subtitle={t('dashboard.pageSubtitle')} maxWidth={1250}>
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
          {TAB_COMPONENTS.map((tc) => (
            <Tab key={tc.key} label={t('dashboard.tabs.' + tc.key)} />
          ))}
        </Tabs>
      </Box>

      <ActiveTabComponent />
    </PageContainer>
  );
};

export default HerdDashboard;
