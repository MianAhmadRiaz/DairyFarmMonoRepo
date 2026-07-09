import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, View } from 'react-native'
import AppText from 'shared/components/AppText/AppText'
import {
  fetchHerdComparison,
  HerdComparison
} from 'shared/services/dashboard.services'
import { COLORS } from 'shared/theme'
import { RF } from 'shared/theme/responsive'
import EmptyState from '../EmptyState'
import GlassCard from '../GlassCard'
import StatTile, { Trend } from '../StatTile'
import TabLoader from '../TabLoader'
import TrendLineChart from '../TrendLineChart'
import { fmtMoney, fmtNum } from '../utils'

interface Props {
  refreshKey: number
}

const pctChange = (current: number, prev: number): number | null => {
  if (!prev) return null
  return Number((((current - prev) / prev) * 100).toFixed(1))
}

/**
 * Year-over-Year tab — mirrors the web YearOverYearTab: six metric tiles
 * with % change vs the compare year + monthly milk trend for both years.
 */
const YearOverYearTab = ({ refreshKey }: Props) => {
  const { t } = useTranslation()
  const [data, setData] = useState<HerdComparison | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetchHerdComparison()
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false))
  }, [refreshKey])

  if (loading) return <TabLoader />

  if (!data?.totals) {
    return (
      <EmptyState
        title={t('main.dashboard.yearOverYearTab.unableToLoad')}
        icon="📉"
      />
    )
  }

  const { currentYear, compareYear, totals, monthlyMilkTrend } = data
  const cur = totals[currentYear]
  const prev = totals[compareYear]

  if (!cur || !prev) {
    return (
      <EmptyState
        title={t('main.dashboard.yearOverYearTab.notEnoughData')}
        icon="📉"
      />
    )
  }

  const metrics = [
    {
      key: 'totalMilk',
      label: t('main.dashboard.yearOverYearTab.totalMilk'),
      cur: cur.totalMilk,
      prev: prev.totalMilk,
      unit: 'L',
      icon: '🥛'
    },
    {
      key: 'avgMilkPerCow',
      label: t('main.dashboard.yearOverYearTab.avgMilkPerCow'),
      cur: cur.avgMilkPerCow,
      prev: prev.avgMilkPerCow,
      unit: 'L',
      icon: '📊'
    },
    {
      key: 'calvings',
      label: t('main.dashboard.yearOverYearTab.calvings'),
      cur: cur.calvingCount,
      prev: prev.calvingCount,
      unit: '',
      icon: '🐄'
    },
    {
      key: 'treatments',
      label: t('main.dashboard.yearOverYearTab.treatments'),
      cur: cur.treatmentCount,
      prev: prev.treatmentCount,
      unit: '',
      icon: '💊'
    },
    {
      key: 'treatmentCost',
      label: t('main.dashboard.common.treatmentCost'),
      cur: cur.treatmentCost,
      prev: prev.treatmentCost,
      unit: 'PKR',
      icon: '💰'
    },
    {
      key: 'mortality',
      label: t('main.dashboard.yearOverYearTab.mortality'),
      cur: cur.mortalityCount,
      prev: prev.mortalityCount,
      unit: '',
      icon: '⚠️'
    }
  ]

  const chartLabels = (monthlyMilkTrend ?? []).map((m, i) =>
    i % 2 === 0 ? String(m.month) : ''
  )
  const seriesCurrent = (monthlyMilkTrend ?? []).map(
    m => Number(m[String(currentYear)]) || 0
  )
  const seriesPrev = (monthlyMilkTrend ?? []).map(
    m => Number(m[String(compareYear)]) || 0
  )

  return (
    <>
      <View style={styles.tileGrid}>
        {metrics.map(m => {
          const change = pctChange(m.cur, m.prev)
          // Lower is better for mortality & treatment cost
          const isGoodDirection =
            m.key === 'mortality' || m.key === 'treatmentCost'
              ? (change ?? 0) <= 0
              : (change ?? 0) >= 0
          const trend: Trend | undefined =
            change !== null
              ? {
                  direction: change === 0 ? 'flat' : isGoodDirection ? 'up' : 'down',
                  label: t('main.dashboard.yearOverYearTab.vsYear', {
                    change: `${change > 0 ? '+' : ''}${change}`,
                    year: compareYear
                  })
                }
              : undefined
          return (
            <StatTile
              key={m.key}
              icon={m.icon}
              label={m.label}
              value={m.unit === 'PKR' ? fmtMoney(m.cur) : fmtNum(m.cur, m.unit ? ` ${m.unit}` : '')}
              sublabel={`${compareYear}: ${
                m.unit === 'PKR' ? fmtMoney(m.prev) : fmtNum(m.prev, m.unit ? ` ${m.unit}` : '')
              }`}
              trend={trend}
            />
          )
        })}
      </View>

      <GlassCard
        title={t('main.dashboard.yearOverYearTab.monthlyMilkTitle', {
          current: currentYear,
          compare: compareYear
        })}
      >
        {monthlyMilkTrend?.length ? (
          <TrendLineChart
            labels={chartLabels}
            series={[
              { data: seriesCurrent, color: COLORS.chartGreen, name: String(currentYear) },
              { data: seriesPrev, color: COLORS.chartBlue, name: String(compareYear) }
            ]}
            showLegend
            area={false}
            height={RF(220)}
          />
        ) : (
          <EmptyState
            title={t('main.dashboard.yearOverYearTab.noMonthlyData')}
            icon="📈"
          />
        )}
      </GlassCard>

      {!!data.currentAnimalCountsNote && (
        <AppText
          fontSize="10"
          medium
          color="labelGrey"
          style={{ fontStyle: 'italic', marginTop: RF(10) }}
        >
          {data.currentAnimalCountsNote}
        </AppText>
      )}
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

export default YearOverYearTab
