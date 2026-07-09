import { useNavigation, useFocusEffect } from '@react-navigation/native'
import React, { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { RefreshControl, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native'
import Toast from 'react-native-toast-message'
import AppContainer from 'shared/components/AppContainer'
import AppHeader from 'shared/components/AppHeader'
import AppText from 'shared/components/AppText/AppText'
import AnyIcon, { Icons } from 'shared/components/AnyIcon'
import { getFinanceDashboard } from 'shared/services/finance.services'
import { getNormalizedError } from 'shared/services/helper.services'
import usePermissions from 'shared/rbac/usePermissions'
import { PERMISSIONS, PermissionName } from 'shared/rbac/permissions'
import { COLORS } from 'shared/theme'
import { RF } from 'shared/theme/responsive'

type Action = {
  label: string
  desc: string
  screen: string
  icon: { type: any; name: string }
  permission: PermissionName
}

const FinanceHome = () => {
  const { t } = useTranslation()
  const navigation = useNavigation<any>()
  const { can } = usePermissions()
  const [summary, setSummary] = useState<any>(null)
  const [refreshing, setRefreshing] = useState(false)

  const ACTIONS: Action[] = useMemo(() => [
    { label: t('finance.financeHome.transactions'), desc: t('finance.financeHome.transactionsDesc'), screen: 'Transactions', icon: { type: Icons.MaterialCommunityIcons, name: 'swap-horizontal' }, permission: PERMISSIONS.FINANCE_VIEW },
    { label: t('finance.financeHome.profitLoss'), desc: t('finance.financeHome.profitLossDesc'), screen: 'ProfitLoss', icon: { type: Icons.MaterialCommunityIcons, name: 'chart-line' }, permission: PERMISSIONS.FINANCE_VIEW }
  ], [t])

  const load = useCallback(async () => {
    try {
      const res = await getFinanceDashboard()
      setSummary(res?.data?.data?.summary || res?.data?.data)
    } catch (e) {
      Toast.show({ type: 'error', text1: t('finance.common.error'), text2: getNormalizedError(e) })
    } finally {
      setRefreshing(false)
    }
  }, [])

  useFocusEffect(useCallback(() => { load() }, [load]))

  const visible = ACTIONS.filter(a => can(a.permission))

  const money = (v: any) => (v === undefined || v === null ? 0 : Number(v).toLocaleString())

  const stat = (label: string, value: any, color: keyof typeof COLORS = 'primaryMain') => (
    <View style={styles.statCard}>
      <AppText fontSize="h6" bold color={color}>
        {value}
      </AppText>
      <AppText fontSize="caption" color="descriptionColor" style={{ marginTop: RF(2) }}>
        {label}
      </AppText>
    </View>
  )

  if (!can(PERMISSIONS.FINANCE_VIEW)) {
    return (
      <AppContainer>
        <AppHeader title={t('finance.financeHome.title')} showHam onPressHam={() => navigation.openDrawer?.()} />
        <View style={styles.center}>
          <AppText color="error">{t('finance.common.noPermission')}</AppText>
        </View>
      </AppContainer>
    )
  }

  return (
    <AppContainer>
      <AppHeader title={t('finance.financeHome.title')} showHam onPressHam={() => navigation.openDrawer?.()} />
      <ScrollView
        contentContainerStyle={{ padding: RF(16), paddingBottom: RF(40) }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load() }} colors={[COLORS.primaryMain]} />}
      >
        <View style={styles.statsRow}>
          {stat(t('finance.common.income'), money(summary?.totalIncome), 'success')}
          {stat(t('finance.common.expenses'), money(summary?.totalExpense), 'error')}
        </View>
        <View style={styles.statsRow}>
          {stat(t('finance.common.netProfit'), money(summary?.netProfit), 'primaryMain')}
          {stat(t('finance.financeHome.cash'), money(summary?.cashOnHand), 'primaryDark')}
        </View>

        <AppText fontSize="h7" semiBold style={{ marginBottom: RF(12), marginTop: RF(8) }}>
          {t('finance.financeHome.actions')}
        </AppText>
        {visible.map((a, i) => (
          <TouchableOpacity key={i} style={styles.actionCard} onPress={() => navigation.navigate(a.screen)} activeOpacity={0.85}>
            <View style={styles.iconCircle}>
              <AnyIcon disabled type={a.icon.type} name={a.icon.name} size={RF(22)} color={COLORS.primaryMain} />
            </View>
            <View style={{ flex: 1 }}>
              <AppText fontSize="h7" semiBold>
                {a.label}
              </AppText>
              <AppText fontSize="caption" color="descriptionColor">
                {a.desc}
              </AppText>
            </View>
            <AnyIcon disabled type={Icons.Feather} name="chevron-right" size={RF(20)} color={COLORS.labelGrey} />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </AppContainer>
  )
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: RF(16) },
  statsRow: { flexDirection: 'row', gap: RF(10), marginBottom: RF(10) },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: RF(12),
    padding: RF(14),
    alignItems: 'center',
    elevation: 2,
    shadowColor: COLORS.cardGrey,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: RF(12),
    padding: RF(14),
    marginBottom: RF(12),
    elevation: 2,
    shadowColor: COLORS.cardGrey,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4
  },
  iconCircle: {
    width: RF(40),
    height: RF(40),
    borderRadius: RF(20),
    backgroundColor: COLORS.primaryLightest,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: RF(12)
  }
})

export default FinanceHome
