import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';
import AppText from 'shared/components/AppText/AppText';
import { COLORS } from 'shared/theme';
import { RF } from 'shared/theme/responsive';

import BorderLine from 'shared/components/BorderLine/BorderLine';
import UpcomingTasks from './UpcomingTasks';
import AdditionalKpis from './AdditionalKpis';

const UpcomingTasksCard = () => {
  return (
    <View style={styles.container}>
      <AppText semiBold fontSize="h7" style={styles.header}>
        Upcoming Tasks/ Additional KPIs
      </AppText>
      <BorderLine />

      <UpcomingTasks />
      <AdditionalKpis />
    </View>
  );
};
export default UpcomingTasksCard;
const styles = StyleSheet.create({
  container: {
    paddingVertical: RF(12),
    backgroundColor: COLORS.white,
    borderRadius: RF(12),
    marginBottom: RF(12),
  },
  header: {
    paddingBottom: 12,
    marginLeft: RF(14),
  },
});
