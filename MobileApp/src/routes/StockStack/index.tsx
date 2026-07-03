import { createStackNavigator } from '@react-navigation/stack'
import React from 'react'
import StockHome from 'screens/Stock/StockHome'
import StockItems from 'screens/Stock/StockItems'
import Purchases from 'screens/Stock/Purchases'
import AddPurchase from 'screens/Stock/AddPurchase'
import Suppliers from 'screens/Stock/Suppliers'
import Consumption from 'screens/Stock/Consumption'
import StockReports from 'screens/Stock/StockReports'

const Stack = createStackNavigator()

const StockStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false, gestureEnabled: false }}>
    <Stack.Screen name="StockHome" component={StockHome} />
    <Stack.Screen name="StockItems" component={StockItems} />
    <Stack.Screen name="Purchases" component={Purchases} />
    <Stack.Screen name="AddPurchase" component={AddPurchase} />
    <Stack.Screen name="Suppliers" component={Suppliers} />
    <Stack.Screen name="Consumption" component={Consumption} />
    <Stack.Screen name="StockReports" component={StockReports} />
  </Stack.Navigator>
)

export default StockStack
