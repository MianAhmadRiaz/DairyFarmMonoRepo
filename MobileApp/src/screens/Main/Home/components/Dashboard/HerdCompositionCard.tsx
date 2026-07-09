import React from 'react'
import { useTranslation } from 'react-i18next'
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
  const { t } = useTranslation()
  const slices = [
    {
      key: 'milk',
      label: t('main.dashboard.herdComposition.milking'),
      value: stats.milk ?? 0,
      color: COLORS.chartGreen
    },
    {
      key: 'dry',
      label: t('main.dashboard.herdComposition.dry'),
      value: stats.dry ?? 0,
      color: COLORS.chartAmber
    },
    {
      key: 'heifers',
      label: t('main.dashboard.herdComposition.heifers'),
      value: stats.heifers ?? 0,
      color: COLORS.chartBlue
    }
  ].filter(s => s.value > 0)

  if (!slices.length) return null

  const data = slices.map(s => ({
    key: s.key,
    value: s.value,
    svg: { fill: s.color }
  }))

  return (
    <GlassCard title={t('main.dashboard.common.herdComposition')}>
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
              {t('main.dashboard.common.animals')}
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
              {t('main.dashboard.common.pregnant')}
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
