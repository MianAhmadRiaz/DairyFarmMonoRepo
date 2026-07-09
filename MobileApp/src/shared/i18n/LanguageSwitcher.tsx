import React from 'react'
import { Alert, DevSettings, StyleSheet, TouchableOpacity, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import AppText from 'shared/components/AppText/AppText'
import { COLORS } from 'shared/theme'
import { RF } from 'shared/theme/responsive'
import { AppLanguage, SUPPORTED_LANGUAGES, setAppLanguage } from './index'

/**
 * Row of language chips. Selecting a language persists it and, when the layout
 * direction (LTR ⇄ RTL) changes, prompts the user to restart so React Native
 * can re-lay out the UI mirrored. In dev the reload is triggered automatically.
 */
const LanguageSwitcher: React.FC = () => {
  const { t, i18n } = useTranslation()

  const onSelect = async (lng: AppLanguage) => {
    if (lng === i18n.language) return
    const needsRestart = await setAppLanguage(lng)
    if (needsRestart) {
      if (__DEV__ && DevSettings?.reload) {
        DevSettings.reload()
        return
      }
      Alert.alert(t('language.restartTitle'), t('language.restartMessage'))
    }
  }

  const labelFor = (lng: AppLanguage) =>
    lng === 'ur' ? t('language.urdu') : t('language.english')

  return (
    <View style={styles.row}>
      {SUPPORTED_LANGUAGES.map(lng => {
        const active = i18n.language === lng
        return (
          <TouchableOpacity
            key={lng}
            onPress={() => onSelect(lng)}
            style={[styles.chip, active && styles.chipActive]}
          >
            <AppText
              semiBold
              fontSize="caption"
              color={active ? 'white' : 'primaryMain'}
            >
              {labelFor(lng)}
            </AppText>
          </TouchableOpacity>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: RF(8),
    alignItems: 'center'
  },
  chip: {
    paddingHorizontal: RF(14),
    paddingVertical: RF(6),
    borderRadius: RF(20),
    borderWidth: 1,
    borderColor: COLORS.primaryMain
  },
  chipActive: {
    backgroundColor: COLORS.primaryMain
  }
})

export default LanguageSwitcher
