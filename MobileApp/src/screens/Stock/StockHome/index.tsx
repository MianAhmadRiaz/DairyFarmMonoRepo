import { useNavigation, useFocusEffect } from '@react-navigation/native'
import React, { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { RefreshControl, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native'
import AppContainer from 'shared/components/AppContainer'
import AppHeader from 'shared/components/AppHeader'
import AppText from 'shared/components/AppText/AppText'
import AnyIcon, { Icons } from 'shared/components/AnyIcon'
import { getStockItems, getStockAlerts, getExpiryReport } from 'shared/services/stock.services'
import usePermissions from 'shared/rbac/usePermissions'
import { PERMISSIONS, PermissionName } from 'shared/rbac/permissions'
import { COLORS } from 'shared/theme'
import { RF } from 'shared/theme/responsive'

type Action = { label: string; desc: string; screen: string; icon: { type: any; name: string }; permission: PermissionName }

const StockHome = () => {
  const { t } = useTranslation()
  const navigation = useNavigation<any>()
  const { can } = usePermissions()

  const ACTIONS: Action[] = useMemo(() => [
    { label: t('stock.stockHome.stockItems'), desc: t('stock.stockHome.stockItemsDesc'), screen: 'StockItems', icon: { type: Icons.MaterialCommunityIcons, name: 'package-variant' }, permission: PERMISSIONS.STOCK_VIEW },
    { label: t('stock.stockHome.purchases'), desc: t('stock.stockHome.purchasesDesc'), screen: 'Purchases', icon: { type: Icons.MaterialCommunityIcons, name: 'cart-plus' }, permission: PERMISSIONS.STOCK_PURCHASE },
    { label: t('stock.stockHome.consumption'), desc: t('stock.stockHome.consumptionDesc'), screen: 'Consumption', icon: { type: Icons.MaterialCommunityIcons, name: 'package-down' }, permission: PERMISSIONS.STOCK_MANAGE },
    { label: t('stock.stockHome.suppliers'), desc: t('stock.stockHome.suppliersDesc'), screen: 'Suppliers', icon: { type: Icons.MaterialCommunityIcons, name: 'account-tie' }, permission: PERMISSIONS.STOCK_PURCHASE },
    { label: t('stock.stockHome.reports'), desc: t('stock.stockHome.reportsDesc'), screen: 'StockReports', icon: { type: Icons.MaterialCommunityIcons, name: 'chart-box-outline' }, permission: PERMISSIONS.STOCK_VIEW }
  ], [t])
  const [totalItems, setTotalItems] = useState(0)
  const [lowStock, setLowStock] = useState(0)
  const [expiring, setExpiring] = useState(0)
  const [refreshing, setRefreshing] = useState(false)

  const load = useCallback(async () => {
    try {
      const [items, alerts, expiry] = await Promise.all([
        getStockItems({ limit: 1 }),
        getStockAlerts(),
        getExpiryReport(60)
      ])
      setTotalItems(items?.data?.data?.totalCount ?? 0)
      const a = alerts?.data?.data
      setLowStock(Array.isArray(a) ? a.length : a?.items?.length ?? a?.count ?? 0)
      const ex = expiry?.data?.data
      setExpiring((ex?.counts?.expired ?? 0) + (ex?.counts?.expiringSoon ?? 0))
    } catch (e) {
      // non-blocking
    } finally {
      setRefreshing(false)
    }
  }, [])

  useFocusEffect(useCallback(() => { load() }, [load]))

  const visible = ACTIONS.filter(a => can(a.permission))

  const stat = (label: string, value: any, color: keyof typeof COLORS = 'primaryMain') => (
    <View style={styles.statCard}>
      <AppText fontSize="h5" bold color={color}>{value}</AppText>
      <AppText fontSize="caption" color="descriptionColor" style={{ marginTop: RF(2), textAlign: 'center' }}>{label}</AppText>
    </View>
  )

  return (
    <AppContainer>
      <AppHeader title={t('stock.stockHome.title')} showHam onPressHam={() => navigation.openDrawer?.()} />
      <ScrollView
        contentContainerStyle={{ padding: RF(16), paddingBottom: RF(40) }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load() }} colors={[COLORS.primaryMain]} />}
      >
        <View style={styles.statsRow}>
          {stat(t('stock.stockHome.totalItems'), totalItems)}
          {stat(t('stock.stockHome.lowStock'), lowStock, 'warning')}
          {stat(t('stock.stockHome.expiring'), expiring, 'error')}
        </View>

        <AppText fontSize="h7" semiBold style={{ marginBottom: RF(12) }}>{t('stock.stockHome.actions')}</AppText>
        {visible.map((a, i) => (
          <TouchableOpacity key={i} style={styles.actionCard} onPress={() => navigation.navigate(a.screen)} activeOpacity={0.85}>
            <View style={styles.iconCircle}>
              <AnyIcon disabled type={a.icon.type} name={a.icon.name} size={RF(22)} color={COLORS.primaryMain} />
            </View>
            <View style={{ flex: 1 }}>
              <AppText fontSize="h7" semiBold>{a.label}</AppText>
              <AppText fontSize="caption" color="descriptionColor">{a.desc}</AppText>
            </View>
            <AnyIcon disabled type={Icons.Feather} name="chevron-right" size={RF(20)} color={COLORS.labelGrey} />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </AppContainer>
  )
}

const styles = StyleSheet.create({
  statsRow: { flexDirection: 'row', gap: RF(10), marginBottom: RF(20) },
  statCard: { flex: 1, backgroundColor: COLORS.white, borderRadius: RF(12), padding: RF(12), alignItems: 'center', elevation: 2, shadowColor: COLORS.cardGrey, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.5, shadowRadius: 4 },
  actionCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, borderRadius: RF(12), padding: RF(14), marginBottom: RF(12), elevation: 2, shadowColor: COLORS.cardGrey, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.5, shadowRadius: 4 },
  iconCircle: { width: RF(40), height: RF(40), borderRadius: RF(20), backgroundColor: COLORS.primaryLightest, alignItems: 'center', justifyContent: 'center', marginRight: RF(12) }
})

export default StockHome
