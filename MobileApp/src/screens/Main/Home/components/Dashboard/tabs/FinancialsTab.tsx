import React, { useEffect, useState } from 'react'
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
      title="Cull / Keep Signal"
      subtitle={
        data?.isEstimate
          ? `Bottom performers • estimate${data?.estimateNotes ? ` — ${data.estimateNotes}` : ''}`
          : 'Bottom performers'
      }
    >
      {!data?.hasFeedData && (
        <AppText
          fontSize="11"
          medium
          color="labelGrey"
          style={{ fontStyle: 'italic', marginBottom: RF(8) }}
        >
          Feed cost per litre isn't shown — no feeding schedule data has been
          logged yet for this farm.
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
                    Milk
                  </AppText>
                  <AppText semiBold fontSize="caption" color="darkestGrey">
                    {fmtNum(p.totalMilk, ' L')}
                  </AppText>
                </View>
                <View style={styles.metric}>
                  <AppText fontSize="10" medium color="labelGrey">
                    Cost of Care
                  </AppText>
                  <AppText semiBold fontSize="caption" color="darkestGrey">
                    {fmtMoney(p.realCostOfCare)}
                  </AppText>
                </View>
                <View style={styles.metric}>
                  <AppText fontSize="10" medium color="labelGrey">
                    Milk Income
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
        <EmptyState title="Not enough data to estimate profitability yet" icon="📊" />
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
