import moment from 'moment'
import React from 'react'
import { COLORS } from 'shared/theme'
import { MilkTrendPoint } from 'shared/services/dashboard.services'
import EmptyState from './EmptyState'
import GlassCard from './GlassCard'
import TrendLineChart from './TrendLineChart'

interface Props {
  data: MilkTrendPoint[]
}

/**
 * 30-day milk trend — mirrors the web Overview tab's TrendLineChart
 * (green #4cceac area chart with gradient fill).
 */
const MilkTrendChart = ({ data }: Props) => {
  if (!data?.length) {
    return (
      <GlassCard title="30-Day Milk Trend">
        <EmptyState title="No milk records yet" icon="🧴" />
      </GlassCard>
    )
  }

  // Sparse x-axis labels so 30 points stay readable on a phone
  const step = Math.max(1, Math.ceil(data.length / 5))
  const labels = data.map((d, i) =>
    i % step === 0 ? moment(d.period).format('D MMM') : ''
  )
  const values = data.map(d => Number(d.total_milk) || 0)

  return (
    <GlassCard title="30-Day Milk Trend" subtitle="Total litres per day">
      <TrendLineChart
        labels={labels}
        series={[{ data: values, color: COLORS.chartGreen, name: 'Milk (L)' }]}
        ySuffix=" L"
      />
    </GlassCard>
  )
}

export default MilkTrendChart
