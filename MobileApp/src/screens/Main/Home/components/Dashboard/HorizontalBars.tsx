import React from 'react'
import { StyleSheet, View } from 'react-native'
import AppText from 'shared/components/AppText/AppText'
import { COLORS } from 'shared/theme'
import { RF } from 'shared/theme/responsive'

interface Props {
  items: { label: string; value: number }[]
  color?: string
}

/**
 * Horizontal bar list — mobile-friendly stand-in for the web's
 * vertical-layout bar chart (e.g. Top Diagnoses).
 */
const HorizontalBars = ({ items, color = COLORS.chartRed }: Props) => {
  const max = Math.max(...items.map(i => i.value), 1)
  return (
    <View>
      {items.map(item => (
        <View key={item.label} style={styles.row}>
          <View style={styles.labelRow}>
            <AppText
              medium
              fontSize="caption"
              color="textLight"
              numberOfLines={1}
              style={{ flex: 1, textTransform: 'capitalize' }}
            >
              {item.label}
            </AppText>
            <AppText bold fontSize="caption" color="darkestGrey">
              {item.value}
            </AppText>
          </View>
          <View style={styles.track}>
            <View
              style={[
                styles.fill,
                {
                  backgroundColor: color,
                  width: `${Math.max((item.value / max) * 100, 3)}%`
                }
              ]}
            />
          </View>
        </View>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  row: { marginVertical: RF(5) },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: RF(3)
  },
  track: {
    height: RF(8),
    borderRadius: RF(4),
    backgroundColor: COLORS.lightGrey,
    overflow: 'hidden'
  },
  fill: {
    height: '100%',
    borderRadius: RF(4)
  }
})

export default HorizontalBars
