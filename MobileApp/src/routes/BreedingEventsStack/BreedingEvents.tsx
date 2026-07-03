import { createStackNavigator } from '@react-navigation/stack'
import React from 'react'
import NavRoutes from 'routes/NavRoutes'
import Abortion from 'screens/BreedingEvents/Abortion'
import AIBreeding from 'screens/BreedingEvents/AIBreeding'
import BullBreeding from 'screens/BreedingEvents/BullBreeding'
import HeatDetection from 'screens/BreedingEvents/HeatDetection'

import AddHeatDetection from 'screens/BreedingEvents/HeatDetection/AddHeatDetection'
import BreedingEvents from 'screens/BreedingEvents/MainScreen'
import Protocol from 'screens/BreedingEvents/Protocol'

const Stack = createStackNavigator()

const BreedingEventsStack = () => {
  return (
    <Stack.Navigator
      screenOptions={() => ({
        headerShown: false,
        animationEnabled: true,
        gestureEnabled: false
      })}
    >
      <Stack.Screen
        name={NavRoutes.BREEDING_EVENTS}
        component={BreedingEvents}
      />
      <Stack.Screen name={NavRoutes.PROTOCOL} component={Protocol} />
      <Stack.Screen name={NavRoutes.AI_BREEDING} component={AIBreeding} />
      <Stack.Screen name={NavRoutes.BULL_BREEDING} component={BullBreeding} />

      {/* <Stack.Screen name={NavRoutes.PREGNANCY_CHECK} component={} /> */}
      <Stack.Screen name={NavRoutes.ABORTION} component={Abortion} />
      {/* <Stack.Screen name={NavRoutes.CALVING} component={Calving} /> */}
      {/* <Stack.Screen name={NavRoutes.DRY_OFF} component={DryOff} /> */}
      <Stack.Screen name={NavRoutes.HEAT_DETECTION} component={HeatDetection} />
      <Stack.Screen
        name={NavRoutes.ADD_HEAT_DETECTION}
        component={AddHeatDetection}
      />
    </Stack.Navigator>
  )
}

export default BreedingEventsStack
