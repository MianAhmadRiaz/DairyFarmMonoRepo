import { useNavigation } from '@react-navigation/native'
import React, { useCallback, useState } from 'react'
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
      Toast.show({ type: 'error', text1: 'Error', text2: getNormalizedError(e) })
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useFocusEffect(useCallback(() => { load() }, [load]))

  const onDelete = (item: any) => {
    Alert.alert('Delete Treatment', 'Are you sure you want to delete this treatment record?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteTreatment(item.uuid)
            Toast.show({ type: 'success', text1: 'Success', text2: 'Treatment deleted' })
            load()
          } catch (e) {
            Toast.show({ type: 'error', text1: 'Error', text2: getNormalizedError(e) })
          }
        }
      }
    ])
  }

  const renderItem = ({ item }: any) => {
    const underWithdrawal = item.milkWithdrawalUntil && item.milkWithdrawalUntil >= todayStr
    return (
      <InfoCard
        title={item.animal?.tagName || item.animal?.name || 'Animal'}
        subtitle={item.date}
        leftIcon={{ type: Icons.MaterialCommunityIcons, name: 'medical-bag' }}
        rows={[
          { label: 'Type', value: item.treatmentType },
          { label: 'Diagnosis', value: item.diagnosis },
          { label: 'Medicine', value: item.medicineName },
          { label: 'Vet', value: item.vetName }
        ]}
        badge={underWithdrawal ? { text: `Withdrawal until ${item.milkWithdrawalUntil}`, color: 'error' } : undefined}
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
      title="Treatments"
      data={treatments}
      renderItem={renderItem}
      loading={loading}
      refreshing={refreshing}
      onRefresh={() => { setRefreshing(true); load() }}
      emptyText="No treatments recorded yet."
      keyExtractor={(item: any, i) => item.uuid || String(i)}
      onPressAdd={canManage ? () => navigation.navigate('AddTreatment') : undefined}
    />
  )
}

export default Treatments
