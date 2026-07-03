import { RF } from './responsive'
export const COLORS = {
  //App Colors
  white: '#FFFFFF',
  background: '#F4F8F7',
  success: '#15B79E',
  error: '#F04438',
  warning: '#F79009',
  purple: '#9E77ED',
  indigo: '#6366F1',
  blue: '#2970FF',
  primaryLightest: '#EBF7F8',
  primaryLight: '#D4ECEE',
  primaryMain: '#236476',
  orange:"",
  primaryDark: '#173142',
  textLight: '#4B465C',

  secondaryLightest: '#E9F4D1',
  secondaryLight: '#C8E3A3',
  secondaryMain: '#7DAD3F',
  secondaryDark: '#4A6C2F',
  lightestGrey: '##F8F9FA',
  lightGrey: '##F3F4F6',
  grey: '#384250',
  lightSilver: '#D2D6DB',
  mediumGrey: '#CECECE',
  darkGrey: '#1C2536',
  darkestGrey: '#111927',
  placeholder: '#808080',
  cardGrey: 'rgba(17, 25, 39, 0.08)',
  descriptionColor: '#6C737F',
  erieBlack: '#1A1A1A',
  labelColor: '#14181E',
  //App Colors start here,

  WHITE_TRANS: 'rgba(255,255,255,0.3)',
  errorFade: 'rgba(255,127,127,0.3)',
  BLACK_TRANS: 'rgba(0,0,0,0.3)',
  labelGrey: '#667085'
}
export const FONT_FAMILY = {
  PlusJakartaSans: 'PlusJakartaSans'
}

export const THEME = {
  FONTS: {
    SIZE: {
      h1: 56,
      h2: 48,
      h3: 36,
      h4: 32,
      h5: 24,
      h6: 18,
      h7: 16,
      subtitle: 14,
      caption: 12,
      '11': 11,
      '10': 10,
    },
    TYPE: {
      BOLD: 'PlusJakartaSans-Bold',
      EXTRABOLD: 'PlusJakartaSans-ExtraBold',
      REGULAR: 'PlusJakartaSans-Regular',
      SEMIBOLD: 'PlusJakartaSans-SemiBold',
      LIGHT: 'PlusJakartaSans-Light',
      EXTRALIGHT: 'PlusJakartaSans-ExtraLight',
      MEDIUM: 'PlusJakartaSans-Medium'
    }
  },
  MARGIN: {
    SUPERLOW: RF(2),
    VERYLOW: RF(4),
    LOW: RF(8),
    MID_LOW: RF(12),
    NORMAL: RF(16),
    HIGH: RF(24),
    VERYHIGH: RF(32),
    SUPERHIGH: RF(48),
    NOVAHIGH: RF(60),
    HYPERHIGH: RF(70)
  },
  PADDING: {
    SUPERLOW: RF(2),
    VERYLOW: RF(4),
    LOW: RF(8),
    MID_LOW: RF(12),
    NORMAL: RF(16),
    HIGH: RF(24),
    VERYHIGH: RF(32),
    SUPERHIGH: RF(48),
    NOVAHIGH: RF(60),
    HYPERHIGH: RF(70)
  },
  RADIUS: {
    BOX: RF(10),
    SMALLBOX: RF(5),
    OVAL: RF(24),
    OVALBOX: RF(20)
  }
}

export const backgroundColorProperty = () => {
  // const {darkMode} = store.getState().settings;
  const darkMode = false
  if (darkMode) {
    return {
      backgroundColor: COLORS.primaryDarkBackground
    }
  } else {
    return {
      backgroundColor: COLORS.primaryLightBackground
    }
  }
}

export const secondaryBackgroundColorProperty = () => {
  // const {darkMode} = store.getState().settings;
  const darkMode = false
  if (darkMode) {
    return {
      backgroundColor: COLORS.secondaryDarkBackground
    }
  } else {
    return {
      backgroundColor: COLORS.secondaryLightBackground
    }
  }
}

export const biometryCircleButtonProperty = () => {
  // const {darkMode} = store.getState().settings;
  const darkMode = false
  if (darkMode) {
    return {
      backgroundColor: COLORS.biometryCircleButtonColor,
      color: COLORS.white
    }
  } else {
    return {
      backgroundColor: COLORS.secondaryLightBackground,
      color: COLORS.white
    }
  }
}

export const pinCodeTitlesColor = () => {
  // const {darkMode} = store.getState().settings;
  const darkMode = false
  if (darkMode) {
    return COLORS.white
  } else {
    return COLORS.biometryCircleButtonColor
  }
}

export const fontColorProperty = () => {
  // const {darkMode} = store.getState().settings;
  const darkMode = false

  if (darkMode) {
    return { color: COLORS.white }
  } else {
    return { color: COLORS.white }
  }
}

export const fontColor = () => {
  // const {darkMode} = store.getState().settings;
  const darkMode = false
  if (darkMode) {
    return COLORS.white
  } else {
    return COLORS.white
  }
}
