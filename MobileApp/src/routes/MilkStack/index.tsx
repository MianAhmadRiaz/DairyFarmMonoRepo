import { createStackNavigator } from '@react-navigation/stack'
import React from 'react'
import MilkHome from 'screens/Milk/MilkHome'
import MilkSessions from 'screens/Milk/MilkSessions'
import AddMilkSession from 'screens/Milk/AddMilkSession'
import MilkApproval from 'screens/Milk/MilkApproval'
import MilkOut from 'screens/Milk/MilkOut'

const Stack = createStackNavigator()

const MilkStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false, gestureEnabled: false }}>
    <Stack.Screen name="MilkHome" component={MilkHome} />
    <Stack.Screen name="MilkSessions" component={MilkSessions} />
    <Stack.Screen name="AddMilkSession" component={AddMilkSession} />
    <Stack.Screen name="MilkApproval" component={MilkApproval} />
    <Stack.Screen name="MilkOut" component={MilkOut} />
  </Stack.Navigator>
)

export default MilkStack
