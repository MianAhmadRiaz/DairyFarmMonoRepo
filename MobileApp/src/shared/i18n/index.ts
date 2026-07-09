import { I18nManager } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import * as RNLocalize from 'react-native-localize'
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import en from './locales/en.json'
import ur from './locales/ur.json'

export const SUPPORTED_LANGUAGES = ['en', 'ur'] as const
export type AppLanguage = (typeof SUPPORTED_LANGUAGES)[number]

/** Languages that require a right-to-left layout. */
export const RTL_LANGUAGES: AppLanguage[] = ['ur']

export const isRtlLanguage = (lng: string): boolean =>
  RTL_LANGUAGES.includes(lng as AppLanguage)

export const STORAGE_KEY = '@app_language'

const resources = {
  en: { translation: en },
  ur: { translation: ur }
}

/** Best language: stored preference → device language → English. */
const resolveInitialLanguage = async (): Promise<AppLanguage> => {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY)
    if (stored && SUPPORTED_LANGUAGES.includes(stored as AppLanguage)) {
      return stored as AppLanguage
    }
  } catch {
    // ignore storage errors, fall through to device detection
  }

  const best = RNLocalize.findBestLanguageTag(
    SUPPORTED_LANGUAGES as unknown as string[]
  )
  return (best?.languageTag as AppLanguage) ?? 'en'
}

/**
 * Aligns the native layout direction with the language. Returns true when the
 * direction actually changed — the caller should then reload the app so RN
 * re-lays out mirrored (forceRTL only takes effect after a restart).
 */
export const syncLayoutDirection = (lng: string): boolean => {
  const shouldBeRTL = isRtlLanguage(lng)
  if (I18nManager.isRTL !== shouldBeRTL) {
    I18nManager.allowRTL(shouldBeRTL)
    I18nManager.forceRTL(shouldBeRTL)
    return true
  }
  return false
}

/** Persist + apply a language. Returns true if a restart is needed for RTL. */
export const setAppLanguage = async (lng: AppLanguage): Promise<boolean> => {
  await AsyncStorage.setItem(STORAGE_KEY, lng)
  await i18n.changeLanguage(lng)
  return syncLayoutDirection(lng)
}

/** Call once during app startup, before rendering. */
export const initI18n = async (): Promise<typeof i18n> => {
  const lng = await resolveInitialLanguage()
  await i18n.use(initReactI18next).init({
    resources,
    lng,
    fallbackLng: 'en',
    compatibilityJSON: 'v4',
    interpolation: { escapeValue: false }
  })
  syncLayoutDirection(lng)
  return i18n
}

export default i18n
