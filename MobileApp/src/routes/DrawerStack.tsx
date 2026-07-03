import { createDrawerNavigator } from '@react-navigation/drawer'
import React from 'react'
import { SafeAreaView, StyleSheet, useWindowDimensions } from 'react-native'

import AnimalInfo from 'screens/Main/AnimalInfo'
import Home from 'screens/Main/Home'
import Drawer from 'shared/components/Drawer'
import { COLORS } from 'shared/theme'
import NavRoutes from './NavRoutes'
import { NavigationContainer } from '@react-navigation/native'
import BreedingEventsStack from './BreedingEventsStack/BreedingEvents'
import MilkStack from './MilkStack'
import HealthStack from './HealthStack'
import FeedingStack from './FeedingStack'
import StockStack from './StockStack'
import EmployeeStack from './EmployeeStack'
import FinanceStack from './FinanceStack'

const DrawerNav = createDrawerNavigator()

const DrawerStack = () => {
  const { width } = useWindowDimensions()
  return (
    <SafeAreaView style={styles.main}>
      <NavigationContainer>
        <DrawerNav.Navigator
          screenOptions={{
            headerShown: false,
            drawerStyle: {
              width: width > 600 ? 300 : 250 // Adjust based on screen width
            }
          }}
          drawerContent={props => <Drawer {...props} />}
        >
          <DrawerNav.Screen name={NavRoutes.HOME} component={Home} />
          <DrawerNav.Screen name={'AnimalsInfo'} component={AnimalInfo} />
          <DrawerNav.Screen name={'BreedingEventsStack'} component={BreedingEventsStack} />
          <DrawerNav.Screen name={'HealthStack'} component={HealthStack} />
          <DrawerNav.Screen name={'MilkStack'} component={MilkStack} />
          <DrawerNav.Screen name={'FeedingStack'} component={FeedingStack} />
          <DrawerNav.Screen name={'StockStack'} component={StockStack} />
          <DrawerNav.Screen name={'EmployeeStack'} component={EmployeeStack} />
          <DrawerNav.Screen name={'FinanceStack'} component={FinanceStack} />
        </DrawerNav.Navigator>
      </NavigationContainer>
    </SafeAreaView>
  )
}

export default DrawerStack

const styles = StyleSheet.create({
  main: { flex: 1, backgroundColor: COLORS.background }
})
