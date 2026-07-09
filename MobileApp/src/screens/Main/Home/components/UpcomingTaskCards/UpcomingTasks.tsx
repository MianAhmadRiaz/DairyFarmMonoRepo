import React from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, StyleSheet, View } from 'react-native';
import AnyIcon, { Icons } from 'shared/components/AnyIcon';
import AppText from 'shared/components/AppText/AppText';
import BorderLine from 'shared/components/BorderLine/BorderLine';
import { COLORS } from 'shared/theme';
import GLOBAL_STYLE from 'shared/theme/global';
import { RF } from 'shared/theme/responsive';

const UpcomingTasks = () => {
  const { t } = useTranslation();
  const productionStats = [
    { id: '1', label: 'Dry Off', description: '2 cows', timeStamp: new Date() },
    { id: '2', label: 'Dry Off', description: '2 cows', timeStamp: new Date() },
    { id: '3', label: 'Dry Off', description: '2 cows', timeStamp: new Date() },
    { id: '4', label: 'Dry Off', description: '2 cows', timeStamp: new Date() },
    { id: '5', label: 'Dry Off', description: '2 cows', timeStamp: new Date() },
    { id: '6', label: 'Dry Off', description: '2 cows', timeStamp: new Date() },
  ];

  const StatusCard = ({ status }: any) => {
    const statusColor = 'error';
    const statusBackgroundColor = COLORS.errorFade;
    return (
      <View
        style={[
          styles.statusContainer,
          { backgroundColor: statusBackgroundColor },
        ]}
      >
        <AppText color={statusColor} semiBold fontSize="11">
          {status}
        </AppText>
      </View>
    );
  };
  const renderItem = ({ item }: any) => (
    <View style={styles.statItem}>
      <View style={GLOBAL_STYLE.ROW}>
        <View style={styles.dateView}>
          <AppText fontSize="11" medium>
            NOV
          </AppText>
          <AppText>1</AppText>
        </View>

        <View style={{ marginLeft: RF(10) }}>
          <AppText fontSize="subtitle" semiBold style={styles.label}>
            {item.label}
          </AppText>

          <AppText
            fontSize="caption"
            semiBold
            color="labelGrey"
            style={styles.label}
          >
            {item.description}
          </AppText>
        </View>
      </View>
      <StatusCard status={t('main.upcomingTasks.tomorrow')} />
    </View>
  );
  return (
    <View style={styles.container}>
      <AppText semiBold fontSize="h7" style={styles.header}>
        {t('main.upcomingTasks.title')}
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
export default UpcomingTasks;

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
  dateView: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primaryLight,
    borderRadius: 100,
    height: RF(35),
    width: RF(35),
  },
});
