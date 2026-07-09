import { ICONS } from 'assets/icons'
import { useFormik } from 'formik'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Image,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  View
} from 'react-native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import Toast from 'react-native-toast-message'
import * as Yup from 'yup'
import AppInput from 'shared/components/AppInput'
import AppText from 'shared/components/AppText/AppText'
import PrimaryButton from 'shared/components/PrimaryButton'
import NavRoutes from '../../../routes/NavRoutes'

import { COLORS } from 'shared/theme'
import { RF } from 'shared/theme/responsive'

import { useDispatch, useSelector } from 'react-redux'
import AnyIcon, { Icons } from 'shared/components/AnyIcon'
import { login } from 'shared/services/auth.services'
import {
  copyToClipboard,
  getNormalizedError
} from 'shared/services/helper.services'
import { RootState } from 'shared/store/configureStore'
import { setAccessToken } from 'shared/store/reducers/authReducer'
import { setUser } from 'shared/store/reducers/userReducer'
import { GenericNavigation } from 'shared/utils/models/types'
import LanguageSwitcher from 'shared/i18n/LanguageSwitcher'
import styles from './styles'

interface Props extends GenericNavigation {}

const Login = (props: Props) => {
  const { t } = useTranslation()
  const { fcmToken } = useSelector((state: RootState) => state.auth)
  const dispatch = useDispatch()

  const LoginSchema = Yup.object().shape({
    email: Yup.string()
      .trim()
      .email(t('auth.emailInvalid'))
      .required(t('auth.emailRequired')),
    password: Yup.string().required(t('auth.passwordRequired'))
  })

  const [secureEntry, setSecureEntry] = useState(true)
  const toggleEye = () => setSecureEntry(!secureEntry)

  const onPressForgotPassword = () =>
    props?.navigation?.navigate(NavRoutes.FORGOT_PASSWORD)

  const formik = useFormik({
    initialValues: {
      email: __DEV__ ? 'owner@riverdale.com' : '',
      password: __DEV__ ? 'Test@1234' : ''
    },
    validationSchema: LoginSchema,
    onSubmit: async values => {
      try {
        const loginRes = await login({
          email: values.email.trim().toLowerCase(),
          password: values.password
        })
        const token = loginRes?.data.data?.token
        const userData = loginRes?.data.data

        Toast.show({
          text1: t('auth.welcomeToastTitle'),
          text2: t('auth.welcomeToastMessage'),
          type: 'success'
        })

        dispatch(setAccessToken(token))
        dispatch(setUser(userData))
      } catch (e) {
        const error = getNormalizedError(e)
        Toast.show({
          text1: t('auth.signInFailedTitle'),
          text2: error || t('auth.signInFailedMessage'),
          type: 'error'
        })
      }
    }
  })

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primaryDark} />

      {/* ── Teal hero ─────────────────────────────────────────────── */}
      <SafeAreaView style={styles.hero}>
        <View style={styles.heroCircleLarge} />
        <View style={styles.heroCircleSmall} />
        <View style={styles.heroContent}>
          <View style={styles.logoBadge}>
            <Image
              source={ICONS.MAIN_LOGO}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          <AppText extraBold fontSize="h5" color="white" style={styles.brand}>
            {t('auth.brand')}
          </AppText>
          <AppText medium fontSize="caption" style={styles.tagline}>
            {t('auth.tagline')}
          </AppText>
        </View>
      </SafeAreaView>

      {/* ── Form sheet ────────────────────────────────────────────── */}
      <KeyboardAwareScrollView
        keyboardShouldPersistTaps="always"
        style={styles.sheet}
        contentContainerStyle={styles.sheetContent}
        showsVerticalScrollIndicator={false}
      >
        <AppText extraBold fontSize="h6" color="darkestGrey">
          {t('auth.welcomeBack')}
        </AppText>
        <AppText
          medium
          fontSize="subtitle"
          color="labelGrey"
          style={styles.subheading}
        >
          {t('auth.signInSubtitle')}
        </AppText>

        <AppInput
          value={formik.values.email}
          onChangeText={formik.handleChange('email')}
          onBlur={() => formik.setFieldTouched('email')}
          viewStyle={styles.inputView}
          inputStyle={styles.inputStyle}
          labelStyle={styles.inputLabel}
          label={t('auth.email')}
          placeholder={t('auth.emailPlaceholder')}
          icon="mail"
          iconColor={COLORS.primaryMain}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          error={formik.touched.email && formik.errors.email}
        />

        <AppInput
          value={formik.values.password}
          onChangeText={formik.handleChange('password')}
          onBlur={() => formik.setFieldTouched('password')}
          viewStyle={styles.inputView}
          inputStyle={styles.inputStyle}
          labelStyle={styles.inputLabel}
          label={t('auth.password')}
          placeholder={t('auth.passwordPlaceholder')}
          secureTextEntry={secureEntry}
          icon={secureEntry ? 'eye-off' : 'eye'}
          iconColor={COLORS.primaryMain}
          onPressIcon={toggleEye}
          error={formik.touched.password && formik.errors.password}
        />

        <TouchableOpacity
          onPress={onPressForgotPassword}
          style={styles.forgotPassword}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <AppText semiBold fontSize="caption" color="primaryMain">
            {t('auth.forgotPassword')}
          </AppText>
        </TouchableOpacity>

        <PrimaryButton
          title={t('auth.signIn')}
          loading={formik.isSubmitting}
          loaderColor={COLORS.white}
          buttonStyle={styles.buttonStyle}
          textStyle={styles.buttonText}
          onPress={() => formik.handleSubmit()}
        />

        <View style={styles.languageRow}>
          <LanguageSwitcher />
        </View>

        {__DEV__ && !!fcmToken && (
          <TouchableOpacity
            style={styles.fcmRow}
            onPress={() => copyToClipboard(fcmToken)}
          >
            <AppText fontSize="10" style={{ color: COLORS.BLACK_TRANS }}>
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
        )}
      </KeyboardAwareScrollView>
    </View>
  )
}

export default Login
