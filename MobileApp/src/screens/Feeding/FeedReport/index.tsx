import React, { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useFocusEffect } from '@react-navigation/native'
import InfoCard from 'shared/components/InfoCard'
import ListScreen from 'shared/components/ListScreen'
import { Icons } from 'shared/components/AnyIcon'
import { getShedFeedReport } from 'shared/services/feeding.services'
import Toast from 'react-native-toast-message'
import { getNormalizedError } from 'shared/services/helper.services'

const FeedReport = () => {
  const { t } = useTranslation()
  const [schedules, setSchedules] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  const load = useCallback(async () => {
    try {
      setLoading(true)
      const res = await getShedFeedReport()
      setSchedules(res?.data?.data?.schedules || [])
    } catch (e) {
      Toast.show({ type: 'error', text1: t('feeding.common.error'), text2: getNormalizedError(e) })
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [t])

  useFocusEffect(useCallback(() => { load() }, [load]))

  return (
    <ListScreen
      title={t('feeding.feedReport.title')}
      data={schedules}
      loading={loading}
      refreshing={refreshing}
      onRefresh={() => { setRefreshing(true); load() }}
      keyExtractor={(item: any, i) => item.uuid || String(i)}
      emptyText={t('feeding.feedReport.empty')}
      renderItem={({ item }: any) => (
        <InfoCard
          title={item.recipe?.name || item.shed?.name || t('feeding.feedReport.feedingFallback')}
          subtitle={`${item.feeding_date} · ${item.meal_time}`}
          leftIcon={{ type: Icons.MaterialCommunityIcons, name: 'silo' }}
          badge={{ text: t('feeding.status.' + item.feeding_status, item.feeding_status), color: item.feeding_status === 'completed' ? 'success' : 'primaryLightest' }}
          rows={[
            { label: t('feeding.feedReport.shed'), value: item.shed?.name },
            { label: t('feeding.feedReport.pen'), value: item.pen?.name },
            { label: t('feeding.feedReport.animals'), value: item.animals_count },
            { label: t('feeding.feedReport.scheduledKg'), value: item.scheduled_quantity },
            { label: t('feeding.feedReport.actualKg'), value: item.actual_quantity }
          ]}
        />
      )}
    />
  )
}

export default FeedReport
