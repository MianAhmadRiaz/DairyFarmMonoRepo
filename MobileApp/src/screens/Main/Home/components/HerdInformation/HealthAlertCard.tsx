import { ICONS } from 'assets/icons';
import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import FastImage from 'react-native-fast-image';
import AppText from 'shared/components/AppText/AppText';
import { COLORS } from 'shared/theme';
import { RF } from 'shared/theme/responsive';

const HealthAlertCard = () => {
  // Sample data for health alerts
  const alerts = [
    { id: '1', condition: 'Foot Rot', cases: 1, status: 'TREATED' },
    { id: '2', condition: 'Mastitis', cases: 1, status: 'UNTREATED' },
  ];

  // Function to render each alert
  const renderAlert = ({ item }: any) => {
    const size = RF(37);
    return (
      <View style={styles.alertCard}>
        <FastImage
          source={ICONS.WARNING}
          style={{ width: size, height: size, marginRight: RF(8) }}
          resizeMode="contain"
        />

        <View style={styles.textContainer}>
          <AppText fontSize="caption" semiBold>
            {item.condition}
          </AppText>
          <AppText fontSize="caption" medium color="descriptionColor">
            {item.cases} Case{item.cases > 1 ? 's' : ''}
          </AppText>
        </View>
        <View
          style={[
            styles.statusContainer,
            item.status === 'TREATED' ? styles.treated : styles.untreated,
          ]}
        >
          <AppText
            semiBold
            fontSize="11"
            style={[
              item.status === 'TREATED'
                ? styles.treatedText
                : styles.untreatedText,
            ]}
          >
            {item.status}
          </AppText>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <AppText semiBold style={styles.header}>
        Health Alerts
      </AppText>
      <FlatList
      scrollEnabled={false}
        data={alerts}
        keyExtractor={(item) => item.id}
        renderItem={renderAlert}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: RF(8),
    padding: RF(10),
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 0.5,
    borderColor: COLORS.primaryLight,
  },
  header: {
    marginBottom: 12,
  },
  alertCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },

  textContainer: {
    flex: 1,
  },

  statusContainer: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  treated: {
    backgroundColor: COLORS.secondaryLightest,
  },
  untreated: {
    backgroundColor: COLORS.errorFade,
  },

  treatedText: {
    color: COLORS.secondaryMain,
  },
  untreatedText: {
    color: COLORS.error,
  },
});

export default HealthAlertCard;
