import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { TableChart, Refresh } from '@mui/icons-material';
import ErrorBoundary from './ErrorBoundary';

interface Props {
  children: React.ReactNode;
  tableName?: string;
}

const TableErrorBoundary: React.FC<Props> = ({
  children,
  tableName = 'table'
}) => {
  const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
    console.error(`${tableName} Table Error:`, error);
  };

  const fallbackUI = (
    <Box
      textAlign="center"
      padding={3}
      border="1px dashed #ccc"
      borderRadius={2}
    >
      <TableChart
        sx={{ fontSize: 40, color: 'text.secondary', marginBottom: 1 }}
      />
      <Typography variant="h6" gutterBottom>
        Unable to Load {tableName}
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        There was an error loading the {tableName.toLowerCase()} data.
      </Typography>
      <Button
        size="small"
        variant="outlined"
        startIcon={<Refresh />}
        onClick={() => window.location.reload()}
      >
        Retry
      </Button>
    </Box>
  );

  return (
    <ErrorBoundary fallback={fallbackUI} onError={handleError}>
      {children}
    </ErrorBoundary>
  );
};

export default TableErrorBoundary;
