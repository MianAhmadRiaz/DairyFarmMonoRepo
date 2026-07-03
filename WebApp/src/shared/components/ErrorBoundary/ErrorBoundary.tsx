import React, { Component, ReactNode } from 'react';
import { Box, Typography, Button, Paper, Alert } from '@mui/material';
import { ErrorOutline, Refresh } from '@mui/icons-material';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to console or external service
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    this.setState({
      error,
      errorInfo
    });

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);

    // You can also log to external error reporting service here
    // Example: Sentry.captureException(error);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="400px"
          padding={3}
        >
          <Paper
            elevation={3}
            sx={{ padding: 4, maxWidth: 500, textAlign: 'center' }}
          >
            <ErrorOutline
              color="error"
              sx={{ fontSize: 64, marginBottom: 2 }}
            />

            <Typography variant="h5" gutterBottom color="error">
              Oops! Something went wrong
            </Typography>

            <Typography variant="body1" color="text.secondary" paragraph>
              We encountered an unexpected error. Please try refreshing the page
              or contact support if the problem persists.
            </Typography>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <Alert
                severity="error"
                sx={{ marginBottom: 2, textAlign: 'left' }}
              >
                <Typography
                  variant="body2"
                  component="pre"
                  sx={{ whiteSpace: 'pre-wrap' }}
                >
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </Typography>
              </Alert>
            )}

            <Box display="flex" gap={2} justifyContent="center">
              <Button
                variant="contained"
                startIcon={<Refresh />}
                onClick={this.handleRetry}
                color="primary"
              >
                Try Again
              </Button>

              <Button
                variant="outlined"
                onClick={() => window.location.reload()}
              >
                Reload Page
              </Button>
            </Box>
          </Paper>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
