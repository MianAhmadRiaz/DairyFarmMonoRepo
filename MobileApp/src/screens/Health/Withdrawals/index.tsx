import React, { useCallback, useState } from 'react'
import { useFocusEffect } from '@react-navigation/native'
import Toast from 'react-native-toast-message'
import InfoCard from 'shared/components/InfoCard'
import ListScreen from 'shared/components/ListScreen'
import { Icons } from 'shared/components/AnyIcon'
import { getActiveWithdrawals } from 'shared/services/health.services'
import { getNormalizedError } from 'shared/services/helper.services'

const Withdrawals = () => {
  const [withdrawals, setWithdrawals] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  const load = useCallback(async () => {
    try {
      setLoading(true)
      const res = await getActiveWithdrawals()
      const rows = res?.data?.data?.withdrawals || res?.data?.data || []
      setWithdrawals(Array.isArray(rows) ? rows : [])
    } catch (e) {
      Toast.show({ type: 'error', text1: 'Error', text2: getNormalizedError(e) })
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useFocusEffect(useCallback(() => { load() }, [load]))

  const renderItem = ({ item }: any) => (
    <InfoCard
      title={item.animal?.tagName || item.animal?.name || 'Animal'}
      subtitle={item.medicineName || item.treatmentType}
      leftIcon={{ type: Icons.MaterialCommunityIcons, name: 'cup-off' }}
      rows={[
        { label: 'Medicine', value: item.medicineName },
        { label: 'Milk withdrawal until', value: item.milkWithdrawalUntil },
        { label: 'Meat withdrawal until', value: item.meatWithdrawalUntil }
      ]}
      badge={item.milkWithdrawalUntil ? { text: `Until ${item.milkWithdrawalUntil}`, color: 'error' } : undefined}
    />
  )

  return (
    <ListScreen
      title="Active Withdrawals"
      data={withdrawals}
      renderItem={renderItem}
      loading={loading}
      refreshing={refreshing}
      onRefresh={() => { setRefreshing(true); load() }}
      emptyText="No animals are currently under withdrawal."
      keyExtractor={(item: any, i) => item.uuid || String(i)}
    />
  )
}

export default Withdrawals
