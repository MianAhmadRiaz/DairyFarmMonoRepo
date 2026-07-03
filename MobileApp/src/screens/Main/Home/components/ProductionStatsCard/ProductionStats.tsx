import React from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import AnyIcon, { Icons } from 'shared/components/AnyIcon';
import AppText from 'shared/components/AppText/AppText';
import BorderLine from 'shared/components/BorderLine/BorderLine';
import { COLORS } from 'shared/theme';
import GLOBAL_STYLE from 'shared/theme/global';
import { RF } from 'shared/theme/responsive';

const ProductionStats = () => {
  const productionStats = [
    { id: '1', label: "Today's Milk (L)", value: '2,750' },
    { id: '2', label: "Yesterday's Milk (L)", value: '2,750' },
    { id: '3', label: 'Avg/Cow (L)', value: '23.5' },
    { id: '4', label: 'Trend', value: '+2%' },
  ];

  const renderItem = ({item}:any ) => (
    <View style={styles.statItem}>
      <AppText fontSize="caption" color="textLight" medium style={styles.label}>
        {item.label}
      </AppText>

      {item.label == 'Trend' ? (
        <View style={GLOBAL_STYLE.ROW}>
          <AppText
            fontSize="h6"
            medium
            color={item.value.includes('+') ? 'secondaryMain' : 'error'}
            style={[styles.trendValue]}
          >
            {item.value}
          </AppText>
          <AnyIcon
            disabled
            name={item.value.includes('+') ? 'arrow-up' : 'arrow-down'}
            type={Icons.FontAwesome5}
            size={15}
            color={
              item.value.includes('+') ? COLORS.secondaryMain : COLORS.error
            }
          />
        </View>
      ) : (
        <AppText fontSize="h6" semiBold color="textLight">
          {item.value}
        </AppText>
      )}
    </View>
  );
  return (
    <View>
      <AppText semiBold fontSize="h7" style={styles.header}>
        Production Stats
      </AppText>
      <BorderLine />
      <FlatList
      scrollEnabled={false}
        data={productionStats}
        renderItem={renderItem}
        keyExtractor={(item: any) => item.id}
        numColumns={2}
        contentContainerStyle={styles.grid}
      />
    </View>
  );
};
export default ProductionStats;

const styles = StyleSheet.create({
  grid: {
    paddingVertical: RF(11),
    marginHorizontal: RF(10),
    justifyContent: 'space-between',
  },
  header: {
    paddingBottom: 12,
    marginLeft: RF(14),
  },

  statItem: {
    flex: 1,
    marginBottom: RF(10),
    paddingLeft: RF(10),
    alignItems: 'flex-start',
  },
  label: {
    marginBottom: RF(4),
    opacity: 0.8,
  },

  trendValue: {
    marginRight: RF(2),
  },
});
