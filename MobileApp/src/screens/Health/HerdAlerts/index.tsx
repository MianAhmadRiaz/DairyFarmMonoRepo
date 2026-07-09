import { useNavigation } from '@react-navigation/native'
import React, { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, View } from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import Toast from 'react-native-toast-message'
import AppContainer from 'shared/components/AppContainer'
import AppHeader from 'shared/components/AppHeader'
import AppText from 'shared/components/AppText/AppText'
import InfoCard from 'shared/components/InfoCard'
import { Icons } from 'shared/components/AnyIcon'
import { getHerdAlerts } from 'shared/services/health.services'
import { getNormalizedError } from 'shared/services/helper.services'
import { COLORS } from 'shared/theme'
import { RF } from 'shared/theme/responsive'

type Section = {
  key: string
  title: string
  icon: string
  render: (item: any, i: number) => JSX.Element
}

const HerdAlerts = () => {
  const { t } = useTranslation()
  const navigation = useNavigation<any>()
  const [alerts, setAlerts] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  const load = useCallback(async () => {
    try {
      setLoading(true)
      const res = await getHerdAlerts()
      setAlerts(res?.data?.data || null)
    } catch (e) {
      Toast.show({ type: 'error', text1: t('health.common.error'), text2: getNormalizedError(e) })
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [t])

  useFocusEffect(useCallback(() => { load() }, [load]))

  const animalCard = (rows: (item: any) => any[]) => (item: any, i: number) => (
    <InfoCard
      key={i}
      title={item.tagName || item.animal?.tagName || item.name || t('health.common.animal')}
      leftIcon={{ type: Icons.MaterialCommunityIcons, name: 'cow' }}
      rows={rows(item)}
    />
  )

  const sections: Section[] = [
    {
      key: 'pregnancyCheckDue',
      title: t('health.herdAlerts.pregnancyCheckDue'),
      icon: 'clipboard-pulse',
      render: animalCard(a => [
        { label: t('health.herdAlerts.category'), value: a.animalCategory },
        { label: t('health.herdAlerts.inseminated'), value: a.inseminated_date }
      ])
    },
    {
      key: 'dryOffDue',
      title: t('health.herdAlerts.dryOffDue'),
      icon: 'cup-off',
      render: animalCard(a => [
        { label: t('health.herdAlerts.dryOffDueLabel'), value: a.dryOffDueDate },
        { label: t('health.herdAlerts.expectedCalving'), value: a.expectedCalvingDate }
      ])
    },
    {
      key: 'calvingExpected',
      title: t('health.herdAlerts.calvingExpected'),
      icon: 'cow',
      render: animalCard(a => [
        { label: t('health.herdAlerts.expectedCalving'), value: a.expectedCalvingDate }
      ])
    },
    {
      key: 'heatWatch',
      title: t('health.herdAlerts.heatWatch'),
      icon: 'heart-pulse',
      render: animalCard(a => [{ label: t('health.herdAlerts.reason'), value: a.reason }])
    },
    {
      key: 'activeMilkWithdrawals',
      title: t('health.common.activeWithdrawals'),
      icon: 'cup-off',
      render: animalCard(a => [
        { label: t('health.common.medicine'), value: a.medicineName },
        { label: t('health.common.milkWithdrawalUntil'), value: a.milkWithdrawalUntil }
      ])
    }
  ]

  return (
    <AppContainer>
      <AppHeader title={t('health.herdAlerts.title')} showBack onPressHam={() => navigation.openDrawer?.()} />
      {loading && !refreshing ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primaryMain} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{ padding: RF(16), paddingBottom: RF(40) }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load() }} colors={[COLORS.primaryMain]} />}
        >
          {sections.map(section => {
            const items: any[] = alerts?.[section.key] || []
            return (
              <View key={section.key} style={styles.section}>
                <View style={styles.sectionHeader}>
                  <AppText fontSize="h7" semiBold color="primaryMain">
                    {section.title}
                  </AppText>
                  <View style={styles.countPill}>
                    <AppText fontSize="11" medium color="primaryDark">
                      {items.length}
                    </AppText>
                  </View>
                </View>
                {items.length === 0 ? (
                  <AppText fontSize="caption" color="descriptionColor" style={{ marginBottom: RF(8) }}>
                    {t('health.herdAlerts.nothingDue')}
                  </AppText>
                ) : (
                  items.map((item, i) => section.render(item, i))
                )}
              </View>
            )
          })}
        </ScrollView>
      )}
    </AppContainer>
  )
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  section: { marginBottom: RF(20) },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: RF(10) },
  countPill: {
    marginLeft: RF(8),
    minWidth: RF(22),
    paddingHorizontal: RF(6),
    paddingVertical: RF(2),
    borderRadius: RF(11),
    backgroundColor: COLORS.primaryLightest,
    alignItems: 'center',
    justifyContent: 'center'
  }
})

export default HerdAlerts
