import React from 'react'
import { StyleSheet, View } from 'react-native'
import AppText from 'shared/components/AppText/AppText'
import { COLORS, THEME } from 'shared/theme'
import { RF, WP } from 'shared/theme/responsive'

interface Props {
  label: string
  value: string | number
  sublabel?: string
  icon: string // emoji, matching the web dashboard's StatTiles
  tint?: string
  loading?: boolean
}

/**
 * KPI tile matching the web app's StatTile: emoji icon in a tinted rounded
 * square, big bold value, small label + optional sublabel. Laid out 2-up.
 */
const StatTile = ({ label, value, sublabel, icon, tint, loading }: Props) => (
  <View style={styles.tile}>
    <View
      style={[styles.iconBadge, { backgroundColor: tint ?? COLORS.tileTint }]}
    >
      <AppText fontSize="h6" style={{ lineHeight: RF(24) }}>
        {icon}
      </AppText>
    </View>
    <View style={styles.info}>
      <AppText
        extraBold
        fontSize="h6"
        color="darkestGrey"
        numberOfLines={1}
        adjustsFontSizeToFit
      >
        {loading ? '—' : value}
      </AppText>
      <AppText fontSize="11" medium color="labelGrey" numberOfLines={1}>
        {label}
      </AppText>
      {!!sublabel && !loading && (
        <AppText fontSize="10" medium color="descriptionColor" numberOfLines={1}>
          {sublabel}
        </AppText>
      )}
    </View>
  </View>
)

const styles = StyleSheet.create({
  tile: {
    width: WP(44),
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: THEME.RADIUS.CARD,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    paddingVertical: RF(12),
    paddingHorizontal: RF(10),
    marginTop: RF(10),
    ...THEME.CARD_SHADOW
  },
  iconBadge: {
    width: RF(40),
    height: RF(40),
    borderRadius: RF(12),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: RF(10)
  },
  info: { flex: 1 }
})

export default StatTile
