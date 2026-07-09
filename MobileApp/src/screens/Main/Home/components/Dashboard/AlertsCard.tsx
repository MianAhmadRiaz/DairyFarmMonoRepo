import { useNavigation } from '@react-navigation/native'
import moment from 'moment'
import React from 'react'
import { useTranslation } from 'react-i18next'
import type { TFunction } from 'i18next'
import { StyleSheet, TouchableOpacity, View } from 'react-native'
import AppText from 'shared/components/AppText/AppText'
import { COLORS } from 'shared/theme'
import { RF } from 'shared/theme/responsive'
import { HerdAlertItem, HerdAlerts } from 'shared/services/dashboard.services'
import GlassCard from './GlassCard'

interface Props {
  alerts: HerdAlerts
}

interface FlatAlert {
  icon: string
  type: string
  color: string
  name: string
  detail?: string
}

const fmt = (d?: string) => (d ? moment(d).format('D MMM') : undefined)

const flatten = (alerts: HerdAlerts, t: TFunction): FlatAlert[] => {
  const name = (a: HerdAlertItem) =>
    a.name || a.tagName || t('main.dashboard.alertsCard.unknown')
  const groups: FlatAlert[][] = [
    (alerts.heatWatch ?? []).map(a => ({
      icon: '🔥',
      type: t('main.dashboard.common.heatWatch'),
      color: COLORS.chartRed,
      name: name(a),
      detail: a.reason
    })),
    (alerts.pregnancyCheckDue ?? []).map(a => ({
      icon: '🩺',
      type: t('main.dashboard.alertsCard.pregnancyCheck'),
      color: COLORS.chartBlue,
      name: name(a),
      detail: a.reason
    })),
    (alerts.dryOffDue ?? []).map(a => ({
      icon: '🌾',
      type: t('main.dashboard.common.dryOffDue'),
      color: COLORS.chartAmber,
      name: name(a),
      detail: fmt(a.dryOffDueDate)
    })),
    (alerts.calvingExpected ?? []).map(a => ({
      icon: '🐮',
      type: t('main.dashboard.alertsCard.calvingExpected'),
      color: COLORS.trendUp,
      name: name(a),
      detail: fmt(a.expectedCalvingDate)
    }))
  ]
  // Interleave groups so one busy category doesn't crowd out the others
  const out: FlatAlert[] = []
  for (let i = 0; out.length < 5; i++) {
    const before = out.length
    groups.forEach(g => {
      if (g[i] && out.length < 5) out.push(g[i])
    })
    if (out.length === before) break
  }
  return out
}

/**
 * "Today's Alerts" — mirrors the web Overview tab's alerts panel.
 */
const AlertsCard = ({ alerts }: Props) => {
  const { t } = useTranslation()
  const navigation = useNavigation<any>()
  const items = flatten(alerts, t)
  const total =
    (alerts.heatWatch?.length ?? 0) +
    (alerts.pregnancyCheckDue?.length ?? 0) +
    (alerts.dryOffDue?.length ?? 0) +
    (alerts.calvingExpected?.length ?? 0)

  const viewAll = () =>
    navigation.navigate('HealthStack', { screen: 'HerdAlerts' })

  return (
    <GlassCard
      title={t('main.dashboard.alertsCard.title')}
      subtitle={
        total
          ? t('main.dashboard.alertsCard.needAttention', { count: total })
          : undefined
      }
      right={
        total > 0 ? (
          <TouchableOpacity onPress={viewAll} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <AppText semiBold fontSize="caption" color="primaryMain">
              {t('main.dashboard.alertsCard.viewAll')}
            </AppText>
          </TouchableOpacity>
        ) : undefined
      }
    >
      {items.length === 0 ? (
        <View style={styles.empty}>
          <AppText fontSize="h5">✅</AppText>
          <AppText medium color="labelGrey" style={{ marginTop: RF(6) }}>
            {t('main.dashboard.alertsCard.allClear')}
          </AppText>
        </View>
      ) : (
        items.map((a, i) => (
          <View
            key={`${a.type}-${a.name}-${i}`}
            style={[styles.row, i > 0 && styles.rowBorder]}
          >
            <View style={[styles.badge, { backgroundColor: `${a.color}1A` }]}>
              <AppText fontSize="subtitle">{a.icon}</AppText>
            </View>
            <View style={{ flex: 1, marginLeft: RF(10) }}>
              <AppText semiBold fontSize="subtitle" color="darkestGrey" numberOfLines={1}>
                {a.name}
              </AppText>
              <AppText fontSize="11" medium color="labelGrey" numberOfLines={1}>
                {a.type}
                {a.detail ? ` • ${a.detail}` : ''}
              </AppText>
            </View>
            <View style={[styles.typeDot, { backgroundColor: a.color }]} />
          </View>
        ))
      )}
    </GlassCard>
  )
}

const styles = StyleSheet.create({
  empty: { paddingVertical: RF(20), alignItems: 'center' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: RF(8)
  },
  rowBorder: {
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGrey
  },
  badge: {
    width: RF(34),
    height: RF(34),
    borderRadius: RF(10),
    alignItems: 'center',
    justifyContent: 'center'
  },
  typeDot: {
    width: RF(8),
    height: RF(8),
    borderRadius: RF(4),
    marginLeft: RF(8)
  }
})

export default AlertsCard
