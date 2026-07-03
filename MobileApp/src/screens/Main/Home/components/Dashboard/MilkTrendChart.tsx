import moment from 'moment'
import React from 'react'
import { Dimensions, View } from 'react-native'
import { LineChart } from 'react-native-chart-kit'
import AppText from 'shared/components/AppText/AppText'
import { COLORS } from 'shared/theme'
import { RF } from 'shared/theme/responsive'
import { MilkTrendPoint } from 'shared/services/dashboard.services'
import GlassCard from './GlassCard'

interface Props {
  data: MilkTrendPoint[]
}

const CHART_WIDTH = Dimensions.get('window').width - RF(64)

/**
 * 30-day milk trend — mirrors the web Overview tab's TrendLineChart
 * (green #4cceac area chart with gradient fill).
 */
const MilkTrendChart = ({ data }: Props) => {
  if (!data?.length) {
    return (
      <GlassCard title="30-Day Milk Trend">
        <View style={{ paddingVertical: RF(24), alignItems: 'center' }}>
          <AppText fontSize="h5">🧴</AppText>
          <AppText medium color="labelGrey" style={{ marginTop: RF(6) }}>
            No milk records yet
          </AppText>
        </View>
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
      <LineChart
        data={{ labels, datasets: [{ data: values }] }}
        width={CHART_WIDTH}
        height={RF(180)}
        bezier
        withDots={false}
        withInnerLines={false}
        withOuterLines={false}
        fromZero
        yAxisSuffix=" L"
        chartConfig={{
          backgroundGradientFrom: COLORS.white,
          backgroundGradientTo: COLORS.white,
          fillShadowGradientFrom: COLORS.chartGreen,
          fillShadowGradientFromOpacity: 0.28,
          fillShadowGradientTo: COLORS.white,
          fillShadowGradientToOpacity: 0.02,
          decimalPlaces: 0,
          color: () => COLORS.chartGreen,
          labelColor: () => COLORS.labelGrey,
          propsForLabels: { fontSize: RF(9) }
        }}
        style={{ marginLeft: -RF(8), borderRadius: RF(12) }}
      />
    </GlassCard>
  )
}

export default MilkTrendChart
