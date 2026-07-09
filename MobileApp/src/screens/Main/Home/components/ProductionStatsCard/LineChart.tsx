import React from 'react';
import { useTranslation } from 'react-i18next';
import { Dimensions, StyleSheet, View } from 'react-native';

import { LineChart } from 'react-native-chart-kit';
import AppText from 'shared/components/AppText/AppText';
import { COLORS, THEME } from 'shared/theme';
import { RF } from 'shared/theme/responsive';

const LineChartView = () => {
  const { t } = useTranslation();
  const chartData = {
    labels: [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ],
    datasets: [
      {
        data: [
          2000, 2100, 2200, 2400, 5000, 2500, 3000, 4000, 2000, 3000, 4000,
          2000,
        ],
        strokeWidth: 2, // Line thickness
      },
    ],
  };
  return (
    <View style={styles.chartContainer}>
      <AppText fontSize="subtitle" semiBold style={styles.chartHeader}>
        {t('main.milkTrend.title', { period: 'December 2024' })}
      </AppText>
      <AppText
        fontSize="caption"
        color="labelGrey"
        medium
        style={styles.yAxisLabel}
      >
        {t('main.milkTrend.yAxis')}
      </AppText>
      <View>
        <LineChart
          bezier
          data={chartData}
          width={Dimensions.get('window').width - 60} // Full width minus padding
          height={220}
          fromZero
          withDots={false}
          withOuterLines={false}
          withInnerLines={false}
          yAxisInterval={1} // Ensures y-axis labels are evenly spaced
          yAxisSuffix="" // No suffix; adjust if needed (e.g., ' L', '%')
          formatYLabel={(value: any) => {
            // Custom formatting for y-axis labels
            const fixedLabels = [0, 1000, 2000, 3000, 4000, 5000, 6000];
            const roundedValue = fixedLabels.find(
              (label) => Math.abs(label - value) <= 1000,
            ); // Adjust for rounding threshold if needed
            return roundedValue || value;
          }}
          chartConfig={{
            // labels = 'hello',
            fillShadowGradientFrom: COLORS.secondaryLight,
            fillShadowGradientFromOpacity: 0.5,
            fillShadowGradientTo: COLORS.white,
            backgroundGradientFrom: '#FFFFFF',
            backgroundGradientTo: '#FFFFFF',
            decimalPlaces: 0, // Number of decimal places in data
            color: () => COLORS.secondaryMain,
            labelColor: (opacity = 1) => `rgba(102, 102, 102, ${opacity})`, // Label color
            style: {
              //   borderRadius: 8,
            },

            propsForLabels: {
              fontFamily: THEME.FONTS.TYPE.REGULAR,
              fontSize: RF(8),
            },
          }}
        />
        <AppText
          fontSize="caption"
          color="labelGrey"
          medium
          style={styles.xAxisLabel}
        >
          {t('main.milkTrend.xAxis')}
        </AppText>
      </View>
    </View>
  );
};

export default LineChartView;
const styles = StyleSheet.create({
  chartContainer: {
    borderWidth: 0.5,
    borderColor: COLORS.primaryLight,
    marginHorizontal: RF(8),
    marginBottom: RF(11),
    flex: 1,

    alignItems: 'center',
    justifyContent: 'center',
    padding: RF(10),
    borderRadius: 12,
  },
  chartHeader: {
    marginBottom: RF(20),
    alignSelf: 'flex-start',
  },
  xAxisLabel: {
    alignSelf: 'center',
  },
  yAxisLabel: {
    zIndex: 100000,
    position: 'absolute',
    left: -20,
    transform: [{ rotate: '-90deg' }],
  },
});
