import moment from 'moment'
import React, { useCallback, useEffect, useState } from 'react'
import {
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native'

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
import { COLORS } from 'shared/theme'
import { RF, WP } from 'shared/theme/responsive'
import { GenericNavigation } from 'shared/utils/models/types'
import AlertsCard from './components/Dashboard/AlertsCard'
import HerdCompositionCard from './components/Dashboard/HerdCompositionCard'
import MilkTrendChart from './components/Dashboard/MilkTrendChart'
import StatTile from './components/Dashboard/StatTile'
import HomeHeader from './components/HomeHeader/HomeHeader'

const fmtNum = (n: number | undefined | null, suffix = '') =>
  n === undefined || n === null
    ? '—'
    : `${Number(n).toLocaleString('en-US', { maximumFractionDigits: 1 })}${suffix}`

/**
 * Herd Dashboard — mirrors the web app's Overview tab
 * (scenes/dashboard/Dashboard/tabs/OverviewTab.tsx): six KPI tiles,
 * the 30-day milk trend and today's alerts, fetched in parallel.
 */
const Home = (props: GenericNavigation) => {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [milk, setMilk] = useState<MilkDashboard | null>(null)
  const [alerts, setAlerts] = useState<HerdAlerts | null>(null)
  const [repro, setRepro] = useState<ReproductionSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState(false)

  const loadDashboard = useCallback(async () => {
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
    loadDashboard().finally(() => setLoading(false))
  }, [loadDashboard])

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    await loadDashboard()
    setRefreshing(false)
  }, [loadDashboard])

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
      <SafeAreaView style={styles.safeArea} />
      <HomeHeader showUser />

      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primaryMain}
            colors={[COLORS.primaryMain]}
          />
        }
      >
        {loading ? (
          <View style={styles.loader}>
            <ActivityIndicator size="large" color={COLORS.primaryMain} />
            <AppText medium color="labelGrey" style={{ marginTop: RF(10) }}>
              Loading your farm…
            </AppText>
          </View>
        ) : error ? (
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
                loadDashboard().finally(() => setLoading(false))
              }}
            >
              <AppText semiBold color="white">
                Retry
              </AppText>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <AppText bold fontSize="h6" color="darkestGrey" style={styles.sectionTitle}>
              Your farm, at a glance
            </AppText>
            <View style={styles.tileGrid}>
              {tiles.map(t => (
                <StatTile key={t.label} {...t} />
              ))}
            </View>

            <MilkTrendChart data={milk?.milkData ?? []} />
            {alerts && <AlertsCard alerts={alerts} />}
            {stats && <HerdCompositionCard stats={stats} />}
          </>
        )}
      </ScrollView>
    </>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: COLORS.background
  },
  scroll: {
    backgroundColor: COLORS.background,
    paddingHorizontal: WP(4)
  },
  scrollContent: {
    paddingBottom: RF(150)
  },
  sectionTitle: {
    marginTop: RF(8)
  },
  tileGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between'
  },
  loader: {
    marginTop: RF(120),
    alignItems: 'center'
  },
  errorBox: {
    marginTop: RF(100),
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

export default Home
