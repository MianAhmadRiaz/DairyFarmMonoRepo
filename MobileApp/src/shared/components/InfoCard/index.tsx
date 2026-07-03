import React, { ReactNode } from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'
import AppText from 'shared/components/AppText/AppText'
import AnyIcon, { Icons } from 'shared/components/AnyIcon'
import { COLORS } from 'shared/theme'
import { RF } from 'shared/theme/responsive'

export interface CardRow {
  label: string
  value: string | number | undefined | null
}

interface Props {
  title: string
  subtitle?: string
  rows?: CardRow[]
  badge?: { text: string; color?: keyof typeof COLORS }
  leftIcon?: { type: any; name: string }
  onPress?: () => void
  right?: ReactNode
}

// Generic themed card used for list rows across every module.
const InfoCard = ({ title, subtitle, rows = [], badge, leftIcon, onPress, right }: Props) => {
  const Wrapper: any = onPress ? TouchableOpacity : View
  return (
    <Wrapper style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.headerRow}>
        <View style={styles.titleWrap}>
          {leftIcon ? (
            <View style={styles.iconCircle}>
              <AnyIcon disabled type={leftIcon.type} name={leftIcon.name} size={RF(18)} color={COLORS.primaryMain} />
            </View>
          ) : null}
          <View style={{ flex: 1 }}>
            <AppText fontSize="h7" semiBold color="darkestGrey" numberOfLines={1}>
              {title}
            </AppText>
            {subtitle ? (
              <AppText fontSize="caption" color="descriptionColor" numberOfLines={1}>
                {subtitle}
              </AppText>
            ) : null}
          </View>
        </View>
        {badge ? (
          <View style={[styles.badge, { backgroundColor: (COLORS[badge.color || 'primaryLightest']) }]}>
            <AppText fontSize="11" medium color="primaryDark">
              {badge.text}
            </AppText>
          </View>
        ) : right ? (
          right
        ) : onPress ? (
          <AnyIcon disabled type={Icons.Feather} name="chevron-right" size={RF(20)} color={COLORS.labelGrey} />
        ) : null}
      </View>

      {rows.filter(r => r.value !== undefined && r.value !== null && r.value !== '').length > 0 ? (
        <View style={styles.rowsWrap}>
          {rows
            .filter(r => r.value !== undefined && r.value !== null && r.value !== '')
            .map((r, i) => (
              <View key={i} style={styles.row}>
                <AppText fontSize="caption" color="labelGrey">
                  {r.label}
                </AppText>
                <AppText fontSize="caption" medium color="grey">
                  {String(r.value)}
                </AppText>
              </View>
            ))}
        </View>
      ) : null}
    </Wrapper>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: RF(12),
    padding: RF(14),
    marginBottom: RF(12),
    shadowColor: COLORS.cardGrey,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 2
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  titleWrap: { flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: RF(8) },
  iconCircle: {
    width: RF(34),
    height: RF(34),
    borderRadius: RF(17),
    backgroundColor: COLORS.primaryLightest,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: RF(10)
  },
  badge: { paddingHorizontal: RF(8), paddingVertical: RF(3), borderRadius: RF(10) },
  rowsWrap: { marginTop: RF(10), borderTopWidth: 1, borderTopColor: COLORS.primaryLightest, paddingTop: RF(8) },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: RF(3) }
})

export default InfoCard
