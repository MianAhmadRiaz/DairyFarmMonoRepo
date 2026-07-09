import React, { ReactNode } from 'react'
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native'
import AppText from 'shared/components/AppText/AppText'
import { COLORS, THEME } from 'shared/theme'
import { RF } from 'shared/theme/responsive'

interface Props {
  children: ReactNode
  title?: string
  subtitle?: string
  right?: ReactNode
  style?: StyleProp<ViewStyle>
}

/**
 * Card surface matching the web app's GlassCard: white surface, 16px radius,
 * teal-tinted border and a soft shadow.
 */
const GlassCard = ({ children, title, subtitle, right, style }: Props) => (
  <View style={[styles.card, style]}>
    {(title || right) && (
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          {title && (
            <AppText bold fontSize="h7" color="darkestGrey">
              {title}
            </AppText>
          )}
          {subtitle && (
            <AppText
              fontSize="caption"
              medium
              color="labelGrey"
              style={{ marginTop: RF(2) }}
            >
              {subtitle}
            </AppText>
          )}
        </View>
        {right}
      </View>
    )}
    {children}
  </View>
)

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: THEME.RADIUS.CARD,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    padding: RF(14),
    marginTop: RF(12),
    ...THEME.CARD_SHADOW
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: RF(10)
  }
})

export default GlassCard
