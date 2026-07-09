import React, { useMemo } from 'react';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import { prefixer } from 'stylis';
import rtlPlugin from 'stylis-plugin-rtl';
import { useTranslation } from 'react-i18next';
import { isRtlLanguage } from './index';

const ltrCache = createCache({ key: 'mui', stylisPlugins: [prefixer] });
const rtlCache = createCache({
  key: 'mui-rtl',
  stylisPlugins: [prefixer, rtlPlugin]
});

/**
 * Provides the correct emotion cache (with the RTL stylis plugin for RTL
 * languages) so MUI components mirror automatically. Exposes the active
 * direction so callers can build a direction-aware theme.
 */
export const DirectionProvider: React.FC<{
  children: (direction: 'ltr' | 'rtl') => React.ReactNode;
}> = ({ children }) => {
  const { i18n } = useTranslation();
  const direction: 'ltr' | 'rtl' = isRtlLanguage(i18n.language) ? 'rtl' : 'ltr';
  const cache = useMemo(
    () => (direction === 'rtl' ? rtlCache : ltrCache),
    [direction]
  );

  return <CacheProvider value={cache}>{children(direction)}</CacheProvider>;
};

export default DirectionProvider;
