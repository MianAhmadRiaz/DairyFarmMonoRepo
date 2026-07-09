import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
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
  const { t } = useTranslation()
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
        {
          stage: t('main.dashboard.reproductionTab.stages.heat'),
          count: summary.funnel.heatEvents
        },
        {
          stage: t('main.dashboard.reproductionTab.stages.aiBull'),
          count: summary.funnel.aiEvents + summary.funnel.bullEvents
        },
        {
          stage: t('main.dashboard.reproductionTab.stages.pregnant'),
          count: summary.funnel.pregnancyConfirmed
        },
        {
          stage: t('main.dashboard.reproductionTab.stages.calved'),
          count: summary.funnel.calvings
        }
      ]
    : []

  const tiles = [
    {
      icon: '🔁',
      label: t('main.dashboard.reproductionTab.avgCalvingInterval'),
      value: summary?.avgCalvingIntervalDays ?? '—',
      sublabel: t('main.dashboard.reproductionTab.days')
    },
    {
      icon: '📆',
      label: t('main.dashboard.reproductionTab.avgDaysOpen'),
      value: summary?.avgDaysOpen ?? '—'
    },
    {
      icon: '💉',
      label: t('main.dashboard.reproductionTab.servicesPerConception'),
      value: summary?.avgServicesPerConception ?? '—'
    },
    {
      icon: '🤰',
      label: t('main.dashboard.common.pregnancyRate'),
      value: fmtNum(summary?.pregnancyRate, '%')
    }
  ]

  return (
    <>
      <View style={styles.tileGrid}>
        {tiles.map(t => (
          <StatTile key={t.label} {...t} />
        ))}
      </View>

      <GlassCard title={t('main.dashboard.reproductionTab.breedingFunnel')}>
        {funnel.some(f => f.count > 0) ? (
          <TrendBarChart
            labels={funnel.map(f => f.stage)}
            data={funnel.map(f => f.count)}
            color={COLORS.chartBlue}
          />
        ) : (
          <EmptyState title={t('main.dashboard.reproductionTab.empty')} icon="💛" />
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
