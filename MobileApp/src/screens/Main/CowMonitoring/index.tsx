import React from 'react';
import {SafeAreaView, StyleSheet, View} from 'react-native';
import AppHeader from 'shared/components/AppHeader';
import {COLORS, THEME} from 'shared/theme';

import {RF} from 'shared/theme/responsive';
import {GenericNavigation} from 'shared/utils/models/types';

function CowMonitoring(props: GenericNavigation) {
  return (
    <>
      <SafeAreaView style={styles.container} />
      {/* {loading && <AppLoader isVisible />} */}
      <AppHeader showBack title="Cow Monitoring" />
      <View style={{flex: 1, backgroundColor: 'white', padding: RF(10)}}></View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.primaryBlue,
  },
});

export default CowMonitoring;
