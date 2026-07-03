import React, { useCallback, useState } from 'react'
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
      Toast.show({ type: 'error', text1: 'Error', text2: getNormalizedError(e) })
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useFocusEffect(useCallback(() => { load() }, [load]))

  return (
    <ListScreen
      title="Purchases"
      data={purchases}
      loading={loading}
      refreshing={refreshing}
      onRefresh={() => { setRefreshing(true); load() }}
      keyExtractor={(item: any, i) => item.uuid || String(i)}
      emptyText="No purchases recorded."
      onPressAdd={can(PERMISSIONS.STOCK_PURCHASE) ? () => navigation.navigate('AddPurchase') : undefined}
      renderItem={({ item }: any) => (
        <InfoCard
          title={item.item_name || 'Item'}
          subtitle={`${item.date} · ${item.supplier_name || ''}`}
          leftIcon={{ type: Icons.MaterialCommunityIcons, name: 'cart' }}
          rows={[
            { label: 'Quantity', value: item.quantity },
            { label: 'Cost / unit', value: item.cost_per_unit },
            { label: 'Total', value: item.total_cost },
            { label: 'Batch', value: item.batch_number },
            { label: 'Expiry', value: item.expiry_date }
          ]}
        />
      )}
    />
  )
}

export default Purchases
