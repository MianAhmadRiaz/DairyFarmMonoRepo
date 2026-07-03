import React, { useState } from 'react'
import { Image, SafeAreaView, View } from 'react-native'
import FastImage from 'react-native-fast-image'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import Toast from 'react-native-toast-message'
import { useDispatch } from 'react-redux'
import { ICONS } from 'assets/icons'
import AppInput from 'shared/components/AppInput'
import AppText from 'shared/components/AppText/AppText'
import PrimaryButton from 'shared/components/PrimaryButton'
import { setPassword as setPasswordApi, getCurrentUser } from 'shared/services/auth.services'
import { getNormalizedError } from 'shared/services/helper.services'
import { setUser } from 'shared/store/reducers/userReducer'
import { COLORS, THEME } from 'shared/theme'
import { RF } from 'shared/theme/responsive'

// First-login screen: the user arrives here (from the router) when their account
// was created with a temporary password. Setting a new one clears the flag and
// unlocks the app.
const SetPassword = () => {
  const dispatch = useDispatch()
  const [current, setCurrent] = useState('')
  const [password, setPass] = useState('')
  const [confirm, setConfirm] = useState('')
  const [secure, setSecure] = useState(true)
  const [loading, setLoading] = useState(false)

  const onSubmit = async () => {
    if (!current || !password || !confirm) {
      Toast.show({ type: 'error', text1: 'Validation', text2: 'Fill all fields' })
      return
    }
    if (password !== confirm) {
      Toast.show({ type: 'error', text1: 'Validation', text2: 'Passwords do not match' })
      return
    }
    try {
      setLoading(true)
      await setPasswordApi({ currentPassword: current, password, confirmpassword: confirm })
      // Re-hydrate the user so must_reset_password clears and permissions refresh.
      const res = await getCurrentUser()
      if (res?.data?.data) dispatch(setUser(res.data.data))
      Toast.show({ type: 'success', text1: 'Success', text2: 'Password updated' })
    } catch (e) {
      Toast.show({ type: 'error', text1: 'Error', text2: getNormalizedError(e) })
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.white }}>
      <View style={{ flex: 0.5, justifyContent: 'center', alignItems: 'center' }}>
        <Image source={ICONS.MAIN_LOGO} style={{ width: RF(120), height: RF(120) }} resizeMode={FastImage.resizeMode.contain} />
        <AppText fontSize="h5" bold color="primaryMain">
          Set Your Password
        </AppText>
        <AppText fontSize="caption" color="descriptionColor" style={{ marginTop: RF(6), textAlign: 'center', paddingHorizontal: RF(30) }}>
          Your account uses a temporary password. Set a new one to continue.
        </AppText>
      </View>
      <KeyboardAwareScrollView
        keyboardShouldPersistTaps="always"
        style={{
          flex: 1,
          borderTopLeftRadius: THEME.RADIUS.OVAL,
          borderTopRightRadius: THEME.RADIUS.OVAL,
          backgroundColor: COLORS.primaryLight,
          paddingHorizontal: RF(16),
          paddingTop: RF(24)
        }}
      >
        <AppInput label="Temporary Password" value={current} onChangeText={setCurrent} secureTextEntry={secure} eye={secure ? 'eye-off' : 'eye'} onPressIcon={() => setSecure(!secure)} placeholder="Enter temporary password" />
        <AppInput label="New Password" value={password} onChangeText={setPass} secureTextEntry={secure} placeholder="Min 8 chars, upper/lower/number/special" />
        <AppInput label="Confirm New Password" value={confirm} onChangeText={setConfirm} secureTextEntry={secure} placeholder="Re-enter new password" />
        <PrimaryButton
          title="Set Password"
          loading={loading}
          loaderColor={COLORS.white}
          onPress={onSubmit}
          buttonStyle={{ backgroundColor: COLORS.primaryMain, marginTop: RF(20) }}
          textStyle={{ color: COLORS.white }}
        />
      </KeyboardAwareScrollView>
    </SafeAreaView>
  )
}

export default SetPassword
