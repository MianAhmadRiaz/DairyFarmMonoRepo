import React from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { PieChart } from 'react-native-svg-charts';
import AppText from 'shared/components/AppText/AppText';
import { COLORS } from 'shared/theme';
import { RF } from 'shared/theme/responsive';

const PieChartCard = () => {
  const { t } = useTranslation();
  // Data for the pie chart
  const data = [
    {
      key: 1,
      value: 21, // 21% Open
      svg: { fill: COLORS.primaryLight }, // Green
      label: '21% Open',
    },
    {
      key: 2,
      value: 21, // Remaining empty area
      svg: { fill: COLORS.secondaryMain }, // Light background
      label: '',
    },
    {
      key: 3,
      value: 12, // 12% Pregnant
      svg: { fill: COLORS.primaryMain }, // Dark blue
      label: '12% Pregnant',
    },
  ];

  // Custom labels

  return (
    <View style={styles.container}>
      <PieChart
        style={{ height: RF(150), width: RF(150) }}
        data={data}
        innerRadius="50%"
        outerRadius="100%"
      />
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View
            style={[
              styles.legendColor,
              { backgroundColor: COLORS.primaryMain },
            ]}
          />
          <AppText fontSize="caption">
            {t('main.herdPieChart.pregnant', { percent: 12 })}
          </AppText>
        </View>
        <View style={styles.legendItem}>
          <View
            style={[
              styles.legendColor,
              { backgroundColor: COLORS.secondaryMain },
            ]}
          />
          <AppText fontSize="caption">
            {t('main.herdPieChart.open', { percent: 21 })}
          </AppText>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 0.5,
    borderColor: COLORS.primaryLight,
    marginHorizontal: RF(8),
    marginBottom: RF(11),
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: RF(10),
    borderRadius: 10,
  },
  legend: {
    marginLeft: 16,
    alignItems: 'flex-start',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  legendColor: {
    width: 12,
    height: 12,
    marginRight: 8,
    borderRadius: 10,
  },
});

export default PieChartCard;
