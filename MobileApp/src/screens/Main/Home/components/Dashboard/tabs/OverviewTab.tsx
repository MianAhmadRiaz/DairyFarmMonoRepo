import moment from 'moment'
import React, { useCallback, useEffect, useState } from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'
import AppText from 'shared/components/AppText/AppText'
import {
  DashboardStats,
  fetchDashboardStats,
  fetchHerdAlerts,
  fetchMilkDashboard,
  fetchReproductionSummary,
  HerdAlerts,
  MilkDashboard,
  ReproductionSummary
} from 'shared/services/dashboard.services'
import { COLORS, THEME } from 'shared/theme'
import { RF, WP } from 'shared/theme/responsive'
import AlertsCard from '../AlertsCard'
import HerdCompositionCard from '../HerdCompositionCard'
import MilkTrendChart from '../MilkTrendChart'
import StatTile from '../StatTile'
import TabLoader from '../TabLoader'
import { fmtNum } from '../utils'

interface Props {
  refreshKey: number
}

/**
 * Overview tab — mirrors the web app's OverviewTab: six KPI tiles,
 * the 30-day milk trend and today's alerts, fetched in parallel.
 */
const OverviewTab = ({ refreshKey }: Props) => {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [milk, setMilk] = useState<MilkDashboard | null>(null)
  const [alerts, setAlerts] = useState<HerdAlerts | null>(null)
  const [repro, setRepro] = useState<ReproductionSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const load = useCallback(async () => {
    const end = moment().format('YYYY-MM-DD')
    const start = moment().subtract(30, 'days').format('YYYY-MM-DD')

    // Same orchestration as the web OverviewTab: parallel, each failing soft
    const [statsRes, milkRes, alertsRes, reproRes] = await Promise.all([
      fetchDashboardStats().catch(() => null),
      fetchMilkDashboard('week', start, end).catch(() => null),
      fetchHerdAlerts().catch(() => null),
      fetchReproductionSummary().catch(() => null)
    ])

    setStats(statsRes)
    setMilk(milkRes)
    setAlerts(alertsRes)
    setRepro(reproRes)
    setError(!statsRes && !milkRes && !alertsRes && !reproRes)
  }, [])

  useEffect(() => {
    setLoading(true)
    load().finally(() => setLoading(false))
  }, [load, refreshKey])

  if (loading) return <TabLoader />

  if (error) {
    return (
      <View style={styles.errorBox}>
        <AppText fontSize="h4">📡</AppText>
        <AppText bold fontSize="h7" color="darkestGrey" style={{ marginTop: RF(8) }}>
          Couldn't reach the server
        </AppText>
        <AppText
          medium
          fontSize="caption"
          color="labelGrey"
          style={{ marginTop: RF(4), textAlign: 'center' }}
        >
          Check your connection and try again
        </AppText>
        <TouchableOpacity
          style={styles.retryBtn}
          onPress={() => {
            setLoading(true)
            setError(false)
            load().finally(() => setLoading(false))
          }}
        >
          <AppText semiBold color="white">
            Retry
          </AppText>
        </TouchableOpacity>
      </View>
    )
  }

  const pregnancyRate = repro?.pregnancyRate ?? stats?.pregnantPercentage

  const tiles = [
    { icon: '🐄', label: 'Total Animals', value: fmtNum(stats?.totalAnimals) },
    { icon: '🥛', label: 'Milking Cows', value: fmtNum(stats?.milk) },
    {
      icon: '🤰',
      label: 'Pregnancy Rate',
      value: fmtNum(pregnancyRate, '%'),
      sublabel:
        stats?.totalPregnant !== undefined
          ? `${fmtNum(stats?.totalPregnant)} pregnant`
          : undefined
    },
    {
      icon: '🧴',
      label: "Today's Milk",
      value: fmtNum(milk?.today_total_milk, ' L'),
      sublabel:
        milk?.yesterday_total_milk !== undefined
          ? `Yesterday ${fmtNum(milk?.yesterday_total_milk, ' L')}`
          : undefined
    },
    { icon: '📊', label: 'Avg / Cow', value: fmtNum(milk?.avg_milk_per_cow, ' L') },
    {
      icon: '🔁',
      label: 'Calving Interval',
      value: fmtNum(repro?.avgCalvingIntervalDays, ' d')
    }
  ]

  return (
    <>
      <View style={styles.tileGrid}>
        {tiles.map(t => (
          <StatTile key={t.label} {...t} />
        ))}
      </View>

      <MilkTrendChart data={milk?.milkData ?? []} />
      {alerts && <AlertsCard alerts={alerts} />}
      {stats && <HerdCompositionCard stats={stats} />}
    </>
  )
}

const styles = StyleSheet.create({
  tileGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between'
  },
  errorBox: {
    marginTop: RF(80),
    alignItems: 'center',
    paddingHorizontal: WP(10)
  },
  retryBtn: {
    marginTop: RF(16),
    backgroundColor: COLORS.primaryMain,
    paddingHorizontal: RF(28),
    paddingVertical: RF(10),
    borderRadius: RF(22)
  }
})

export default OverviewTab
