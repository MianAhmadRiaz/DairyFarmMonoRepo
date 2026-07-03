import { StyleSheet } from 'react-native'
import { RF } from 'shared/theme/responsive'
import { COLORS, THEME } from '../../../shared/theme'

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.primaryMain
  },

  // ── Hero ────────────────────────────────────────────────────────
  hero: {
    flex: 0.42,
    backgroundColor: COLORS.primaryMain,
    overflow: 'hidden'
  },
  heroContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  heroCircleLarge: {
    position: 'absolute',
    top: -RF(70),
    right: -RF(70),
    width: RF(220),
    height: RF(220),
    borderRadius: RF(110),
    backgroundColor: 'rgba(255,255,255,0.08)'
  },
  heroCircleSmall: {
    position: 'absolute',
    bottom: RF(20),
    left: -RF(40),
    width: RF(120),
    height: RF(120),
    borderRadius: RF(60),
    backgroundColor: 'rgba(255,255,255,0.06)'
  },
  logoBadge: {
    width: RF(96),
    height: RF(96),
    borderRadius: RF(28),
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...THEME.CARD_SHADOW,
    shadowOpacity: 0.25
  },
  logo: {
    width: RF(72),
    height: RF(72)
  },
  brand: {
    marginTop: RF(14),
    letterSpacing: 0.5
  },
  tagline: {
    color: 'rgba(255,255,255,0.85)',
    marginTop: RF(4)
  },

  // ── Form sheet ──────────────────────────────────────────────────
  sheet: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: RF(28),
    borderTopRightRadius: RF(28),
    marginTop: -RF(24)
  },
  sheetContent: {
    paddingHorizontal: THEME.PADDING.HIGH,
    paddingTop: THEME.PADDING.VERYHIGH,
    paddingBottom: THEME.PADDING.SUPERHIGH
  },
  subheading: {
    marginTop: RF(4),
    marginBottom: THEME.MARGIN.HIGH
  },
  inputView: {
    marginBottom: THEME.MARGIN.LOW
  },
  inputStyle: {
    width: '100%',
    backgroundColor: COLORS.lightestGrey,
    borderColor: COLORS.cardBorder,
    borderRadius: RF(14)
  },
  inputLabel: {
    marginLeft: RF(4),
    color: COLORS.textLight
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: THEME.MARGIN.HIGH
  },
  buttonStyle: {
    width: '100%',
    backgroundColor: COLORS.primaryMain,
    borderColor: COLORS.primaryMain,
    borderRadius: RF(14),
    ...THEME.CARD_SHADOW,
    shadowColor: COLORS.primaryMain,
    shadowOpacity: 0.35
  },
  buttonText: {
    color: COLORS.white,
    fontFamily: THEME.FONTS.TYPE.BOLD
  },
  fcmRow: {
    marginTop: RF(40)
  }
})

export default styles
