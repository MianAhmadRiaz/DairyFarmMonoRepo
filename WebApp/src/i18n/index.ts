import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './locales/en.json';
import ur from './locales/ur.json';

export const SUPPORTED_LANGUAGES = ['en', 'ur'] as const;
export type AppLanguage = (typeof SUPPORTED_LANGUAGES)[number];

/** Languages that require a right-to-left layout. */
export const RTL_LANGUAGES: AppLanguage[] = ['ur'];

export const isRtlLanguage = (lng: string): boolean =>
  RTL_LANGUAGES.includes(lng as AppLanguage);

export const STORAGE_KEY = 'app_language';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      ur: { translation: ur }
    },
    fallbackLng: 'en',
    supportedLngs: SUPPORTED_LANGUAGES as unknown as string[],
    interpolation: {
      escapeValue: false // React already escapes
    },
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      lookupLocalStorage: STORAGE_KEY,
      caches: ['localStorage']
    }
  });

/** Keep the document <html> dir/lang in sync with the active language. */
export const applyDocumentDirection = (lng: string): void => {
  const dir = isRtlLanguage(lng) ? 'rtl' : 'ltr';
  document.documentElement.setAttribute('dir', dir);
  document.documentElement.setAttribute('lang', lng);
};

// Apply on load and on every language change.
applyDocumentDirection(i18n.language);
i18n.on('languageChanged', applyDocumentDirection);

export default i18n;
