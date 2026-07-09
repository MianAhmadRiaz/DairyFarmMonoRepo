import { ICONS } from 'assets/icons';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, StyleSheet, View } from 'react-native';
import FastImage from 'react-native-fast-image';
import AnyIcon, { Icons } from 'shared/components/AnyIcon';
import AppText from 'shared/components/AppText/AppText';
import BorderLine from 'shared/components/BorderLine/BorderLine';
import { COLORS } from 'shared/theme';
import GLOBAL_STYLE from 'shared/theme/global';
import { RF } from 'shared/theme/responsive';

const AdditionalKpis = () => {
  const { t } = useTranslation();
  const productionStats = [
    {
      id: '1',
      label: t('main.additionalKpis.conceptionRate'),
      value: '41.2%',
    },
    {
      id: '2',
      label: t('main.additionalKpis.ageAtFirstCalving'),
      value: '24m',
    },
    {
      id: '3',
      label: t('main.additionalKpis.mortalityRate'),
      value: '1.8%',
    },
    {
      id: '4',
      label: t('main.additionalKpis.abortionRatio'),
      value: '4.75',
    },
    { id: '5', label: t('main.additionalKpis.costPerLiter'), value: '$0.36' },
  ];
  const size = RF(30);
  const renderItem = ({ item }: any) => (
    <View style={styles.statItem}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <FastImage
          source={ICONS.KPIS}
          style={{ width: size, height: size, marginRight: RF(8) }}
          resizeMode="contain"
        />

        <AppText fontSize="subtitle">{item.label}</AppText>
      </View>
      <AppText fontSize="subtitle">{item.value}</AppText>
    </View>
  );
  return (
    <View style={styles.container}>
      <AppText semiBold fontSize="h7" style={styles.header}>
        {t('main.additionalKpis.title')}
      </AppText>

      <FlatList
      scrollEnabled={false}
        data={productionStats}
        renderItem={renderItem}
        keyExtractor={(item: any) => item.id}
      />
    </View>
  );
};
export default AdditionalKpis;

const styles = StyleSheet.create({
  container: {
    borderWidth: 0.5,
    borderColor: COLORS.primaryLight,
    marginHorizontal: RF(8),
    marginVertical: RF(11),
    flex: 1,

    // alignItems: 'center',
    justifyContent: 'center',
    padding: RF(10),
    borderRadius: 12,
  },
  statusContainer: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  header: {
    paddingBottom: RF(20),
    // marginLeft: RF(14),
  },

  statItem: {
    justifyContent: 'space-between',
    // borderWidth: 1,
    flexDirection: 'row',
    marginBottom: RF(10),
    // padding: RF(10),
    alignItems: 'center',
  },
  label: {
    opacity: 0.8,
  },

  trendValue: {
    marginRight: RF(2),
  },
});
