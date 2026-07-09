import React, { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useFocusEffect } from '@react-navigation/native'
import Toast from 'react-native-toast-message'
import InfoCard from 'shared/components/InfoCard'
import ListScreen from 'shared/components/ListScreen'
import { Icons } from 'shared/components/AnyIcon'
import { getEmployees } from 'shared/services/employee.services'
import { getNormalizedError } from 'shared/services/helper.services'

const Employees = () => {
  const { t } = useTranslation()
  const [employees, setEmployees] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  const load = useCallback(async () => {
    try {
      setLoading(true)
      const res = await getEmployees({ limit: 200 })
      const rows = res?.data?.data?.Employees || res?.data?.data?.employees || res?.data?.data || []
      setEmployees(Array.isArray(rows) ? rows : [])
    } catch (e) {
      Toast.show({ type: 'error', text1: t('employee.common.error'), text2: getNormalizedError(e) })
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [t])

  useFocusEffect(useCallback(() => { load() }, [load]))

  const renderItem = ({ item }: any) => (
    <InfoCard
      title={item.name || t('employee.common.employee')}
      subtitle={[item.designation, item.department].filter(Boolean).join(' · ')}
      leftIcon={{ type: Icons.MaterialCommunityIcons, name: 'account' }}
      rows={[{ label: t('employee.common.phone'), value: item.phone }]}
    />
  )

  return (
    <ListScreen
      title={t('employee.employees.title')}
      data={employees}
      renderItem={renderItem}
      loading={loading}
      refreshing={refreshing}
      onRefresh={() => { setRefreshing(true); load() }}
      emptyText={t('employee.common.noEmployees')}
      keyExtractor={(item: any, i) => item.uuid || String(i)}
    />
  )
}

export default Employees
