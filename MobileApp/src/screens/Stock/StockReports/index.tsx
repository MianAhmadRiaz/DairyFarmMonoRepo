import React, { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useFocusEffect } from '@react-navigation/native'
import { RefreshControl, ScrollView, View } from 'react-native'
import AppContainer from 'shared/components/AppContainer'
import AppHeader from 'shared/components/AppHeader'
import AppText from 'shared/components/AppText/AppText'
import InfoCard from 'shared/components/InfoCard'
import { Icons } from 'shared/components/AnyIcon'
import { getReorderReport, getExpiryReport } from 'shared/services/stock.services'
import { getNormalizedError } from 'shared/services/helper.services'
import Toast from 'react-native-toast-message'
import { COLORS } from 'shared/theme'
import { RF } from 'shared/theme/responsive'

const StockReports = () => {
  const { t } = useTranslation()
  const [reorder, setReorder] = useState<any[]>([])
  const [expired, setExpired] = useState<any[]>([])
  const [expiringSoon, setExpiringSoon] = useState<any[]>([])
  const [refreshing, setRefreshing] = useState(false)

  const load = useCallback(async () => {
    try {
      const [ro, ex] = await Promise.all([getReorderReport(), getExpiryReport(60)])
      const rod = ro?.data?.data
      setReorder(rod?.items || rod?.report || (Array.isArray(rod) ? rod : []))
      const exd = ex?.data?.data
      setExpired(exd?.expired || [])
      setExpiringSoon(exd?.expiringSoon || [])
    } catch (e) {
      Toast.show({ type: 'error', text1: t('stock.common.error'), text2: getNormalizedError(e) })
    } finally {
      setRefreshing(false)
    }
  }, [])

  useFocusEffect(useCallback(() => { load() }, [load]))

  const section = (title: string, count: number) => (
    <AppText fontSize="h7" semiBold style={{ marginTop: RF(16), marginBottom: RF(8) }}>
      {title} ({count})
    </AppText>
  )

  return (
    <AppContainer>
      <AppHeader title={t('stock.stockReports.title')} showBack />
      <ScrollView
        contentContainerStyle={{ padding: RF(16), paddingBottom: RF(40) }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load() }} colors={[COLORS.primaryMain]} />}
      >
        {section(t('stock.stockReports.reorderNeeded'), reorder.length)}
        {reorder.length === 0 ? (
          <AppText color="descriptionColor">{t('stock.stockReports.nothingToReorder')}</AppText>
        ) : (
          reorder.map((r: any, i) => (
            <InfoCard
              key={i}
              title={r.name || r.item_name}
              leftIcon={{ type: Icons.MaterialCommunityIcons, name: 'alert-circle-outline' }}
              badge={{ text: t('stock.stockReports.reorder'), color: 'warning' }}
              rows={[{ label: t('stock.common.quantity'), value: r.quantity }, { label: t('stock.common.reorderLevel'), value: r.reorder_level }]}
            />
          ))
        )}

        {section(t('stock.stockReports.expired'), expired.length)}
        {expired.map((r: any, i) => (
          <InfoCard key={i} title={r.item_name} subtitle={t('stock.stockReports.batch', { value: r.batch_number || '—' })} badge={{ text: t('stock.stockReports.expiredOn', { value: r.expiry_date }), color: 'error' }} rows={[{ label: t('stock.common.quantity'), value: r.quantity }]} />
        ))}

        {section(t('stock.stockReports.expiringSoon'), expiringSoon.length)}
        {expiringSoon.map((r: any, i) => (
          <InfoCard key={i} title={r.item_name} subtitle={t('stock.stockReports.batch', { value: r.batch_number || '—' })} badge={{ text: t('stock.stockReports.until', { value: r.expiry_date }), color: 'warning' }} rows={[{ label: t('stock.common.quantity'), value: r.quantity }]} />
        ))}
      </ScrollView>
    </AppContainer>
  )
}

export default StockReports
