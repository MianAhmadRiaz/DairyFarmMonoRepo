import React, { useCallback, useState } from 'react'
import { useFocusEffect } from '@react-navigation/native'
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native'
import Toast from 'react-native-toast-message'
import AppContainer from 'shared/components/AppContainer'
import AppHeader from 'shared/components/AppHeader'
import AppText from 'shared/components/AppText/AppText'
import { getProfitLoss } from 'shared/services/finance.services'
import { getNormalizedError } from 'shared/services/helper.services'
import usePermissions from 'shared/rbac/usePermissions'
import { PERMISSIONS } from 'shared/rbac/permissions'
import { COLORS } from 'shared/theme'
import { RF } from 'shared/theme/responsive'

const money = (v: any) => (v === undefined || v === null ? '0' : Number(v).toLocaleString())

const ProfitLoss = () => {
  const { can } = usePermissions()
  const canView = can(PERMISSIONS.FINANCE_VIEW)
  const [data, setData] = useState<any>(null)
  const [refreshing, setRefreshing] = useState(false)

  const load = useCallback(async () => {
    try {
      const res = await getProfitLoss()
      setData(res?.data?.data || null)
    } catch (e) {
      Toast.show({ type: 'error', text1: 'Error', text2: getNormalizedError(e) })
    } finally {
      setRefreshing(false)
    }
  }, [])

  useFocusEffect(useCallback(() => { if (canView) load() }, [load, canView]))

  const revenue: any[] = Array.isArray(data?.revenue) ? data.revenue : []
  const expenses: any[] = Array.isArray(data?.expenses) ? data.expenses : []

  const section = (title: string, rows: any[], total: any, totalColor: keyof typeof COLORS) => (
    <View style={styles.card}>
      <AppText fontSize="h7" semiBold style={{ marginBottom: RF(10) }}>
        {title}
      </AppText>
      {rows.length === 0 ? (
        <AppText fontSize="caption" color="descriptionColor">
          No records.
        </AppText>
      ) : (
        rows.map((r, i) => (
          <View key={i} style={styles.row}>
            <AppText fontSize="caption" color="labelGrey" numberOfLines={1} style={{ flex: 1, marginRight: RF(8) }}>
              {r.name || r.account_name || r.label || 'Account'}
            </AppText>
            <AppText fontSize="caption" medium color="grey">
              {money(r.amount)}
            </AppText>
          </View>
        ))
      )}
      <View style={[styles.row, styles.totalRow]}>
        <AppText fontSize="caption" semiBold color="darkestGrey">
          Total
        </AppText>
        <AppText fontSize="caption" semiBold color={totalColor}>
          {money(total)}
        </AppText>
      </View>
    </View>
  )

  if (!canView) {
    return (
      <AppContainer>
        <AppHeader title="Profit & Loss" showBack />
        <View style={styles.center}>
          <AppText color="error">You do not have permission to view finance.</AppText>
        </View>
      </AppContainer>
    )
  }

  return (
    <AppContainer>
      <AppHeader title="Profit & Loss" showBack />
      <ScrollView
        contentContainerStyle={{ padding: RF(16), paddingBottom: RF(40) }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load() }} colors={[COLORS.primaryMain]} />}
      >
        {!data ? (
          <AppText color="descriptionColor" style={{ textAlign: 'center', marginTop: RF(40) }}>
            No profit & loss data available.
          </AppText>
        ) : (
          <>
            {section('Revenue', revenue, data.totalRevenue, 'success')}
            {section('Expenses', expenses, data.totalExpense, 'error')}
            <View style={styles.netCard}>
              <AppText fontSize="h7" semiBold color="white">
                Net Profit
              </AppText>
              <AppText fontSize="h6" bold color="white">
                {money(data.netProfit)}
              </AppText>
            </View>
          </>
        )}
      </ScrollView>
    </AppContainer>
  )
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: RF(16) },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: RF(12),
    padding: RF(14),
    marginBottom: RF(14),
    shadowColor: COLORS.cardGrey,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 2
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: RF(4) },
  totalRow: { borderTopWidth: 1, borderTopColor: COLORS.primaryLightest, marginTop: RF(8), paddingTop: RF(8) },
  netCard: {
    backgroundColor: COLORS.primaryMain,
    borderRadius: RF(12),
    padding: RF(16),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  }
})

export default ProfitLoss
