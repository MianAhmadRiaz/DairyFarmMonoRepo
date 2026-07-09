import React, { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useFocusEffect } from '@react-navigation/native'
import InfoCard from 'shared/components/InfoCard'
import ListScreen from 'shared/components/ListScreen'
import { Icons } from 'shared/components/AnyIcon'
import { getStockItems } from 'shared/services/stock.services'
import Toast from 'react-native-toast-message'
import { getNormalizedError } from 'shared/services/helper.services'

const StockItems = () => {
  const { t } = useTranslation()
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  const load = useCallback(async () => {
    try {
      setLoading(true)
      const res = await getStockItems({ limit: 200 })
      setItems(res?.data?.data?.items || [])
    } catch (e) {
      Toast.show({ type: 'error', text1: t('stock.common.error'), text2: getNormalizedError(e) })
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useFocusEffect(useCallback(() => { load() }, [load]))

  return (
    <ListScreen
      title={t('stock.stockItems.title')}
      data={items}
      loading={loading}
      refreshing={refreshing}
      onRefresh={() => { setRefreshing(true); load() }}
      keyExtractor={(item: any, i) => item.uuid || String(i)}
      emptyText={t('stock.stockItems.empty')}
      renderItem={({ item }: any) => {
        const qty = item.stockLevel?.quantity ?? item.quantity ?? 0
        const reorder = item.reorder_level ?? 0
        const low = reorder > 0 && qty <= reorder
        return (
          <InfoCard
            title={item.name}
            subtitle={item.category_name || item.category?.name}
            leftIcon={{ type: Icons.MaterialCommunityIcons, name: 'package-variant' }}
            badge={low ? { text: t('stock.stockItems.low'), color: 'error' } : undefined}
            rows={[
              { label: t('stock.common.quantity'), value: `${qty} ${item.unit_of_measure || ''}` },
              { label: t('stock.common.reorderLevel'), value: reorder }
            ]}
          />
        )
      }}
    />
  )
}

export default StockItems
