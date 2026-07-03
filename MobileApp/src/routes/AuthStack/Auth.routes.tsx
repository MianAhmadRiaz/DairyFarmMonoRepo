import { createStackNavigator } from '@react-navigation/stack'
import React from 'react'
import { StatusBar } from 'react-native'

import ForgotPassword from '../../screens/Auth/ForgotPassword'

import { COLORS, THEME } from '../../shared/theme'
import Login from '../../screens/Auth/Login'

import { NavigationContainer } from '@react-navigation/native'
import { navigationRef } from 'shared/services/nav.service'
import NavRoutes from 'routes/NavRoutes'

const Stack = createStackNavigator()

const AuthStack = () => {
  return (
    <NavigationContainer ref={navigationRef}>
      {/* <StatusBar animated={true} backgroundColor={COLORS.white} /> */}
      <Stack.Navigator
        screenOptions={() => ({
          headerShown: false,
          animationEnabled: true,
          gestureEnabled: false
        })}
      >
        <Stack.Screen name={NavRoutes.LOGIN} component={Login} />
        <Stack.Screen
          name={NavRoutes.FORGOT_PASSWORD}
          component={ForgotPassword}
        />
      </Stack.Navigator>
    </NavigationContainer>
  )
}

export default AuthStack
