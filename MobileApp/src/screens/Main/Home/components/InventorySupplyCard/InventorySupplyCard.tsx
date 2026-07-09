import React from 'react';
import { useTranslation } from 'react-i18next';
import { SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';
import AppText from 'shared/components/AppText/AppText';
import { COLORS } from 'shared/theme';
import { RF } from 'shared/theme/responsive';

import BorderLine from 'shared/components/BorderLine/BorderLine';
import PieChartView from './PieChartView';

const InventorySupplyCard = () => {
  const { t } = useTranslation();
  return (
    <View style={styles.container}>
      <AppText semiBold fontSize="h7" style={styles.header}>
        {t('main.inventory.title')}
      </AppText>
      <BorderLine />

      <PieChartView />
    </View>
  );
};
export default InventorySupplyCard;
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
