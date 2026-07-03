import { createDrawerNavigator } from '@react-navigation/drawer'
import React from 'react'
import CowMonitoring from 'screens/Main/CowMonitoring'
import DeliveryManagement from 'screens/Main/DeliveryManagement'
import FinancialManagement from 'screens/Main/FinancialManagement'
import HelpScreen from 'screens/Main/ProfileScreen'
import Home from 'screens/Main/Home'
import NavRoutes from './NavRoutes'
import { createStackNavigator } from '@react-navigation/stack'
import ProfileScreen from 'screens/Main/ProfileScreen'
import BottomTabs from './TabRoutes'
import { SafeAreaView } from 'react-native'
import { COLORS } from 'shared/theme'
import DrawerStack from './DrawerStack'
import { NavigationContainer } from '@react-navigation/native'
import AnimalInfo from 'screens/Main/AnimalInfo'

const Stack = createStackNavigator()

const MainStack = () => {
  return (
    // <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="DrawerStack"
        screenOptions={({}) => ({
          headerShown: false
        })}
      >
        <Stack.Screen name={'DrawerStack'} component={DrawerStack} />
        <Stack.Screen name={NavRoutes.HOME} component={Home} />
        <Stack.Screen name={'AnimalInfo'} component={AnimalInfo} />

        <Stack.Screen name={'ProfileScreen'} component={ProfileScreen} />
        <Stack.Screen
          name={'FinancialManagement'}
          component={FinancialManagement}
        />
        <Stack.Screen
          name={'DeliveryManagement'}
          component={DeliveryManagement}
        />
        <Stack.Screen name={'HelpScreen'} component={HelpScreen} />
      </Stack.Navigator>
    </NavigationContainer>
    // </SafeAreaView>
  )
}

export default MainStack
