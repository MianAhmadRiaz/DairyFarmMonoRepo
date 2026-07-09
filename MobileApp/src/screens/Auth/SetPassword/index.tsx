import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
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
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const [current, setCurrent] = useState('')
  const [password, setPass] = useState('')
  const [confirm, setConfirm] = useState('')
  const [secure, setSecure] = useState(true)
  const [loading, setLoading] = useState(false)

  const onSubmit = async () => {
    if (!current || !password || !confirm) {
      Toast.show({ type: 'error', text1: t('auth.setPassword.validation'), text2: t('auth.setPassword.fillAllFields') })
      return
    }
    if (password !== confirm) {
      Toast.show({ type: 'error', text1: t('auth.setPassword.validation'), text2: t('auth.setPassword.passwordsDoNotMatch') })
      return
    }
    try {
      setLoading(true)
      await setPasswordApi({ currentPassword: current, password, confirmpassword: confirm })
      // Re-hydrate the user so must_reset_password clears and permissions refresh.
      const res = await getCurrentUser()
      if (res?.data?.data) dispatch(setUser(res.data.data))
      Toast.show({ type: 'success', text1: t('auth.common.success'), text2: t('auth.setPassword.passwordUpdated') })
    } catch (e) {
      Toast.show({ type: 'error', text1: t('auth.common.error'), text2: getNormalizedError(e) })
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.white }}>
      <View style={{ flex: 0.5, justifyContent: 'center', alignItems: 'center' }}>
        <Image source={ICONS.MAIN_LOGO} style={{ width: RF(120), height: RF(120) }} resizeMode={FastImage.resizeMode.contain} />
        <AppText fontSize="h5" bold color="primaryMain">
          {t('auth.setPassword.title')}
        </AppText>
        <AppText fontSize="caption" color="descriptionColor" style={{ marginTop: RF(6), textAlign: 'center', paddingHorizontal: RF(30) }}>
          {t('auth.setPassword.subtitle')}
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
        <AppInput label={t('auth.setPassword.temporaryPassword')} value={current} onChangeText={setCurrent} secureTextEntry={secure} eye={secure ? 'eye-off' : 'eye'} onPressIcon={() => setSecure(!secure)} placeholder={t('auth.setPassword.temporaryPasswordPlaceholder')} />
        <AppInput label={t('auth.setPassword.newPassword')} value={password} onChangeText={setPass} secureTextEntry={secure} placeholder={t('auth.setPassword.newPasswordPlaceholder')} />
        <AppInput label={t('auth.setPassword.confirmNewPassword')} value={confirm} onChangeText={setConfirm} secureTextEntry={secure} placeholder={t('auth.setPassword.confirmNewPasswordPlaceholder')} />
        <PrimaryButton
          title={t('auth.setPassword.setPassword')}
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
