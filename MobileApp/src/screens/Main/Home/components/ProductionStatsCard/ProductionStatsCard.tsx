import React from 'react';
import { View, StyleSheet, Dimensions, FlatList } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import AppText from 'shared/components/AppText/AppText';
import ProductionStats from './ProductionStats';
import { RF } from 'shared/theme/responsive';
import { COLORS } from 'shared/theme';
import LineChartView from './LineChart';

const ProductionStatsCard = () => {
  return (
    <View style={styles.container}>
      <ProductionStats />
      <LineChartView />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: RF(12),
    marginBottom: RF(12),
    backgroundColor: COLORS.white,
    borderRadius: RF(12),
  },
});

export default ProductionStatsCard;
