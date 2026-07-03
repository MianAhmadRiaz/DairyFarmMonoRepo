import React from 'react';
import { StyleSheet, View } from 'react-native';
import { PieChart } from 'react-native-svg-charts';
import AppText from 'shared/components/AppText/AppText';
import { COLORS } from 'shared/theme';
import { RF } from 'shared/theme/responsive';

const PieChartView = () => {
  // Data for the pie chart
  const data = [
    {
      key: 1,
      value: 60, // 21% Open
      svg: { fill: COLORS.secondaryLight }, // Green
    },
    {
      key: 2,
      value: 40, // Remaining empty area
      svg: { fill: COLORS.secondaryMain }, // Light background
      label: '',
    },
  ];

  // Custom labels

  return (
    <View style={styles.container}>
      <AppText semiBold fontSize="h7" style={styles.header}>
        Feed Stock
      </AppText>
      <PieChart
        style={{ height: RF(150), width: RF(150), marginBottom: RF(20) }}
        data={data}
        innerRadius="50%"
        outerRadius="100%"
      />

      <AppText fontSize="caption">60% (3,000 kg remaining)</AppText>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 0.5,
    borderColor: COLORS.primaryLight,
    marginHorizontal: RF(8),
    marginTop: RF(11),
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: RF(10),
    borderRadius: 10,
  },
  header: {
    marginLeft: RF(4),
    marginBottom: RF(4),
    alignSelf: 'flex-start',
  },
});

export default PieChartView;
