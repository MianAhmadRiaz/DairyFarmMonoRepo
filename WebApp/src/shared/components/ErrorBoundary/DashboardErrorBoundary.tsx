import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { Dashboard, Refresh } from '@mui/icons-material';
import ErrorBoundary from './ErrorBoundary';

interface Props {
  children: React.ReactNode;
}

const DashboardErrorBoundary: React.FC<Props> = ({ children }) => {
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
        Dashboard Temporarily Unavailable
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        We're having trouble loading your dashboard data. Please try again in a
        moment.
      </Typography>
      <Button
        variant="contained"
        startIcon={<Refresh />}
        onClick={() => window.location.reload()}
      >
        Refresh Dashboard
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
