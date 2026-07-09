import React, { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useFocusEffect } from '@react-navigation/native'
import Toast from 'react-native-toast-message'
import InfoCard from 'shared/components/InfoCard'
import ListScreen from 'shared/components/ListScreen'
import { Icons } from 'shared/components/AnyIcon'
import { getTransactions } from 'shared/services/finance.services'
import { getNormalizedError } from 'shared/services/helper.services'
import usePermissions from 'shared/rbac/usePermissions'
import { PERMISSIONS } from 'shared/rbac/permissions'

const Transactions = () => {
  const { t } = useTranslation()
  const { can } = usePermissions()
  const canView = can(PERMISSIONS.FINANCE_VIEW)
  const [transactions, setTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  const load = useCallback(async () => {
    try {
      setLoading(true)
      const res = await getTransactions({ limit: 50 })
      const rows =
        res?.data?.data?.items ||
        res?.data?.data?.transactions ||
        res?.data?.data ||
        []
      setTransactions(Array.isArray(rows) ? rows : [])
    } catch (e) {
      Toast.show({ type: 'error', text1: t('finance.common.error'), text2: getNormalizedError(e) })
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useFocusEffect(useCallback(() => { if (canView) load() }, [load, canView]))

  const renderItem = ({ item }: any) => {
    const type = item.transaction_type || item.transactionType
    const isIncome = type === 'income'
    return (
      <InfoCard
        title={item.description || item.transaction_number || t('finance.transactions.transaction')}
        subtitle={item.transaction_date}
        leftIcon={{ type: Icons.MaterialCommunityIcons, name: isIncome ? 'arrow-down-bold-circle' : 'arrow-up-bold-circle' }}
        badge={type ? { text: t('finance.type.' + type, String(type).toUpperCase()), color: isIncome ? 'success' : 'error' } : undefined}
        rows={[{ label: t('finance.transactions.amount'), value: item.amount !== undefined ? Number(item.amount).toLocaleString() : undefined }]}
      />
    )
  }

  return (
    <ListScreen
      title={t('finance.transactions.title')}
      data={canView ? transactions : []}
      renderItem={renderItem}
      loading={loading}
      refreshing={refreshing}
      onRefresh={() => { setRefreshing(true); load() }}
      emptyText={canView ? t('finance.transactions.empty') : t('finance.transactions.noPermission')}
      keyExtractor={(item: any, i) => item.uuid || item.id || String(i)}
    />
  )
}

export default Transactions
