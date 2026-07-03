import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';

import { BrowserRouter } from 'react-router-dom';
import App from './App';
import React from 'react';
import ScrollToTop from './shared/components/ScrollToTop/ScrollToTop';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found');
}

createRoot(rootElement).render(
  <StrictMode>
    <BrowserRouter>
      <ScrollToTop />
      <App />
    </BrowserRouter>
  </StrictMode>
);
