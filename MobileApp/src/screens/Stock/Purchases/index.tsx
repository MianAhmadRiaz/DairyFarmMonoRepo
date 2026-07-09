import React, { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useFocusEffect, useNavigation } from '@react-navigation/native'
import InfoCard from 'shared/components/InfoCard'
import ListScreen from 'shared/components/ListScreen'
import { Icons } from 'shared/components/AnyIcon'
import { getPurchases } from 'shared/services/stock.services'
import Toast from 'react-native-toast-message'
import { getNormalizedError } from 'shared/services/helper.services'
import usePermissions from 'shared/rbac/usePermissions'
import { PERMISSIONS } from 'shared/rbac/permissions'

const Purchases = () => {
  const { t } = useTranslation()
  const navigation = useNavigation<any>()
  const { can } = usePermissions()
  const [purchases, setPurchases] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  const load = useCallback(async () => {
    try {
      setLoading(true)
      const res = await getPurchases({ limit: 100 })
      const d = res?.data?.data
      setPurchases(d?.purchaseItems || d?.purchases || (Array.isArray(d) ? d : []))
    } catch (e) {
      Toast.show({ type: 'error', text1: t('stock.common.error'), text2: getNormalizedError(e) })
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useFocusEffect(useCallback(() => { load() }, [load]))

  return (
    <ListScreen
      title={t('stock.purchases.title')}
      data={purchases}
      loading={loading}
      refreshing={refreshing}
      onRefresh={() => { setRefreshing(true); load() }}
      keyExtractor={(item: any, i) => item.uuid || String(i)}
      emptyText={t('stock.purchases.empty')}
      onPressAdd={can(PERMISSIONS.STOCK_PURCHASE) ? () => navigation.navigate('AddPurchase') : undefined}
      renderItem={({ item }: any) => (
        <InfoCard
          title={item.item_name || t('stock.common.item')}
          subtitle={`${item.date} · ${item.supplier_name || ''}`}
          leftIcon={{ type: Icons.MaterialCommunityIcons, name: 'cart' }}
          rows={[
            { label: t('stock.common.quantity'), value: item.quantity },
            { label: t('stock.purchases.costPerUnit'), value: item.cost_per_unit },
            { label: t('stock.purchases.total'), value: item.total_cost },
            { label: t('stock.purchases.batch'), value: item.batch_number },
            { label: t('stock.purchases.expiry'), value: item.expiry_date }
          ]}
        />
      )}
    />
  )
}

export default Purchases
