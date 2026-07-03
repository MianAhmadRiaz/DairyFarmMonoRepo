import React, { useCallback, useState } from 'react'
import { useFocusEffect, useNavigation } from '@react-navigation/native'
import Toast from 'react-native-toast-message'
import InfoCard from 'shared/components/InfoCard'
import ListScreen from 'shared/components/ListScreen'
import { Icons } from 'shared/components/AnyIcon'
import { getTasks } from 'shared/services/employee.services'
import { getNormalizedError } from 'shared/services/helper.services'
import usePermissions from 'shared/rbac/usePermissions'
import { PERMISSIONS } from 'shared/rbac/permissions'
import { COLORS } from 'shared/theme'

const priorityColor = (p?: string): keyof typeof COLORS => {
  if (p === 'high') return 'error'
  if (p === 'medium') return 'warning'
  return 'success'
}

const Tasks = () => {
  const navigation = useNavigation<any>()
  const { can } = usePermissions()
  const [tasks, setTasks] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  const load = useCallback(async () => {
    try {
      setLoading(true)
      const res = await getTasks({ limit: 200 })
      const rows = res?.data?.data?.tasks || res?.data?.data || []
      setTasks(Array.isArray(rows) ? rows : [])
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
      title={item.task || 'Task'}
      subtitle={item.description}
      leftIcon={{ type: Icons.MaterialCommunityIcons, name: 'clipboard-text-outline' }}
      badge={item.priority ? { text: String(item.priority).toUpperCase(), color: priorityColor(item.priority) } : undefined}
      rows={[
        { label: 'Deadline', value: item.dead_line },
        { label: 'Assigned', value: item.assign_date }
      ]}
    />
  )

  return (
    <ListScreen
      title="Tasks"
      data={tasks}
      renderItem={renderItem}
      loading={loading}
      refreshing={refreshing}
      onRefresh={() => { setRefreshing(true); load() }}
      emptyText="No tasks found."
      keyExtractor={(item: any, i) => item.uuid || String(i)}
      onPressAdd={can(PERMISSIONS.EMPLOYEE_MANAGE) ? () => navigation.navigate('AddTask') : undefined}
    />
  )
}

export default Tasks
