import Clipboard from '@react-native-clipboard/clipboard'
import { Linking } from 'react-native'
import ImagePicker from 'react-native-image-crop-picker'

import Toast from 'react-native-toast-message'

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
      title = 'Validation Error'
      defaultMessage = 'Name is required'
      break
    case 'validation_email':
      title = 'Validation Error'
      defaultMessage = 'Email is required'
      break
    case 'validation_password':
      title = 'Validation Error'
      defaultMessage = 'Password is required'
      break
    case 'validation_confirmPassword':
      title = 'Validation Error'
      defaultMessage = 'Passwords do not match'
      break
    case 'registration_success':
      title = 'Success'
      defaultMessage = 'Your account was registered successfully!'
      break
    case 'registration_error':
      title = 'Error'
      defaultMessage = 'Error creating account'
      break
    default:
      title = type === 'success' ? 'Success' : 'Error'
      defaultMessage = 'An unexpected error occurred'
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
export const capitalizeFirstWord = (str: string) => {
  return str?.charAt(0).toUpperCase() + str?.slice(1).toLowerCase()
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
  return err?.response?.data?.message || 'Request Failed!'
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
  showToast('success', '', 'Copied Successfully')
}
