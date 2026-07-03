import React, { useCallback, useState } from 'react'
import { useFocusEffect, useNavigation } from '@react-navigation/native'
import { StyleSheet, View } from 'react-native'
import Toast from 'react-native-toast-message'
import AppContainer from 'shared/components/AppContainer'
import AppHeader from 'shared/components/AppHeader'
import AppText from 'shared/components/AppText/AppText'
import InfoCard from 'shared/components/InfoCard'
import PrimaryButton from 'shared/components/PrimaryButton'
import { Icons } from 'shared/components/AnyIcon'
import { FlatList } from 'react-native-gesture-handler'
import {
  getMilkingSessions,
  getPendingApprovalDates,
  approveMilk
} from 'shared/services/milk.services'
import { getNormalizedError } from 'shared/services/helper.services'
import usePermissions from 'shared/rbac/usePermissions'
import { PERMISSIONS } from 'shared/rbac/permissions'
import { COLORS } from 'shared/theme'
import { RF } from 'shared/theme/responsive'

const MilkApproval = () => {
  const navigation = useNavigation<any>()
  const { can } = usePermissions()
  const canApprove = can(PERMISSIONS.MILK_APPROVE)
  const [pendingDates, setPendingDates] = useState<string[]>([])
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [sessions, setSessions] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [approving, setApproving] = useState(false)

  const loadDates = useCallback(async () => {
    try {
      const res = await getPendingApprovalDates()
      const dates = res?.data?.data?.pendingMilkApprovalDates || res?.data?.data || []
      setPendingDates(Array.isArray(dates) ? dates : [])
    } catch (e) {
      Toast.show({ type: 'error', text1: 'Error', text2: getNormalizedError(e) })
    }
  }, [])

  useFocusEffect(useCallback(() => { loadDates() }, [loadDates]))

  const loadSessions = async (date: string) => {
    try {
      setLoading(true)
      setSelectedDate(date)
      const res = await getMilkingSessions(date)
      const rows = res?.data?.data?.milkingSessions || []
      setSessions(Array.isArray(rows) ? rows : [])
    } catch (e) {
      Toast.show({ type: 'error', text1: 'Error', text2: getNormalizedError(e) })
    } finally {
      setLoading(false)
    }
  }

  const onApprove = async () => {
    try {
      setApproving(true)
      const cleanData = sessions
        .filter((i: any) => i.uuid && i.penId && i.tagId && i.date && i.lactation)
        .map(({ tagName, ...rest }: any) => rest)
      await approveMilk({ sessionsData: cleanData })
      Toast.show({ type: 'success', text1: 'Approved', text2: 'Milk approved into the tank' })
      setSessions([])
      setSelectedDate('')
      loadDates()
    } catch (e) {
      Toast.show({ type: 'error', text1: 'Error', text2: getNormalizedError(e), visibilityTime: 5000 })
    } finally {
      setApproving(false)
    }
  }

  return (
    <AppContainer>
      <AppHeader title="Approve Milk" showBack />
      <View style={{ flex: 1, padding: RF(16) }}>
        <AppText fontSize="caption" color="descriptionColor" style={{ marginBottom: RF(8) }}>
          Pending approval dates
        </AppText>
        <View style={styles.chipRow}>
          {pendingDates.length === 0 ? (
            <AppText color="descriptionColor">No dates pending approval.</AppText>
          ) : (
            pendingDates.map((d, i) => (
              <View
                key={i}
                style={[styles.chip, selectedDate === d && styles.chipActive]}
                onTouchEnd={() => loadSessions(d)}
              >
                <AppText fontSize="caption" color={selectedDate === d ? 'white' : 'primaryDark'}>
                  {d}
                </AppText>
              </View>
            ))
          )}
        </View>

        <FlatList
          data={sessions}
          keyExtractor={(item: any, i) => item.uuid || String(i)}
          contentContainerStyle={{ paddingVertical: RF(12) }}
          renderItem={({ item }: any) => (
            <InfoCard
              title={item.tagName || 'Animal'}
              subtitle={item.date}
              leftIcon={{ type: Icons.MaterialCommunityIcons, name: 'cow' }}
              rows={[{ label: 'Sessions', value: (item.sessions || []).length }]}
            />
          )}
          ListEmptyComponent={
            selectedDate && !loading ? (
              <AppText color="descriptionColor" style={{ textAlign: 'center', marginTop: RF(20) }}>
                No sessions to approve.
              </AppText>
            ) : null
          }
        />

        {canApprove && sessions.length > 0 ? (
          <PrimaryButton
            title="Approve into Tank"
            loading={approving}
            loaderColor={COLORS.white}
            onPress={onApprove}
            buttonStyle={{ marginBottom: RF(16) }}
          />
        ) : null}
        {!canApprove ? (
          <View style={styles.noPerm}>
            <AppText fontSize="caption" color="error">
              You do not have permission to approve milk.
            </AppText>
          </View>
        ) : null}
      </View>
    </AppContainer>
  )
}

const styles = StyleSheet.create({
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: RF(8) },
  chip: {
    backgroundColor: COLORS.primaryLightest,
    borderRadius: RF(16),
    paddingHorizontal: RF(12),
    paddingVertical: RF(6)
  },
  chipActive: { backgroundColor: COLORS.primaryMain },
  noPerm: { padding: RF(12), alignItems: 'center' }
})

export default MilkApproval
