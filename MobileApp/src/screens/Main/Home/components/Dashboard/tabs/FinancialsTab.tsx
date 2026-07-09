import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, View } from 'react-native'
import AppText from 'shared/components/AppText/AppText'
import {
  fetchFinancialsEstimate,
  FinancialsEstimate
} from 'shared/services/dashboard.services'
import { COLORS } from 'shared/theme'
import { RF } from 'shared/theme/responsive'
import EmptyState from '../EmptyState'
import GlassCard from '../GlassCard'
import TabLoader from '../TabLoader'
import { fmtMoney, fmtNum } from '../utils'

interface Props {
  refreshKey: number
}

/**
 * Financials tab — mirrors the web FinancialsTab: cull/keep signal with
 * bottom-performer animals (web table adapted to mobile cards).
 */
const FinancialsTab = ({ refreshKey }: Props) => {
  const { t } = useTranslation()
  const [data, setData] = useState<FinancialsEstimate | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetchFinancialsEstimate()
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false))
  }, [refreshKey])

  if (loading) return <TabLoader />

  const performers = data?.bottomPerformers ?? []

  return (
    <GlassCard
      title={t('main.dashboard.financialsTab.title')}
      subtitle={
        data?.isEstimate
          ? `${t('main.dashboard.financialsTab.subtitleEstimate')}${
              data?.estimateNotes ? ` — ${data.estimateNotes}` : ''
            }`
          : t('main.dashboard.financialsTab.subtitle')
      }
    >
      {!data?.hasFeedData && (
        <AppText
          fontSize="11"
          medium
          color="labelGrey"
          style={{ fontStyle: 'italic', marginBottom: RF(8) }}
        >
          {t('main.dashboard.financialsTab.noFeedData')}
        </AppText>
      )}
      {performers.length ? (
        performers.map((p, i) => {
          const negative = p.estimatedNetProfit < 0
          return (
            <View key={p.uuid ?? i} style={[styles.card, i > 0 && { marginTop: RF(8) }]}>
              <View style={styles.cardHeader}>
                <AppText semiBold fontSize="subtitle" color="darkestGrey" numberOfLines={1}>
                  {p.name || p.tagName || '—'}
                </AppText>
                <AppText
                  extraBold
                  fontSize="subtitle"
                  style={{ color: negative ? COLORS.trendDown : COLORS.trendUp }}
                >
                  {fmtMoney(p.estimatedNetProfit)}
                </AppText>
              </View>
              <View style={styles.metricsRow}>
                <View style={styles.metric}>
                  <AppText fontSize="10" medium color="labelGrey">
                    {t('main.dashboard.financialsTab.milk')}
                  </AppText>
                  <AppText semiBold fontSize="caption" color="darkestGrey">
                    {fmtNum(p.totalMilk, ' L')}
                  </AppText>
                </View>
                <View style={styles.metric}>
                  <AppText fontSize="10" medium color="labelGrey">
                    {t('main.dashboard.financialsTab.costOfCare')}
                  </AppText>
                  <AppText semiBold fontSize="caption" color="darkestGrey">
                    {fmtMoney(p.realCostOfCare)}
                  </AppText>
                </View>
                <View style={styles.metric}>
                  <AppText fontSize="10" medium color="labelGrey">
                    {t('main.dashboard.financialsTab.milkIncome')}
                  </AppText>
                  <AppText semiBold fontSize="caption" color="darkestGrey">
                    {fmtMoney(p.estimatedMilkIncome)}
                  </AppText>
                </View>
              </View>
            </View>
          )
        })
      ) : (
        <EmptyState title={t('main.dashboard.financialsTab.empty')} icon="📊" />
      )}
    </GlassCard>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.lightestGrey,
    borderRadius: RF(12),
    padding: RF(10),
    borderWidth: 1,
    borderColor: COLORS.lightGrey
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: RF(6)
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  metric: { flex: 1 }
})

export default FinancialsTab
