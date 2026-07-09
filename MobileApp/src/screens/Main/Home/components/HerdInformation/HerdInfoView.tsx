import React from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import AppText from 'shared/components/AppText/AppText';

import FastImage from 'react-native-fast-image';
import { RF, WP } from 'shared/theme/responsive';
import { ICONS } from 'assets/icons';
const dashboardData = [
  { labelKey: 'main.herdInfo.currentAnimals', value: '230', icon: ICONS.COW },
  { labelKey: 'main.herdInfo.pregnantAnimals', value: '230', icon: ICONS.BABY },
  {
    labelKey: 'main.herdInfo.nonPregnantAnimals',
    value: '230',
    icon: ICONS.BABY_RED,
  },
  { labelKey: 'main.herdInfo.unjoinedHeifers', value: '230', icon: ICONS.BULL },
  { labelKey: 'main.herdInfo.milkingCows', value: '230', icon: ICONS.MILK_COW },
  { labelKey: 'main.herdInfo.dryCows', value: '230', icon: ICONS.DRY_COW },
];
const HerdInfoCard = (props: any) => {
  const size = RF(37);
  return (
    <View style={styles.card}>
      <FastImage
        source={props?.icon}
        style={{ width: size, height: size, marginRight: RF(8) }}
        resizeMode="contain"
      />
      <View>
        <AppText bold color="textLight">
          {props?.value}
        </AppText>
        <AppText
          fontSize="11"
          color="textLight"
          style={{ opacity: 0.8 }}
          medium
        >
          {props?.label}
        </AppText>
      </View>
    </View>
  );
};
const HerdInfoCardsView = ({ data }: any) => {
  const { t } = useTranslation();
  return (
    <View style={styles.grid}>
      {dashboardData.map((item: any, index: any) => (
        <HerdInfoCard
          key={index}
          label={t(item.labelKey)}
          value={item.value}
          icon={item.icon}
        />
      ))}
    </View>
  );
};

export default HerdInfoCardsView;

const styles = StyleSheet.create({
  grid: {
    paddingVertical: RF(11),
    marginHorizontal: RF(10),
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between', // Evenly space the cards
  },
  card: {
    flexDirection: 'row',
    width: WP(40), // Each card takes up almost half of the width
    marginBottom: RF(10), // Space between rows
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center',
  },
  value: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 10,
  },
});
