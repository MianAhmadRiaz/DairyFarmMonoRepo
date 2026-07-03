import React from 'react';
import { CssBaseline, ThemeProvider, Theme } from '@mui/material';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';

import AppRoutes from './routes/AppRoutes';
import { persistor, store } from './shared/store';
import { ColorModeContext, useMode } from './shared/theme/theme';
import './index.css';
import { ErrorBoundary } from './shared/components/ErrorBoundary';

function App() {
  const [theme, colorMode] = useMode() as [Theme, { toggleColorMode: () => void }];

  const handleGlobalError = (error: Error, errorInfo: React.ErrorInfo) => {
    // Log to console
    console.error('Global Error Boundary caught an error:', error, errorInfo);

    // Send to error reporting service (Sentry, LogRocket, etc.)
    // Example: Sentry.captureException(error, { extra: errorInfo });

    // Track in analytics
    // analytics.track('app_error', {
    //   error: error.message,
    //   stack: error.stack,
    //   componentStack: errorInfo.componentStack
    // });
  };

  return (
    <ErrorBoundary onError={handleGlobalError}>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <ColorModeContext.Provider value={colorMode}>
            <ThemeProvider theme={theme}>
              <CssBaseline />
              <AppRoutes />
            </ThemeProvider>
          </ColorModeContext.Provider>
        </PersistGate>
      </Provider>
    </ErrorBoundary>
  );
}

export default App;
