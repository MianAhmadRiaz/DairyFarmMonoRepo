import { ICONS } from 'assets/icons'

import React, { useState } from 'react'
import { Image, SafeAreaView, TouchableOpacity, View } from 'react-native'
import FastImage from 'react-native-fast-image'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import Toast from 'react-native-toast-message'
import AppInput from 'shared/components/AppInput'
import AppText from 'shared/components/AppText/AppText'
import PrimaryButton from 'shared/components/PrimaryButton'
import NavRoutes from '../../../routes/NavRoutes'

import { COLORS, THEME } from 'shared/theme'
import { RF } from 'shared/theme/responsive'

import { useDispatch, useSelector } from 'react-redux'
import {
  copyToClipboard,
  getNormalizedError
} from 'shared/services/helper.services'
import { setAccessToken } from 'shared/store/reducers/authReducer'
import { GenericNavigation } from 'shared/utils/models/types'
import styles from './styles'
import { RootState } from 'shared/store/configureStore'
import AnyIcon, { Icons } from 'shared/components/AnyIcon'
import { login } from 'shared/services/auth.services'
import { setUser } from 'shared/store/reducers/userReducer'

interface Props extends GenericNavigation {}
const Login = (props: Props) => {
  const { fcmToken } = useSelector((state: RootState) => state.auth)
  const [handleLoading, setHandleLoading] = useState(false)
  const initialValues = {
    email: __DEV__ ? 'abdullah@yopmail.com' : '',
    password: __DEV__ ? 'Admin@1122' : ''
  }
  const [values, setValues] = useState(initialValues)

  const dispatch = useDispatch()

  const [secureEntry, setSecureEntry] = useState(true)
  const toggleEye = () => setSecureEntry(!secureEntry)

  const onPressForgotPassword = () =>
    props?.navigation?.navigate(NavRoutes.FORGOT_PASSWORD)

  const onSubmit = async () => {
    try {
      setHandleLoading(true)
      const params = {
        email: values.email.toLowerCase(),
        password: values.password
      }
      const loginRes = await login(params)
      console.log('loginRes', loginRes)
      const token = loginRes?.data.data?.token
      const userData = loginRes?.data.data

      Toast.show({
        text1: 'Success',
        text2: 'Login Successfully',
        type: 'success'
      })

      dispatch(setAccessToken(token))
      dispatch(setUser(userData))
      setHandleLoading(false)
    } catch (e) {
      console.log('login error', e)

      const error = getNormalizedError(e)
      Toast.show({
        text1: 'Error',
        text2: error ? error : 'Error Creating Account',
        type: 'error'
      })
      setHandleLoading(false)
    }
  }
  const handleChange = (key: string) => (value: string) => {
    setValues(prevValues => ({
      ...prevValues,
      [key]: value
    }))
  }

  return (
    <>
      <SafeAreaView style={styles.mainContainer}>
        <View style={styles.topContainer}>
          <Image
            source={ICONS.MAIN_LOGO}
            style={{
              width: RF(150),
              height: RF(150)
            }}
            resizeMode={FastImage.resizeMode.contain}
          />
          <AppText
            fontSize="h5"
            style={{ letterSpacing: 0.5 }}
            bold
            color={'primaryMain'}
          >
            Cattle's Care
          </AppText>
        </View>

        <>
          <KeyboardAwareScrollView
            keyboardShouldPersistTaps={'always'}
            style={styles.bottomContainer}
          >
            <View style={styles.inputView}>
              <AppInput
                value={values.email}
                onChangeText={handleChange('email')}
                inputStyle={styles.inputStyle}
                label="Email"
                placeholder="Enter Email"
                icon="mail"
              />

              <AppInput
                value={values.password}
                onChangeText={handleChange('password')}
                inputStyle={styles.inputStyle}
                label="Password"
                placeholder="Enter Password"
                secureTextEntry={secureEntry}
                eye={secureEntry ? 'eye-off' : 'eye'}
                onPressIcon={toggleEye}
              />
              <TouchableOpacity onPress={onPressForgotPassword}>
                <AppText>Forgot Password?</AppText>
              </TouchableOpacity>
            </View>
            <PrimaryButton
              title="Sign In"
              loading={handleLoading}
              loaderColor={COLORS.white}
              buttonStyle={styles.buttonStyle}
              textStyle={styles.buttonText}
              onPress={onSubmit}
            />
            <TouchableOpacity
              style={{ marginTop: RF(50) }}
              onPress={() => copyToClipboard(fcmToken)}
            >
              <AppText style={{ color: COLORS.BLACK_TRANS }}>
                {fcmToken}
              </AppText>
              <AnyIcon
                disabled
                name="copy"
                type={Icons.Feather}
                size={10}
                color={COLORS.BLACK_TRANS}
              />
            </TouchableOpacity>
          </KeyboardAwareScrollView>
        </>
      </SafeAreaView>
      <SafeAreaView
        style={{
          backgroundColor: COLORS.primaryLight
        }}
      />
    </>
  )
}

export default Login
