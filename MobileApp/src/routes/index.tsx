import { NavigationContainer } from '@react-navigation/native'
import React, { useEffect } from 'react'
import SplashScreen from 'react-native-splash-screen'
import Toast from 'react-native-toast-message'
import { useSelector } from 'react-redux'

import { RootState } from '../shared/store/configureStore'
import AuthStack from './AuthStack/Auth.routes'
import { StatusBar } from 'react-native'
import { COLORS } from 'shared/theme'
import DrawerStack from './DrawerStack'
import SetPassword from 'screens/Auth/SetPassword'

const Routes = () => {
  const { accessToken } = useSelector((state: RootState) => state.auth)
  const user = useSelector((state: RootState) => state.user.user)

  useEffect(() => {
    SplashScreen.hide()
  }, [])

  // A logged-in user whose account still uses a temporary password must set a
  // new one before reaching the app.
  const mustResetPassword = Boolean(accessToken && user?.must_reset_password)

  return (
    <>
      <StatusBar
        backgroundColor={COLORS.background}
        barStyle={'dark-content'}
      />
      {!accessToken ? (
        <AuthStack />
      ) : mustResetPassword ? (
        <SetPassword />
      ) : (
        <DrawerStack />
      )}

      <Toast position="bottom" />
    </>
  )
}

export default Routes