import React, { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useFocusEffect } from '@react-navigation/native'
import { StyleSheet, TouchableOpacity, View } from 'react-native'
import Toast from 'react-native-toast-message'
import AppContainer from 'shared/components/AppContainer'
import AppHeader from 'shared/components/AppHeader'
import AppText from 'shared/components/AppText/AppText'
import InfoCard from 'shared/components/InfoCard'
import { FlatList } from 'react-native-gesture-handler'
import { Icons } from 'shared/components/AnyIcon'
import { getSalaryInvoices, markInvoicePaid } from 'shared/services/employee.services'
import { getNormalizedError } from 'shared/services/helper.services'
import usePermissions from 'shared/rbac/usePermissions'
import { PERMISSIONS } from 'shared/rbac/permissions'
import { COLORS } from 'shared/theme'
import { RF } from 'shared/theme/responsive'

const Salaries = () => {
  const { t } = useTranslation()
  const { can } = usePermissions()
  const canView = can([PERMISSIONS.SALARY_MANAGE, PERMISSIONS.SALARY_PAY])
  const canPay = can(PERMISSIONS.SALARY_PAY)
  const [invoices, setInvoices] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [payingId, setPayingId] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      setLoading(true)
      const res = await getSalaryInvoices({ limit: 200 })
      const rows =
        res?.data?.data?.invoices ||
        res?.data?.data?.salaryInvoices ||
        res?.data?.data ||
        []
      setInvoices(Array.isArray(rows) ? rows : [])
    } catch (e) {
      Toast.show({ type: 'error', text1: t('employee.common.error'), text2: getNormalizedError(e) })
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [t])

  useFocusEffect(useCallback(() => { load() }, [load]))

  const pay = async (item: any) => {
    try {
      setPayingId(item.uuid)
      await markInvoicePaid(item.uuid)
      Toast.show({ type: 'success', text1: t('employee.salaries.paid'), text2: t('employee.salaries.invoiceMarkedPaid') })
      load()
    } catch (e) {
      Toast.show({ type: 'error', text1: t('employee.common.error'), text2: getNormalizedError(e) })
    } finally {
      setPayingId(null)
    }
  }

  const renderItem = ({ item }: any) => {
    const unpaid = item.status !== 'paid'
    return (
      <View>
        <InfoCard
          title={item.name || t('employee.common.employee')}
          subtitle={item.month}
          leftIcon={{ type: Icons.MaterialCommunityIcons, name: 'cash-multiple' }}
          badge={{ text: unpaid ? t('employee.salaries.unpaid') : t('employee.salaries.paidBadge'), color: unpaid ? 'warning' : 'success' }}
          rows={[{ label: t('employee.salaries.grossSalary'), value: item.gross_salary }]}
        />
        {unpaid && canPay ? (
          <TouchableOpacity
            style={styles.payBtn}
            disabled={payingId === item.uuid}
            onPress={() => pay(item)}
            activeOpacity={0.85}
          >
            <AppText fontSize="caption" medium color="white">
              {t('employee.salaries.markPaid')}
            </AppText>
          </TouchableOpacity>
        ) : null}
      </View>
    )
  }

  if (!canView) {
    return (
      <AppContainer>
        <AppHeader title={t('employee.salaries.title')} showBack />
        <View style={styles.center}>
          <AppText color="error">{t('employee.salaries.noPermission')}</AppText>
        </View>
      </AppContainer>
    )
  }

  return (
    <AppContainer>
      <AppHeader title={t('employee.salaries.title')} showBack />
      <FlatList
        data={invoices}
        keyExtractor={(item: any, i) => item.uuid || String(i)}
        renderItem={renderItem}
        contentContainerStyle={{ padding: RF(16), paddingBottom: RF(40) }}
        refreshing={refreshing}
        onRefresh={() => { setRefreshing(true); load() }}
        ListEmptyComponent={
          !loading ? (
            <AppText color="descriptionColor" style={{ textAlign: 'center', marginTop: RF(40) }}>
              {t('employee.salaries.noInvoices')}
            </AppText>
          ) : null
        }
      />
    </AppContainer>
  )
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: RF(16) },
  payBtn: {
    backgroundColor: COLORS.primaryMain,
    borderRadius: RF(8),
    paddingVertical: RF(10),
    alignItems: 'center',
    marginTop: RF(-4),
    marginBottom: RF(14)
  }
})

export default Salaries
