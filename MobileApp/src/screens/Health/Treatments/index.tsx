import { useNavigation } from '@react-navigation/native'
import React, { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useFocusEffect } from '@react-navigation/native'
import { Alert, TouchableOpacity } from 'react-native'
import Toast from 'react-native-toast-message'
import InfoCard from 'shared/components/InfoCard'
import ListScreen from 'shared/components/ListScreen'
import AnyIcon, { Icons } from 'shared/components/AnyIcon'
import { getTreatments, deleteTreatment } from 'shared/services/health.services'
import { getNormalizedError } from 'shared/services/helper.services'
import usePermissions from 'shared/rbac/usePermissions'
import { PERMISSIONS } from 'shared/rbac/permissions'
import { COLORS } from 'shared/theme'
import { RF } from 'shared/theme/responsive'

const todayStr = new Date().toISOString().split('T')[0]

const Treatments = () => {
  const { t } = useTranslation()
  const navigation = useNavigation<any>()
  const { can } = usePermissions()
  const canManage = can(PERMISSIONS.HEALTH_MANAGE)
  const [treatments, setTreatments] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  const load = useCallback(async () => {
    try {
      setLoading(true)
      const res = await getTreatments({ limit: 100 })
      const rows = res?.data?.data?.treatments || []
      setTreatments(Array.isArray(rows) ? rows : [])
    } catch (e) {
      Toast.show({ type: 'error', text1: t('health.common.error'), text2: getNormalizedError(e) })
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [t])

  useFocusEffect(useCallback(() => { load() }, [load]))

  const onDelete = (item: any) => {
    Alert.alert(t('health.treatments.deleteTreatment'), t('health.treatments.deleteConfirm'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteTreatment(item.uuid)
            Toast.show({ type: 'success', text1: t('health.common.success'), text2: t('health.treatments.treatmentDeleted') })
            load()
          } catch (e) {
            Toast.show({ type: 'error', text1: t('health.common.error'), text2: getNormalizedError(e) })
          }
        }
      }
    ])
  }

  const renderItem = ({ item }: any) => {
    const underWithdrawal = item.milkWithdrawalUntil && item.milkWithdrawalUntil >= todayStr
    return (
      <InfoCard
        title={item.animal?.tagName || item.animal?.name || t('health.common.animal')}
        subtitle={item.date}
        leftIcon={{ type: Icons.MaterialCommunityIcons, name: 'medical-bag' }}
        rows={[
          { label: t('health.treatments.type'), value: item.treatmentType },
          { label: t('health.treatments.diagnosis'), value: item.diagnosis },
          { label: t('health.common.medicine'), value: item.medicineName },
          { label: t('health.treatments.vet'), value: item.vetName }
        ]}
        badge={underWithdrawal ? { text: t('health.treatments.withdrawalUntil', { date: item.milkWithdrawalUntil }), color: 'error' } : undefined}
        right={
          canManage ? (
            <TouchableOpacity onPress={() => onDelete(item)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <AnyIcon disabled type={Icons.Feather} name="trash-2" size={RF(20)} color={COLORS.error} />
            </TouchableOpacity>
          ) : undefined
        }
      />
    )
  }

  return (
    <ListScreen
      title={t('health.treatments.title')}
      data={treatments}
      renderItem={renderItem}
      loading={loading}
      refreshing={refreshing}
      onRefresh={() => { setRefreshing(true); load() }}
      emptyText={t('health.treatments.emptyText')}
      keyExtractor={(item: any, i) => item.uuid || String(i)}
      onPressAdd={canManage ? () => navigation.navigate('AddTreatment') : undefined}
    />
  )
}

export default Treatments
