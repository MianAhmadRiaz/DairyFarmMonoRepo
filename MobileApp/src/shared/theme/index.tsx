import { RF } from './responsive'

// Palette aligned with the CattleCare web app (src/shared/theme/theme.jsx):
// 
// primary, green #4cceac accent, mint-white #F4F8F7 canvas.
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
  primaryLightest: '#EBF6F8',
  primaryLight: '#CFE7EC',
  primaryMain: '#0F7C8F',
  orange: '#E2A23B',
  primaryDark: '#0A5768',
  textLight: '#4B465C',

  secondaryLightest: '#E4F8F2',
  secondaryLight: '#A9E8D6',
  secondaryMain: '#4CCEAC',
  secondaryDark: '#2E7C67',
  lightestGrey: '#F8F9FA',
  lightGrey: '#F3F4F6',
  grey: '#384250',
  lightSilver: '#D2D6DB',
  mediumGrey: '#CECECE',
  darkGrey: '#1C2536',
  darkestGrey: '#111927',
  placeholder: '#94A3B8',
  cardGrey: 'rgba(17, 25, 39, 0.08)',
  descriptionColor: '#6C737F',
  erieBlack: '#1A1A1A',
  labelColor: '#14181E',

  // Background helpers (referenced by PrimaryButton, biometry, etc.)
  primaryLightBackground: '#0F7C8F',
  primaryDarkBackground: '#0A5768',
  secondaryLightBackground: '#4CCEAC',
  secondaryDarkBackground: '#2E7C67',
  biometryCircleButtonColor: '#0F7C8F',

  // Chart / status accents (mirroring the web dashboard)
  chartGreen: '#4CCEAC',
  chartBlue: '#6870FA',
  chartRed: '#DB4F4A',
  chartAmber: '#E2A23B',
  trendUp: '#3DA58A',
  trendDown: '#DB4F4A',

  // Surfaces
  cardBorder: 'rgba(15, 124, 143, 0.14)',
  cardShadow: 'rgba(10, 87, 104, 0.16)',
  tileTint: 'rgba(15, 124, 143, 0.08)',

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
    CARD: RF(16),
    OVAL: RF(24),
    OVALBOX: RF(20)
  },
  // Shared soft shadow for cards (glass-card look from the web app)
  CARD_SHADOW: {
    shadowColor: '#0A5768',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3
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
