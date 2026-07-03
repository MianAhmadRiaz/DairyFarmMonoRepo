import moment from 'moment'
import React, { useEffect, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import AppText from 'shared/components/AppText/AppText'
import {
  fetchHerdAlerts,
  HerdAlertItem,
  HerdAlerts
} from 'shared/services/dashboard.services'
import { COLORS } from 'shared/theme'
import { RF } from 'shared/theme/responsive'
import EmptyState from '../EmptyState'
import GlassCard from '../GlassCard'
import TabLoader from '../TabLoader'

interface Props {
  refreshKey: number
}

const fmt = (d?: string) => (d ? moment(d).format('D MMM') : '—')

// Same sections as the web AlertsTab
const SECTIONS: {
  key: keyof HerdAlerts
  title: string
  icon: string
  color: string
  detail: (a: HerdAlertItem) => string
}[] = [
  {
    key: 'heatWatch',
    title: 'Heat Watch',
    icon: '🔥',
    color: COLORS.chartAmber,
    detail: a => a.reason || '—'
  },
  {
    key: 'pregnancyCheckDue',
    title: 'Pregnancy Checks Due',
    icon: '🤰',
    color: COLORS.chartBlue,
    detail: () => 'Inseminated 30+ days ago'
  },
  {
    key: 'dryOffDue',
    title: 'Dry-Off Due',
    icon: '🛑',
    color: COLORS.chartRed,
    detail: a => `Due: ${fmt(a.dryOffDueDate)}`
  },
  {
    key: 'calvingExpected',
    title: 'Calvings Expected (14 days)',
    icon: '🐄',
    color: COLORS.chartGreen,
    detail: a => `Expected: ${fmt(a.expectedCalvingDate)}`
  }
]

/**
 * Alerts & Tasks tab — mirrors the web AlertsTab: four grouped alert
 * sections with count chips.
 */
const AlertsTab = ({ refreshKey }: Props) => {
  const [alerts, setAlerts] = useState<HerdAlerts | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetchHerdAlerts()
      .then(setAlerts)
      .catch(() => setAlerts(null))
      .finally(() => setLoading(false))
  }, [refreshKey])

  if (loading) return <TabLoader />

  return (
    <>
      {SECTIONS.map(section => {
        const items = (alerts?.[section.key] as HerdAlertItem[]) ?? []
        return (
          <GlassCard
            key={String(section.key)}
            title={`${section.icon} ${section.title}`}
            right={
              <View style={[styles.countChip, { backgroundColor: section.color }]}>
                <AppText bold fontSize="caption" color="white">
                  {items.length}
                </AppText>
              </View>
            }
          >
            {items.length ? (
              items.map((a, idx) => (
                <View
                  key={a.uuid ?? idx}
                  style={[styles.row, idx > 0 && styles.rowBorder]}
                >
                  <AppText
                    semiBold
                    fontSize="caption"
                    color="darkestGrey"
                    numberOfLines={1}
                    style={{ flex: 1, marginRight: RF(8) }}
                  >
                    {a.name || a.tagName || 'Unnamed'}
                  </AppText>
                  <AppText fontSize="11" medium color="labelGrey" numberOfLines={1}>
                    {section.detail(a)}
                  </AppText>
                </View>
              ))
            ) : (
              <EmptyState title="Nothing here right now" icon="✅" />
            )}
          </GlassCard>
        )
      })}
    </>
  )
}

const styles = StyleSheet.create({
  countChip: {
    minWidth: RF(26),
    paddingHorizontal: RF(7),
    paddingVertical: RF(3),
    borderRadius: RF(12),
    alignItems: 'center'
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: RF(7)
  },
  rowBorder: {
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGrey
  }
})

export default AlertsTab
