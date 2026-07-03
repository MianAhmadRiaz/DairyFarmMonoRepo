import React from 'react';
import {View, Dimensions, StyleSheet} from 'react-native';
import {LineChart} from 'react-native-chart-kit';

const LineChartCard = () => {
  const screenWidth = Dimensions.get('window').width;

  const chartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'], // X-axis labels
    datasets: [
      {
        data: [20, 45, 28, 80, 99, 43], // Y-axis values
        strokeWidth: 2, // Line thickness
      },
    ],
  };

  const chartConfig = {
    backgroundColor: '#f5f5f5',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 0, // No decimal places
    color: (opacity = 1) => `rgba(0, 123, 255, ${opacity})`, // Line color
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`, // Label color
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '4', // Dot radius
      strokeWidth: '2',
      stroke: '#007BFF', // Dot border color
    },
  };

  return (
    <View style={styles.container}>
      <LineChart
        data={chartData}
        width={screenWidth - 20} // Full width with some margin
        height={220} // Chart height
        chartConfig={chartConfig}
        bezier // Adds smooth curves
        style={styles.chart}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 20,
  },
  chart: {
    borderRadius: 16,
  },
});

export default LineChartCard;
