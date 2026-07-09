import { useNavigation } from '@react-navigation/native'
import React, { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useFocusEffect } from '@react-navigation/native'
import { StyleSheet, View } from 'react-native'
import Toast from 'react-native-toast-message'
import InfoCard from 'shared/components/InfoCard'
import ListScreen from 'shared/components/ListScreen'
import AppText from 'shared/components/AppText/AppText'
import { Icons } from 'shared/components/AnyIcon'
import { getMilkingSessions } from 'shared/services/milk.services'
import { getNormalizedError } from 'shared/services/helper.services'
import usePermissions from 'shared/rbac/usePermissions'
import { PERMISSIONS } from 'shared/rbac/permissions'
import { COLORS } from 'shared/theme'
import { RF } from 'shared/theme/responsive'

const today = new Date().toISOString().split('T')[0]

const MilkSessions = () => {
  const { t } = useTranslation()
  const navigation = useNavigation<any>()
  const { can } = usePermissions()
  const [date] = useState(today)
  const [sessions, setSessions] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  const load = useCallback(async () => {
    try {
      setLoading(true)
      const res = await getMilkingSessions(date)
      // Backend returns milkingSessions grouped per animal for the date.
      const rows = res?.data?.data?.milkingSessions || res?.data?.data || []
      setSessions(Array.isArray(rows) ? rows : [])
    } catch (e) {
      Toast.show({ type: 'error', text1: t('milk.common.error'), text2: getNormalizedError(e) })
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [date, t])

  useFocusEffect(useCallback(() => { load() }, [load]))

  const renderItem = ({ item }: any) => {
    const s = item.sessions || []
    const byTime = (t: string) => s.find((x: any) => x.milkingTime === t)?.milk ?? '—'
    return (
      <InfoCard
        title={item.tagName || item.name || t('milk.common.animal')}
        subtitle={item.date}
        leftIcon={{ type: Icons.MaterialCommunityIcons, name: 'cow' }}
        rows={[
          { label: t('milk.common.morning'), value: byTime('morning') },
          { label: t('milk.common.afternoon'), value: byTime('afternoon') },
          { label: t('milk.common.evening'), value: byTime('evening') }
        ]}
      />
    )
  }

  return (
    <ListScreen
      title={t('milk.milkSessions.title')}
      data={sessions}
      renderItem={renderItem}
      loading={loading}
      refreshing={refreshing}
      onRefresh={() => { setRefreshing(true); load() }}
      emptyText={t('milk.milkSessions.emptyText', { date })}
      keyExtractor={(item: any, i) => item.uuid || String(i)}
      onPressAdd={can(PERMISSIONS.MILK_RECORD) ? () => navigation.navigate('AddMilkSession') : undefined}
      ListHeaderComponent={
        <View style={styles.dateBar}>
          <AppText color="descriptionColor" fontSize="caption">
            {t('milk.milkSessions.showingSessionsFor')}
          </AppText>
          <AppText semiBold color="primaryMain">
            {date}
          </AppText>
        </View>
      }
    />
  )
}

const styles = StyleSheet.create({
  dateBar: {
    backgroundColor: COLORS.primaryLightest,
    borderRadius: RF(10),
    padding: RF(12),
    marginBottom: RF(14),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  }
})

export default MilkSessions
