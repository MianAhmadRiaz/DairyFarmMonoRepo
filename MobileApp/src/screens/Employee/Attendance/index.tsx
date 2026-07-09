import React, { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useFocusEffect } from '@react-navigation/native'
import { FlatList, StyleSheet, TouchableOpacity, View } from 'react-native'
import Toast from 'react-native-toast-message'
import AppContainer from 'shared/components/AppContainer'
import AppHeader from 'shared/components/AppHeader'
import AppText from 'shared/components/AppText/AppText'
import PrimaryButton from 'shared/components/PrimaryButton'
import { getEmployees, markAttendance } from 'shared/services/employee.services'
import { getNormalizedError } from 'shared/services/helper.services'
import usePermissions from 'shared/rbac/usePermissions'
import { PERMISSIONS } from 'shared/rbac/permissions'
import { COLORS } from 'shared/theme'
import { RF } from 'shared/theme/responsive'

const STATUSES = ['present', 'absent', 'leave'] as const
type Status = (typeof STATUSES)[number]
const today = new Date().toISOString().split('T')[0]

const Attendance = () => {
  const { t } = useTranslation()
  const { can } = usePermissions()
  const canManage = can(PERMISSIONS.EMPLOYEE_MANAGE)
  const [date] = useState(today)
  const [employees, setEmployees] = useState<any[]>([])
  const [marks, setMarks] = useState<Record<string, Status>>({})
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    try {
      setLoading(true)
      const res = await getEmployees({ limit: 200 })
      const rows = res?.data?.data?.Employees || res?.data?.data?.employees || res?.data?.data || []
      const list = Array.isArray(rows) ? rows : []
      setEmployees(list)
      const initial: Record<string, Status> = {}
      list.forEach((e: any) => { initial[e.uuid] = 'present' })
      setMarks(initial)
    } catch (e) {
      Toast.show({ type: 'error', text1: t('employee.common.error'), text2: getNormalizedError(e) })
    } finally {
      setLoading(false)
    }
  }, [t])

  useFocusEffect(useCallback(() => { load() }, [load]))

  const onSave = async () => {
    try {
      setSaving(true)
      const data = employees.map(e => ({ userId: e.uuid, status: marks[e.uuid] || 'present' }))
      await markAttendance({ date, data })
      Toast.show({ type: 'success', text1: t('employee.common.saved'), text2: t('employee.attendance.recorded') })
    } catch (e) {
      Toast.show({ type: 'error', text1: t('employee.common.error'), text2: getNormalizedError(e) })
    } finally {
      setSaving(false)
    }
  }

  const renderItem = ({ item }: any) => {
    const current = marks[item.uuid] || 'present'
    return (
      <View style={styles.card}>
        <AppText semiBold color="darkestGrey" numberOfLines={1} style={{ marginBottom: RF(8) }}>
          {item.name || t('employee.common.employee')}
        </AppText>
        <View style={styles.statusRow}>
          {STATUSES.map(s => {
            const active = current === s
            return (
              <TouchableOpacity
                key={s}
                style={[styles.statusBtn, active && styles.statusBtnActive]}
                onPress={() => setMarks(prev => ({ ...prev, [item.uuid]: s }))}
                activeOpacity={0.85}
              >
                <AppText fontSize="caption" medium color={active ? 'white' : 'primaryDark'}>
                  {t('employee.attendance.status.' + s, s.charAt(0).toUpperCase() + s.slice(1))}
                </AppText>
              </TouchableOpacity>
            )
          })}
        </View>
      </View>
    )
  }

  return (
    <AppContainer>
      <AppHeader title={t('employee.attendance.title')} showBack />
      <View style={{ flex: 1, padding: RF(16) }}>
        <View style={styles.dateBar}>
          <AppText color="descriptionColor" fontSize="caption">
            {t('employee.attendance.attendanceFor')}
          </AppText>
          <AppText semiBold color="primaryMain">
            {date}
          </AppText>
        </View>
        <FlatList
          data={employees}
          keyExtractor={(item: any, i) => item.uuid || String(i)}
          renderItem={renderItem}
          contentContainerStyle={{ paddingVertical: RF(12) }}
          ListEmptyComponent={
            !loading ? (
              <AppText color="descriptionColor" style={{ textAlign: 'center', marginTop: RF(20) }}>
                {t('employee.common.noEmployees')}
              </AppText>
            ) : null
          }
        />
        {canManage && employees.length > 0 ? (
          <PrimaryButton
            title={t('employee.attendance.saveAttendance')}
            loading={saving}
            loaderColor={COLORS.white}
            onPress={onSave}
            buttonStyle={{ marginBottom: RF(16) }}
          />
        ) : null}
        {!canManage ? (
          <View style={styles.noPerm}>
            <AppText fontSize="caption" color="error">
              {t('employee.attendance.noPermission')}
            </AppText>
          </View>
        ) : null}
      </View>
    </AppContainer>
  )
}

const styles = StyleSheet.create({
  dateBar: {
    backgroundColor: COLORS.primaryLightest,
    borderRadius: RF(10),
    padding: RF(12),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: RF(12),
    padding: RF(14),
    marginBottom: RF(12),
    shadowColor: COLORS.cardGrey,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 2
  },
  statusRow: { flexDirection: 'row', gap: RF(8) },
  statusBtn: {
    flex: 1,
    backgroundColor: COLORS.primaryLightest,
    borderRadius: RF(8),
    paddingVertical: RF(8),
    alignItems: 'center'
  },
  statusBtnActive: { backgroundColor: COLORS.primaryMain },
  noPerm: { padding: RF(12), alignItems: 'center' }
})

export default Attendance
