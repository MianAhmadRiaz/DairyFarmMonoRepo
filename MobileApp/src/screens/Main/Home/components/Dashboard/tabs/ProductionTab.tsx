import moment from 'moment'
import React, { useEffect, useState } from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'
import AppText from 'shared/components/AppText/AppText'
import {
  fetchMilkDashboard,
  MilkDashboard
} from 'shared/services/dashboard.services'
import { COLORS } from 'shared/theme'
import { RF } from 'shared/theme/responsive'
import EmptyState from '../EmptyState'
import GlassCard from '../GlassCard'
import StatTile from '../StatTile'
import TabLoader from '../TabLoader'
import TrendLineChart from '../TrendLineChart'
import { fmtNum } from '../utils'

type Filter = 'week' | 'month' | 'year'

interface Props {
  refreshKey: number
}

const FILTERS: Filter[] = ['week', 'month', 'year']

const rangeStart = (filter: Filter) => {
  if (filter === 'week') return moment().subtract(7 * 12, 'days')
  if (filter === 'month') return moment().subtract(12, 'months')
  return moment().subtract(3, 'years')
}

const labelFormat = (filter: Filter) =>
  filter === 'year' ? 'YYYY' : filter === 'month' ? 'MMM' : 'D MMM'

/**
 * Production tab — mirrors the web ProductionTab: 4 KPI tiles + milk
 * production trend chart with a week/month/year range filter.
 */
const ProductionTab = ({ refreshKey }: Props) => {
  const [filter, setFilter] = useState<Filter>('week')
  const [milkInfo, setMilkInfo] = useState<MilkDashboard | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetchMilkDashboard(
      filter,
      rangeStart(filter).format('YYYY-MM-DD'),
      moment().format('YYYY-MM-DD')
    )
      .then(setMilkInfo)
      .catch(() => setMilkInfo(null))
      .finally(() => setLoading(false))
  }, [filter, refreshKey])

  const trendData = milkInfo?.milkData ?? []
  const step = Math.max(1, Math.ceil(trendData.length / 5))
  const labels = trendData.map((d, i) =>
    i % step === 0 ? moment(d.period).format(labelFormat(filter)) : ''
  )
  const values = trendData.map(d => Number(d.total_milk) || 0)

  const tiles = [
    { icon: '🥛', label: "Today's Milk", value: fmtNum(milkInfo?.today_total_milk, ' L') },
    { icon: '📅', label: 'Yesterday', value: fmtNum(milkInfo?.yesterday_total_milk, ' L') },
    { icon: '📊', label: 'Avg / Cow', value: fmtNum(milkInfo?.avg_milk_per_cow, ' L') },
    { icon: '🧮', label: 'Range Total', value: fmtNum(milkInfo?.currentFilterMilk, ' L') }
  ]

  return (
    <>
      <View style={styles.tileGrid}>
        {tiles.map(t => (
          <StatTile key={t.label} {...t} loading={loading} />
        ))}
      </View>

      <GlassCard
        title="Milk Production Trend"
        right={
          <View style={styles.filterRow}>
            {FILTERS.map(f => {
              const active = f === filter
              return (
                <TouchableOpacity
                  key={f}
                  onPress={() => setFilter(f)}
                  style={[styles.filterPill, active && styles.filterPillActive]}
                >
                  <AppText
                    semiBold
                    fontSize="10"
                    color={active ? 'white' : 'textLight'}
                    style={{ textTransform: 'capitalize' }}
                  >
                    {f}
                  </AppText>
                </TouchableOpacity>
              )
            })}
          </View>
        }
      >
        {loading ? (
          <TabLoader />
        ) : values.length ? (
          <TrendLineChart
            labels={labels}
            series={[{ data: values, color: COLORS.chartGreen, name: 'Milk (L)' }]}
            ySuffix=" L"
            height={RF(220)}
          />
        ) : (
          <EmptyState title="No milk records in this range" icon="📈" />
        )}
      </GlassCard>
    </>
  )
}

const styles = StyleSheet.create({
  tileGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between'
  },
  filterRow: { flexDirection: 'row' },
  filterPill: {
    paddingHorizontal: RF(10),
    paddingVertical: RF(5),
    borderRadius: RF(14),
    backgroundColor: COLORS.lightGrey,
    marginLeft: RF(6)
  },
  filterPillActive: {
    backgroundColor: COLORS.primaryMain
  }
})

export default ProductionTab
