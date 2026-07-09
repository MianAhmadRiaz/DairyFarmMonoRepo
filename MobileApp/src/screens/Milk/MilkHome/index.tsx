import { useNavigation } from '@react-navigation/native'
import React, { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { RefreshControl, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import Toast from 'react-native-toast-message'
import AppContainer from 'shared/components/AppContainer'
import AppHeader from 'shared/components/AppHeader'
import AppText from 'shared/components/AppText/AppText'
import AnyIcon, { Icons } from 'shared/components/AnyIcon'
import { getMilkAnalytics } from 'shared/services/milk.services'
import { getNormalizedError } from 'shared/services/helper.services'
import usePermissions from 'shared/rbac/usePermissions'
import { PERMISSIONS, PermissionName } from 'shared/rbac/permissions'
import { COLORS } from 'shared/theme'
import { RF } from 'shared/theme/responsive'

type Action = {
  label: string
  desc: string
  screen: string
  icon: { type: any; name: string }
  permission: PermissionName
}

const MilkHome = () => {
  const { t } = useTranslation()
  const navigation = useNavigation<any>()
  const { can } = usePermissions()

  const ACTIONS: Action[] = useMemo(() => [
    { label: t('milk.milkHome.actions.milkingSessions.label'), desc: t('milk.milkHome.actions.milkingSessions.desc'), screen: 'MilkSessions', icon: { type: Icons.MaterialCommunityIcons, name: 'cup-water' }, permission: PERMISSIONS.MILK_VIEW },
    { label: t('milk.milkHome.actions.approveMilk.label'), desc: t('milk.milkHome.actions.approveMilk.desc'), screen: 'MilkApproval', icon: { type: Icons.MaterialCommunityIcons, name: 'check-decagram' }, permission: PERMISSIONS.MILK_APPROVE },
    { label: t('milk.milkHome.actions.milkOut.label'), desc: t('milk.milkHome.actions.milkOut.desc'), screen: 'MilkOut', icon: { type: Icons.MaterialCommunityIcons, name: 'truck-delivery' }, permission: PERMISSIONS.MILK_DISPATCH }
  ], [t])
  const [analytics, setAnalytics] = useState<any>(null)
  const [refreshing, setRefreshing] = useState(false)

  const load = useCallback(async () => {
    try {
      const res = await getMilkAnalytics()
      setAnalytics(res?.data?.data)
    } catch (e) {
      Toast.show({ type: 'error', text1: t('milk.common.error'), text2: getNormalizedError(e) })
    } finally {
      setRefreshing(false)
    }
  }, [t])

  useFocusEffect(useCallback(() => { load() }, [load]))

  const visible = ACTIONS.filter(a => can(a.permission))

  const stat = (label: string, value: any) => (
    <View style={styles.statCard}>
      <AppText fontSize="h5" bold color="primaryMain">
        {value ?? 0}
      </AppText>
      <AppText fontSize="caption" color="descriptionColor" style={{ marginTop: RF(2) }}>
        {label}
      </AppText>
    </View>
  )

  return (
    <AppContainer>
      <AppHeader title={t('milk.milkHome.title')} showHam onPressHam={() => navigation.openDrawer?.()} />
      <ScrollView
        contentContainerStyle={{ padding: RF(16), paddingBottom: RF(40) }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load() }} colors={[COLORS.primaryMain]} />}
      >
        <View style={styles.statsRow}>
          {stat(t('milk.milkHome.todaysMilk'), analytics?.totalMilk)}
          {stat(t('milk.milkHome.dispatched'), analytics?.totalMilkOut)}
          {stat(t('milk.milkHome.inTank'), analytics?.finalMilk)}
        </View>

        <AppText fontSize="h7" semiBold style={{ marginBottom: RF(12) }}>
          {t('milk.milkHome.actionsHeading')}
        </AppText>
        {visible.map((a, i) => (
          <TouchableOpacity key={i} style={styles.actionCard} onPress={() => navigation.navigate(a.screen)} activeOpacity={0.85}>
            <View style={styles.iconCircle}>
              <AnyIcon disabled type={a.icon.type} name={a.icon.name} size={RF(22)} color={COLORS.primaryMain} />
            </View>
            <View style={{ flex: 1 }}>
              <AppText fontSize="h7" semiBold>
                {a.label}
              </AppText>
              <AppText fontSize="caption" color="descriptionColor">
                {a.desc}
              </AppText>
            </View>
            <AnyIcon disabled type={Icons.Feather} name="chevron-right" size={RF(20)} color={COLORS.labelGrey} />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </AppContainer>
  )
}

const styles = StyleSheet.create({
  statsRow: { flexDirection: 'row', gap: RF(10), marginBottom: RF(20) },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: RF(12),
    padding: RF(12),
    alignItems: 'center',
    elevation: 2,
    shadowColor: COLORS.cardGrey,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: RF(12),
    padding: RF(14),
    marginBottom: RF(12),
    elevation: 2,
    shadowColor: COLORS.cardGrey,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4
  },
  iconCircle: {
    width: RF(40),
    height: RF(40),
    borderRadius: RF(20),
    backgroundColor: COLORS.primaryLightest,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: RF(12)
  }
})

export default MilkHome
