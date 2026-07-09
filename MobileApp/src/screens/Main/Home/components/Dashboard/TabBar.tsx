import React from 'react'
import { ScrollView, StyleSheet, TouchableOpacity } from 'react-native'
import AppText from 'shared/components/AppText/AppText'
import { COLORS } from 'shared/theme'
import { RF, WP } from 'shared/theme/responsive'

interface Props {
  tabs: string[]
  active: number
  onChange: (index: number) => void
}

/**
 * Horizontally scrollable pill tab bar — mobile counterpart of the web
 * dashboard's scrollable MUI Tabs.
 */
const TabBar = ({ tabs, active, onChange }: Props) => (
  <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    style={styles.bar}
    contentContainerStyle={styles.content}
  >
    {tabs.map((label, i) => {
      const isActive = i === active
      return (
        <TouchableOpacity
          key={label}
          onPress={() => onChange(i)}
          style={[styles.pill, isActive && styles.pillActive]}
          activeOpacity={0.7}
        >
          <AppText
            semiBold
            fontSize="caption"
            color={isActive ? 'white' : 'textLight'}
          >
            {label}
          </AppText>
        </TouchableOpacity>
      )
    })}
  </ScrollView>
)

const styles = StyleSheet.create({
  bar: {
    backgroundColor: COLORS.background,
    // Explicit height so the screen's column layout can never compress the
    // bar and clip the pills (horizontal ScrollViews don't self-size safely).
    height: RF(50),
    flexGrow: 0,
    flexShrink: 0
  },
  content: {
    paddingHorizontal: WP(4),
    alignItems: 'center'
  },
  pill: {
    height: RF(32),
    justifyContent: 'center',
    paddingHorizontal: RF(14),
    borderRadius: RF(16),
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    marginRight: RF(8)
  },
  pillActive: {
    backgroundColor: COLORS.primaryMain,
    borderColor: COLORS.primaryMain
  }
})

export default TabBar
