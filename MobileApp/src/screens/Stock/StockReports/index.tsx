import React, { useCallback, useState } from 'react'
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
      Toast.show({ type: 'error', text1: 'Error', text2: getNormalizedError(e) })
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
      <AppHeader title="Stock Reports" showBack />
      <ScrollView
        contentContainerStyle={{ padding: RF(16), paddingBottom: RF(40) }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load() }} colors={[COLORS.primaryMain]} />}
      >
        {section('Reorder Needed', reorder.length)}
        {reorder.length === 0 ? (
          <AppText color="descriptionColor">Nothing to reorder.</AppText>
        ) : (
          reorder.map((r: any, i) => (
            <InfoCard
              key={i}
              title={r.name || r.item_name}
              leftIcon={{ type: Icons.MaterialCommunityIcons, name: 'alert-circle-outline' }}
              badge={{ text: 'Reorder', color: 'warning' }}
              rows={[{ label: 'Quantity', value: r.quantity }, { label: 'Reorder level', value: r.reorder_level }]}
            />
          ))
        )}

        {section('Expired', expired.length)}
        {expired.map((r: any, i) => (
          <InfoCard key={i} title={r.item_name} subtitle={`Batch ${r.batch_number || '—'}`} badge={{ text: `Expired ${r.expiry_date}`, color: 'error' }} rows={[{ label: 'Quantity', value: r.quantity }]} />
        ))}

        {section('Expiring Soon', expiringSoon.length)}
        {expiringSoon.map((r: any, i) => (
          <InfoCard key={i} title={r.item_name} subtitle={`Batch ${r.batch_number || '—'}`} badge={{ text: `Until ${r.expiry_date}`, color: 'warning' }} rows={[{ label: 'Quantity', value: r.quantity }]} />
        ))}
      </ScrollView>
    </AppContainer>
  )
}

export default StockReports
