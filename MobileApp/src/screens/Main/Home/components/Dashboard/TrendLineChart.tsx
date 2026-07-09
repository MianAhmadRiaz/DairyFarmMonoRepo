import React from 'react'
import { LineChart } from 'react-native-chart-kit'
import { COLORS } from 'shared/theme'
import { RF } from 'shared/theme/responsive'
import { CHART_WIDTH } from './utils'

export interface LineSeries {
  data: number[]
  color: string
  name?: string
}

interface Props {
  labels: string[]
  series: LineSeries[]
  height?: number
  ySuffix?: string
  showLegend?: boolean
  area?: boolean
}

/**
 * Generic multi-series line chart — the mobile counterpart of the web's
 * TrendLineChart (Recharts): gradient area fill, theme-muted axes.
 */
const TrendLineChart = ({
  labels,
  series,
  height = RF(200),
  ySuffix = '',
  showLegend,
  area = true
}: Props) => (
  <LineChart
    data={{
      labels,
      datasets: series.map(s => ({
        data: s.data,
        color: () => s.color,
        strokeWidth: 2
      })),
      legend: showLegend ? series.map(s => s.name ?? '') : undefined
    }}
    width={CHART_WIDTH}
    height={height}
    bezier
    withDots={series.some(s => s.data.length <= 14)}
    withInnerLines={false}
    withOuterLines={false}
    fromZero
    yAxisSuffix={ySuffix}
    chartConfig={{
      backgroundGradientFrom: COLORS.white,
      backgroundGradientTo: COLORS.white,
      fillShadowGradientFrom: area ? series[0]?.color : COLORS.white,
      fillShadowGradientFromOpacity: area ? 0.25 : 0,
      fillShadowGradientTo: COLORS.white,
      fillShadowGradientToOpacity: 0.02,
      decimalPlaces: 0,
      color: () => series[0]?.color ?? COLORS.chartGreen,
      labelColor: () => COLORS.labelGrey,
      propsForDots: { r: '3' },
      propsForLabels: { fontSize: RF(9) }
    }}
    style={{ marginLeft: -RF(8), borderRadius: RF(12) }}
  />
)

export default TrendLineChart
