import { createStackNavigator } from '@react-navigation/stack'
import React from 'react'
import FinanceHome from 'screens/Finance/FinanceHome'
import Transactions from 'screens/Finance/Transactions'
import ProfitLoss from 'screens/Finance/ProfitLoss'

const Stack = createStackNavigator()

const FinanceStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false, gestureEnabled: false }}>
    <Stack.Screen name="FinanceHome" component={FinanceHome} />
    <Stack.Screen name="Transactions" component={Transactions} />
    <Stack.Screen name="ProfitLoss" component={ProfitLoss} />
  </Stack.Navigator>
)

export default FinanceStack
