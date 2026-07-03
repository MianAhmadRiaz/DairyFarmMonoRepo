import React from 'react'
import { SafeAreaView, ScrollView, StyleSheet, View } from 'react-native'

import { COLORS } from 'shared/theme'
import { RF, WP } from 'shared/theme/responsive'
import { GenericNavigation } from 'shared/utils/models/types'
import HomeHeader from './components/HomeHeader/HomeHeader'
import ProductionStatsCard from './components/ProductionStatsCard/ProductionStatsCard'
import HerdInformation from './components/HerdInformation/HerdInformation'
import UpcomingTasksCard from './components/UpcomingTaskCards/UpcomingtaskCards'
import InventorySupplyCard from './components/InventorySupplyCard/InventorySupplyCard'

const Home = (props: GenericNavigation) => {
  return (
    <>
      <SafeAreaView style={styles.container} />

      <HomeHeader showUser />
      {/* {loading && <AppLoader isVisible />} */}

      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{
          backgroundColor: COLORS.background,
          paddingHorizontal: RF(10)
        }}
        contentContainerStyle={{
          paddingBottom: RF(150)
        }}
      >
        <HerdInformation />
        <ProductionStatsCard />
        <UpcomingTasksCard />
        <InventorySupplyCard />
      </ScrollView>
      {/* </SafeAreaView> */}
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: WP(4),
    backgroundColor: COLORS.background
  }
})

export default Home
