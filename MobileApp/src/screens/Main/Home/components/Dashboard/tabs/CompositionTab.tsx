import React, { useEffect, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { PieChart } from 'react-native-svg-charts'
import AppText from 'shared/components/AppText/AppText'
import {
  DashboardStats,
  fetchDashboardStats
} from 'shared/services/dashboard.services'
import { COLORS } from 'shared/theme'
import { RF } from 'shared/theme/responsive'
import EmptyState from '../EmptyState'
import GlassCard from '../GlassCard'
import TabLoader from '../TabLoader'

interface Props {
  refreshKey: number
}

// Same category colors as the web CompositionTab
const CATEGORY_COLORS: Record<string, string> = {
  milk: COLORS.chartGreen,
  dry: COLORS.chartAmber,
  heifers: COLORS.chartBlue,
  calves: '#94E2CD'
}

interface DonutProps {
  slices: { name: string; value: number; color: string }[]
  centerValue?: string
  centerLabel?: string
}

const Donut = ({ slices, centerValue, centerLabel }: DonutProps) => (
  <View style={styles.donutRow}>
    <View>
      <PieChart
        style={{ height: RF(130), width: RF(130) }}
        data={slices.map(s => ({
          key: s.name,
          value: s.value,
          svg: { fill: s.color }
        }))}
        innerRadius="68%"
        padAngle={0.03}
      />
      {!!centerValue && (
        <View style={styles.centerLabel} pointerEvents="none">
          <AppText extraBold fontSize="h6" color="darkestGrey">
            {centerValue}
          </AppText>
          {!!centerLabel && (
            <AppText fontSize="10" medium color="labelGrey">
              {centerLabel}
            </AppText>
          )}
        </View>
      )}
    </View>
    <View style={styles.legend}>
      {slices.map(s => (
        <View key={s.name} style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: s.color }]} />
          <AppText
            fontSize="caption"
            medium
            color="textLight"
            style={{ textTransform: 'capitalize' }}
          >
            {s.name}
          </AppText>
          <AppText bold fontSize="caption" color="darkestGrey" style={{ marginLeft: 'auto' }}>
            {s.value}
          </AppText>
        </View>
      ))}
    </View>
  </View>
)

/**
 * Composition tab — mirrors the web CompositionTab: herd composition donut
 * (milk/dry/heifers/calves) + pregnancy status donut.
 */
const CompositionTab = ({ refreshKey }: Props) => {
  const [herdInfo, setHerdInfo] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetchDashboardStats()
      .then(setHerdInfo)
      .catch(() => setHerdInfo(null))
      .finally(() => setLoading(false))
  }, [refreshKey])

  if (loading) return <TabLoader />

  const categories = ['milk', 'dry', 'heifers', 'calves'].filter(
    c => (herdInfo as any)?.[c] !== undefined
  )
  const composition = categories
    .map(c => ({
      name: c,
      value: Number((herdInfo as any)?.[c]) || 0,
      color: CATEGORY_COLORS[c]
    }))
    .filter(s => s.value > 0)
  const totalComposition = composition.reduce((s, d) => s + d.value, 0)

  const pregnantPct = Number(herdInfo?.pregnantPercentage) || 0
  const pregnancy = [
    { name: 'Pregnant', value: Number(pregnantPct.toFixed(1)), color: COLORS.chartGreen },
    {
      name: 'Open',
      value: Number((100 - pregnantPct).toFixed(1)),
      color: COLORS.chartAmber
    }
  ]

  return (
    <>
      <GlassCard title="Herd Composition">
        {totalComposition > 0 ? (
          <Donut
            slices={composition}
            centerValue={String(totalComposition)}
            centerLabel="animals"
          />
        ) : (
          <EmptyState title="No animals recorded yet" icon="🐄" />
        )}
      </GlassCard>

      <GlassCard title="Pregnancy Status">
        {herdInfo?.totalAnimals ? (
          <Donut
            slices={pregnancy}
            centerValue={`${pregnantPct.toFixed(1)}%`}
            centerLabel="pregnant"
          />
        ) : (
          <EmptyState title="No pregnancy data yet" icon="🤰" />
        )}
      </GlassCard>
    </>
  )
}

const styles = StyleSheet.create({
  donutRow: { flexDirection: 'row', alignItems: 'center' },
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

export default CompositionTab
