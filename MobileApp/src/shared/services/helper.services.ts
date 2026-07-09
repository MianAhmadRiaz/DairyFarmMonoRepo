import Clipboard from '@react-native-clipboard/clipboard'
import { Linking } from 'react-native'
import ImagePicker from 'react-native-image-crop-picker'

import Toast from 'react-native-toast-message'
import i18n from 'shared/i18n'

export const showToast = (
  type: 'success' | 'error',
  message: string,
  title: string
) => {
  Toast.show({
    type: type,
    text1: title,
    text2: message
  })
}
export const handleNotification = (
  type: 'success' | 'error',
  context: string,
  message?: string
) => {
  let title = ''
  let defaultMessage = ''

  switch (context) {
    case 'validation_name':
      title = i18n.t('services.toast.validationTitle')
      defaultMessage = i18n.t('services.validation.nameRequired')
      break
    case 'validation_email':
      title = i18n.t('services.toast.validationTitle')
      defaultMessage = i18n.t('services.validation.emailRequired')
      break
    case 'validation_password':
      title = i18n.t('services.toast.validationTitle')
      defaultMessage = i18n.t('services.validation.passwordRequired')
      break
    case 'validation_confirmPassword':
      title = i18n.t('services.toast.validationTitle')
      defaultMessage = i18n.t('services.validation.passwordsMismatch')
      break
    case 'registration_success':
      title = i18n.t('services.toast.successTitle')
      defaultMessage = i18n.t('services.registration.success')
      break
    case 'registration_error':
      title = i18n.t('services.toast.errorTitle')
      defaultMessage = i18n.t('services.registration.error')
      break
    default:
      title =
        type === 'success'
          ? i18n.t('services.toast.successTitle')
          : i18n.t('services.toast.errorTitle')
      defaultMessage = i18n.t('services.toast.unexpectedError')
      break
  }

  Toast.show({
    type: type,
    text1: title,
    text2: message || defaultMessage,
    position: 'top',
    visibilityTime: 4000,
    autoHide: true
  })
}
export const capitalizeFirstWord = (str?: string) => {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

export const openExternalLink = async (link: string) => {
  try {
    const supported = await Linking.canOpenURL(link)
    if (supported) {
      await Linking.openURL(link)
    }
  } catch (error) {
    console.log(error)
  }
}

export const getNormalizedError = (err: any) => {
  return err?.response?.data?.message || i18n.t('services.error.requestFailed')
}

export const handleImageSelection = () => {
  return new Promise((resolve: any, reject: any) => {
    try {
      ImagePicker?.openPicker({
        mediaType: 'photo',
        width: 500,
        height: 500,
        cropping: true,
        includeBase64: true
      })
        .then(image => {
          resolve(image)
        })
        .catch(err => {
          reject(err)
        })
    } catch (err) {
      console.log('--camera error--', err)
    }
  })
}

export const copyToClipboard = (string: string | undefined) => {
  Clipboard.setString(String(string))
  showToast('success', '', i18n.t('services.toast.copiedSuccess'))
}
