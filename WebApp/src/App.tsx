import React from 'react';
import { CssBaseline, ThemeProvider, Theme } from '@mui/material';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';

import AppRoutes from './routes/AppRoutes';
import { persistor, store } from './shared/store';
import { ColorModeContext, useMode } from './shared/theme/theme';
import DirectionProvider from './i18n/DirectionProvider';
import './index.css';
import { ErrorBoundary } from './shared/components/ErrorBoundary';

// Themed tree; direction comes from the active language via DirectionProvider.
const ThemedApp: React.FC<{ direction: 'ltr' | 'rtl' }> = ({ direction }) => {
  const [theme, colorMode] = useMode(direction) as [
    Theme,
    { toggleColorMode: () => void }
  ];

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AppRoutes />
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
};

function App() {
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
          <DirectionProvider>
            {(direction) => <ThemedApp direction={direction} />}
          </DirectionProvider>
        </PersistGate>
      </Provider>
    </ErrorBoundary>
  );
}

export default App;
