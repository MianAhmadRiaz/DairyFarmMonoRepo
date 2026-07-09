import React, { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useFocusEffect } from '@react-navigation/native'
import Toast from 'react-native-toast-message'
import InfoCard from 'shared/components/InfoCard'
import ListScreen from 'shared/components/ListScreen'
import { Icons } from 'shared/components/AnyIcon'
import { getActiveWithdrawals } from 'shared/services/health.services'
import { getNormalizedError } from 'shared/services/helper.services'

const Withdrawals = () => {
  const { t } = useTranslation()
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
      Toast.show({ type: 'error', text1: t('health.common.error'), text2: getNormalizedError(e) })
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [t])

  useFocusEffect(useCallback(() => { load() }, [load]))

  const renderItem = ({ item }: any) => (
    <InfoCard
      title={item.animal?.tagName || item.animal?.name || t('health.common.animal')}
      subtitle={item.medicineName || item.treatmentType}
      leftIcon={{ type: Icons.MaterialCommunityIcons, name: 'cup-off' }}
      rows={[
        { label: t('health.common.medicine'), value: item.medicineName },
        { label: t('health.common.milkWithdrawalUntil'), value: item.milkWithdrawalUntil },
        { label: t('health.withdrawals.meatWithdrawalUntil'), value: item.meatWithdrawalUntil }
      ]}
      badge={item.milkWithdrawalUntil ? { text: t('health.withdrawals.until', { date: item.milkWithdrawalUntil }), color: 'error' } : undefined}
    />
  )

  return (
    <ListScreen
      title={t('health.common.activeWithdrawals')}
      data={withdrawals}
      renderItem={renderItem}
      loading={loading}
      refreshing={refreshing}
      onRefresh={() => { setRefreshing(true); load() }}
      emptyText={t('health.withdrawals.emptyText')}
      keyExtractor={(item: any, i) => item.uuid || String(i)}
    />
  )
}

export default Withdrawals
