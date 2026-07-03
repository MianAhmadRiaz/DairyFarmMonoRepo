import React, { useCallback, useState } from 'react'
import {
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View
} from 'react-native'

import AppText from 'shared/components/AppText/AppText'
import { COLORS } from 'shared/theme'
import { RF, WP } from 'shared/theme/responsive'
import { GenericNavigation } from 'shared/utils/models/types'
import TabBar from './components/Dashboard/TabBar'
import AlertsTab from './components/Dashboard/tabs/AlertsTab'
import CompositionTab from './components/Dashboard/tabs/CompositionTab'
import FinancialsTab from './components/Dashboard/tabs/FinancialsTab'
import HealthTab from './components/Dashboard/tabs/HealthTab'
import OverviewTab from './components/Dashboard/tabs/OverviewTab'
import ProductionTab from './components/Dashboard/tabs/ProductionTab'
import ReproductionTab from './components/Dashboard/tabs/ReproductionTab'
import YearOverYearTab from './components/Dashboard/tabs/YearOverYearTab'
import HomeHeader from './components/HomeHeader/HomeHeader'

// Same tab set as the web Herd Dashboard (scenes/dashboard/Dashboard/index.tsx)
const TABS = [
  { label: 'Overview', component: OverviewTab },
  { label: 'Production', component: ProductionTab },
  { label: 'Reproduction', component: ReproductionTab },
  { label: 'Health & Disease', component: HealthTab },
  { label: 'Composition', component: CompositionTab },
  { label: 'Financials', component: FinancialsTab },
  { label: 'Year-over-Year', component: YearOverYearTab },
  { label: 'Alerts & Tasks', component: AlertsTab }
]

/**
 * Herd Dashboard — mobile counterpart of the web app's HerdDashboard:
 * a scrollable tab bar over eight data-driven tabs.
 */
const Home = (props: GenericNavigation) => {
  const [tab, setTab] = useState(0)
  const [refreshing, setRefreshing] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  const onRefresh = useCallback(() => {
    setRefreshing(true)
    // Bump the key so the active tab refetches; its own loader takes over
    setRefreshKey(k => k + 1)
    setTimeout(() => setRefreshing(false), 600)
  }, [])

  const ActiveTab = TABS[tab].component

  return (
    <>
      <SafeAreaView style={styles.safeArea} />
      <HomeHeader showUser />

      <View style={styles.titleRow}>
        <AppText bold fontSize="h6" color="darkestGrey">
          Herd Dashboard
        </AppText>
        <AppText fontSize="11" medium color="labelGrey">
          Your farm, at a glance — production, health, breeding &amp; more
        </AppText>
      </View>

      <TabBar tabs={TABS.map(t => t.label)} active={tab} onChange={setTab} />

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
        <ActiveTab refreshKey={refreshKey} />
      </ScrollView>
    </>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: COLORS.background
  },
  titleRow: {
    backgroundColor: COLORS.background,
    paddingHorizontal: WP(4),
    paddingBottom: RF(2)
  },
  scroll: {
    backgroundColor: COLORS.background,
    paddingHorizontal: WP(4)
  },
  scrollContent: {
    paddingBottom: RF(150)
  }
})

export default Home
