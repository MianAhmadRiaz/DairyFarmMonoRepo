import React from 'react'
import { StyleSheet, View } from 'react-native'
import { PieChart } from 'react-native-svg-charts'
import AppText from 'shared/components/AppText/AppText'
import { COLORS } from 'shared/theme'
import { RF } from 'shared/theme/responsive'
import { DashboardStats } from 'shared/services/dashboard.services'
import GlassCard from './GlassCard'

interface Props {
  stats: DashboardStats
}

/**
 * Herd composition donut — mirrors the web Composition tab
 * (milking / dry / heifers) with the dashboard accent palette.
 */
const HerdCompositionCard = ({ stats }: Props) => {
  const slices = [
    { key: 'milk', label: 'Milking', value: stats.milk ?? 0, color: COLORS.chartGreen },
    { key: 'dry', label: 'Dry', value: stats.dry ?? 0, color: COLORS.chartAmber },
    { key: 'heifers', label: 'Heifers', value: stats.heifers ?? 0, color: COLORS.chartBlue }
  ].filter(s => s.value > 0)

  if (!slices.length) return null

  const data = slices.map(s => ({
    key: s.key,
    value: s.value,
    svg: { fill: s.color }
  }))

  return (
    <GlassCard title="Herd Composition">
      <View style={styles.row}>
        <View>
          <PieChart
            style={{ height: RF(120), width: RF(120) }}
            data={data}
            innerRadius="68%"
            padAngle={0.03}
          />
          <View style={styles.centerLabel} pointerEvents="none">
            <AppText extraBold fontSize="h6" color="darkestGrey">
              {stats.totalAnimals ?? 0}
            </AppText>
            <AppText fontSize="10" medium color="labelGrey">
              animals
            </AppText>
          </View>
        </View>
        <View style={styles.legend}>
          {slices.map(s => (
            <View key={s.key} style={styles.legendItem}>
              <View style={[styles.dot, { backgroundColor: s.color }]} />
              <AppText fontSize="caption" medium color="textLight">
                {s.label}
              </AppText>
              <AppText bold fontSize="caption" color="darkestGrey" style={{ marginLeft: 'auto' }}>
                {s.value}
              </AppText>
            </View>
          ))}
          <View style={styles.legendItem}>
            <View style={[styles.dot, { backgroundColor: COLORS.primaryMain }]} />
            <AppText fontSize="caption" medium color="textLight">
              Pregnant
            </AppText>
            <AppText bold fontSize="caption" color="darkestGrey" style={{ marginLeft: 'auto' }}>
              {stats.totalPregnant ?? 0}
            </AppText>
          </View>
        </View>
      </View>
    </GlassCard>
  )
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  centerLabel: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center'
  },
  legend: { flex: 1, marginLeft: RF(18) },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: RF(4)
  },
  dot: {
    width: RF(10),
    height: RF(10),
    borderRadius: RF(5),
    marginRight: RF(8)
  }
})

export default HerdCompositionCard
