import React, { useCallback, useState } from 'react'
import { useFocusEffect } from '@react-navigation/native'
import InfoCard from 'shared/components/InfoCard'
import ListScreen from 'shared/components/ListScreen'
import { Icons } from 'shared/components/AnyIcon'
import { getShedFeedReport } from 'shared/services/feeding.services'
import Toast from 'react-native-toast-message'
import { getNormalizedError } from 'shared/services/helper.services'

const FeedReport = () => {
  const [schedules, setSchedules] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  const load = useCallback(async () => {
    try {
      setLoading(true)
      const res = await getShedFeedReport()
      setSchedules(res?.data?.data?.schedules || [])
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
      title="Feed Report"
      data={schedules}
      loading={loading}
      refreshing={refreshing}
      onRefresh={() => { setRefreshing(true); load() }}
      keyExtractor={(item: any, i) => item.uuid || String(i)}
      emptyText="No feeding schedules yet."
      renderItem={({ item }: any) => (
        <InfoCard
          title={item.recipe?.name || item.shed?.name || 'Feeding'}
          subtitle={`${item.feeding_date} · ${item.meal_time}`}
          leftIcon={{ type: Icons.MaterialCommunityIcons, name: 'silo' }}
          badge={{ text: item.feeding_status, color: item.feeding_status === 'completed' ? 'success' : 'primaryLightest' }}
          rows={[
            { label: 'Shed', value: item.shed?.name },
            { label: 'Pen', value: item.pen?.name },
            { label: 'Animals', value: item.animals_count },
            { label: 'Scheduled (kg)', value: item.scheduled_quantity },
            { label: 'Actual (kg)', value: item.actual_quantity }
          ]}
        />
      )}
    />
  )
}

export default FeedReport
