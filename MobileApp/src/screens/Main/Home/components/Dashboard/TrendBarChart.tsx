import React from 'react'
import { BarChart } from 'react-native-chart-kit'
import { COLORS } from 'shared/theme'
import { RF } from 'shared/theme/responsive'
import { CHART_WIDTH } from './utils'

interface Props {
  labels: string[]
  data: number[]
  color?: string
  height?: number
}

/**
 * Vertical bar chart — mobile counterpart of the web's TrendBarChart.
 */
const TrendBarChart = ({
  labels,
  data,
  color = COLORS.chartBlue,
  height = RF(210)
}: Props) => (
  <BarChart
    data={{ labels, datasets: [{ data }] }}
    width={CHART_WIDTH}
    height={height}
    fromZero
    showValuesOnTopOfBars
    withInnerLines={false}
    yAxisLabel=""
    yAxisSuffix=""
    verticalLabelRotation={labels.some(l => l.length > 8) ? 18 : 0}
    chartConfig={{
      backgroundGradientFrom: COLORS.white,
      backgroundGradientTo: COLORS.white,
      fillShadowGradientFrom: color,
      fillShadowGradientFromOpacity: 1,
      fillShadowGradientTo: color,
      fillShadowGradientToOpacity: 1,
      decimalPlaces: 0,
      color: () => color,
      labelColor: () => COLORS.labelGrey,
      barPercentage: 0.65,
      propsForLabels: { fontSize: RF(9) }
    }}
    style={{ marginLeft: -RF(8), borderRadius: RF(12) }}
  />
)

export default TrendBarChart
