import React, { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useFocusEffect } from '@react-navigation/native'
import { StyleSheet, TouchableOpacity, View } from 'react-native'
import Toast from 'react-native-toast-message'
import InfoCard from 'shared/components/InfoCard'
import ListScreen from 'shared/components/ListScreen'
import AppText from 'shared/components/AppText/AppText'
import { Icons } from 'shared/components/AnyIcon'
import { getRequests, respondRequest } from 'shared/services/employee.services'
import { getNormalizedError } from 'shared/services/helper.services'
import usePermissions from 'shared/rbac/usePermissions'
import { PERMISSIONS } from 'shared/rbac/permissions'
import { COLORS } from 'shared/theme'
import { RF } from 'shared/theme/responsive'

const statusColor = (s?: string): keyof typeof COLORS => {
  if (s === 'completed') return 'success'
  if (s === 'rejected') return 'error'
  if (s === 'pending' || s === 'review' || s === 'hold') return 'warning'
  return 'primaryLightest'
}

const Requests = () => {
  const { t } = useTranslation()
  const { can } = usePermissions()
  const canManage = can(PERMISSIONS.EMPLOYEE_MANAGE)
  const [requests, setRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [respondingId, setRespondingId] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      setLoading(true)
      const res = await getRequests({ limit: 200 })
      // Backend returns requests under the `tasks` key (findAndCountAll rows alias).
      const rows = res?.data?.data?.tasks || res?.data?.data?.requests || res?.data?.data || []
      setRequests(Array.isArray(rows) ? rows : [])
    } catch (e) {
      Toast.show({ type: 'error', text1: t('employee.common.error'), text2: getNormalizedError(e) })
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [t])

  useFocusEffect(useCallback(() => { load() }, [load]))

  const respond = async (item: any, status: 'completed' | 'rejected') => {
    try {
      setRespondingId(item.uuid)
      await respondRequest({ requestId: item.uuid, status, response: status === 'completed' ? 'Approved' : 'Rejected' })
      Toast.show({ type: 'success', text1: t('employee.common.done'), text2: t('employee.requests.responded', { status: t('employee.requests.status.' + status, status) }) })
      load()
    } catch (e) {
      Toast.show({ type: 'error', text1: t('employee.common.error'), text2: getNormalizedError(e) })
    } finally {
      setRespondingId(null)
    }
  }

  const renderItem = ({ item }: any) => {
    const isPending = item.status === 'pending' || item.status === 'review' || item.status === 'hold'
    return (
      <View>
        <InfoCard
          title={item.title || t('employee.requests.request')}
          subtitle={item.description}
          leftIcon={{ type: Icons.MaterialCommunityIcons, name: 'inbox-arrow-down' }}
          badge={item.status ? { text: t('employee.requests.status.' + item.status, String(item.status)).toUpperCase(), color: statusColor(item.status) } : undefined}
        />
        {canManage && isPending ? (
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: COLORS.success }]}
              disabled={respondingId === item.uuid}
              onPress={() => respond(item, 'completed')}
              activeOpacity={0.85}
            >
              <AppText fontSize="caption" medium color="white">
                {t('employee.requests.approve')}
              </AppText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: COLORS.error }]}
              disabled={respondingId === item.uuid}
              onPress={() => respond(item, 'rejected')}
              activeOpacity={0.85}
            >
              <AppText fontSize="caption" medium color="white">
                {t('employee.requests.reject')}
              </AppText>
            </TouchableOpacity>
          </View>
        ) : null}
      </View>
    )
  }

  return (
    <ListScreen
      title={t('employee.requests.title')}
      data={requests}
      renderItem={renderItem}
      loading={loading}
      refreshing={refreshing}
      onRefresh={() => { setRefreshing(true); load() }}
      emptyText={t('employee.requests.noRequests')}
      keyExtractor={(item: any, i) => item.uuid || String(i)}
    />
  )
}

const styles = StyleSheet.create({
  actionRow: { flexDirection: 'row', gap: RF(10), marginTop: RF(-4), marginBottom: RF(14) },
  actionBtn: {
    flex: 1,
    borderRadius: RF(8),
    paddingVertical: RF(10),
    alignItems: 'center'
  }
})

export default Requests
