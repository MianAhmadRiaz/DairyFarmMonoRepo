import { createStackNavigator } from '@react-navigation/stack'
import React from 'react'
import HealthHome from 'screens/Health/HealthHome'
import Treatments from 'screens/Health/Treatments'
import AddTreatment from 'screens/Health/AddTreatment'
import Withdrawals from 'screens/Health/Withdrawals'
import HerdAlerts from 'screens/Health/HerdAlerts'

const Stack = createStackNavigator()

const HealthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false, gestureEnabled: false }}>
    <Stack.Screen name="HealthHome" component={HealthHome} />
    <Stack.Screen name="Treatments" component={Treatments} />
    <Stack.Screen name="AddTreatment" component={AddTreatment} />
    <Stack.Screen name="Withdrawals" component={Withdrawals} />
    <Stack.Screen name="HerdAlerts" component={HerdAlerts} />
  </Stack.Navigator>
)

export default HealthStack
