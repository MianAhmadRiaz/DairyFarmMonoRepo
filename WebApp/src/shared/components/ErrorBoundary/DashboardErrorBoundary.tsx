import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { Dashboard, Refresh } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import ErrorBoundary from './ErrorBoundary';

interface Props {
  children: React.ReactNode;
}

const DashboardErrorBoundary: React.FC<Props> = ({ children }) => {
  const { t } = useTranslation();
  const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
    // Log specific dashboard errors
    console.error('Dashboard Error:', error);

    // Send to analytics or error reporting
    // analytics.track('dashboard_error', { error: error.message });
  };

  const fallbackUI = (
    <Box textAlign="center" padding={4}>
      <Dashboard
        sx={{ fontSize: 48, color: 'text.secondary', marginBottom: 2 }}
      />
      <Typography variant="h6" gutterBottom>
        {t('shared.dashboardErrorBoundary.title')}
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        {t('shared.dashboardErrorBoundary.message')}
      </Typography>
      <Button
        variant="contained"
        startIcon={<Refresh />}
        onClick={() => window.location.reload()}
      >
        {t('shared.dashboardErrorBoundary.refresh')}
      </Button>
    </Box>
  );

  return (
    <ErrorBoundary fallback={fallbackUI} onError={handleError}>
      {children}
    </ErrorBoundary>
  );
};

export default DashboardErrorBoundary;
