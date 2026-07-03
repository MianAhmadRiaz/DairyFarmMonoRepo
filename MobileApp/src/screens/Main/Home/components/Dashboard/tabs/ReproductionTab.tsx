import React, { useEffect, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import {
  fetchReproductionSummary,
  ReproductionSummary
} from 'shared/services/dashboard.services'
import { COLORS } from 'shared/theme'
import EmptyState from '../EmptyState'
import GlassCard from '../GlassCard'
import StatTile from '../StatTile'
import TabLoader from '../TabLoader'
import TrendBarChart from '../TrendBarChart'
import { fmtNum } from '../utils'

interface Props {
  refreshKey: number
}

/**
 * Reproduction tab — mirrors the web ReproductionTab: 4 KPI tiles +
 * breeding funnel bar chart (Heat → AI/Bull → Pregnant → Calved).
 */
const ReproductionTab = ({ refreshKey }: Props) => {
  const [summary, setSummary] = useState<ReproductionSummary | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetchReproductionSummary()
      .then(setSummary)
      .catch(() => setSummary(null))
      .finally(() => setLoading(false))
  }, [refreshKey])

  if (loading) return <TabLoader />

  const funnel = summary?.funnel
    ? [
        { stage: 'Heat', count: summary.funnel.heatEvents },
        { stage: 'AI/Bull', count: summary.funnel.aiEvents + summary.funnel.bullEvents },
        { stage: 'Pregnant', count: summary.funnel.pregnancyConfirmed },
        { stage: 'Calved', count: summary.funnel.calvings }
      ]
    : []

  const tiles = [
    {
      icon: '🔁',
      label: 'Avg Calving Interval',
      value: summary?.avgCalvingIntervalDays ?? '—',
      sublabel: 'days'
    },
    { icon: '📆', label: 'Avg Days Open', value: summary?.avgDaysOpen ?? '—' },
    {
      icon: '💉',
      label: 'Services / Conception',
      value: summary?.avgServicesPerConception ?? '—'
    },
    { icon: '🤰', label: 'Pregnancy Rate', value: fmtNum(summary?.pregnancyRate, '%') }
  ]

  return (
    <>
      <View style={styles.tileGrid}>
        {tiles.map(t => (
          <StatTile key={t.label} {...t} />
        ))}
      </View>

      <GlassCard title="Breeding Funnel">
        {funnel.some(f => f.count > 0) ? (
          <TrendBarChart
            labels={funnel.map(f => f.stage)}
            data={funnel.map(f => f.count)}
            color={COLORS.chartBlue}
          />
        ) : (
          <EmptyState title="No breeding events recorded yet" icon="💛" />
        )}
      </GlassCard>
    </>
  )
}

const styles = StyleSheet.create({
  tileGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between'
  }
})

export default ReproductionTab
