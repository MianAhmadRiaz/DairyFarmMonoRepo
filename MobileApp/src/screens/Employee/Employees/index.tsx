import React, { useCallback, useState } from 'react'
import { useFocusEffect } from '@react-navigation/native'
import Toast from 'react-native-toast-message'
import InfoCard from 'shared/components/InfoCard'
import ListScreen from 'shared/components/ListScreen'
import { Icons } from 'shared/components/AnyIcon'
import { getEmployees } from 'shared/services/employee.services'
import { getNormalizedError } from 'shared/services/helper.services'

const Employees = () => {
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
      Toast.show({ type: 'error', text1: 'Error', text2: getNormalizedError(e) })
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useFocusEffect(useCallback(() => { load() }, [load]))

  const renderItem = ({ item }: any) => (
    <InfoCard
      title={item.name || 'Employee'}
      subtitle={[item.designation, item.department].filter(Boolean).join(' · ')}
      leftIcon={{ type: Icons.MaterialCommunityIcons, name: 'account' }}
      rows={[{ label: 'Phone', value: item.phone }]}
    />
  )

  return (
    <ListScreen
      title="Employees"
      data={employees}
      renderItem={renderItem}
      loading={loading}
      refreshing={refreshing}
      onRefresh={() => { setRefreshing(true); load() }}
      emptyText="No employees found."
      keyExtractor={(item: any, i) => item.uuid || String(i)}
    />
  )
}

export default Employees
