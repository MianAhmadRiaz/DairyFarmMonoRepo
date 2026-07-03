import React from 'react';
import { StyleSheet, View } from 'react-native';
import { COLORS } from 'shared/theme';
import { RF } from 'shared/theme/responsive';

const BorderLine = () => {
  return <View style={styles.borderline} />;
};
export default BorderLine;
const styles = StyleSheet.create({
  borderline: { borderWidth: 0.5, borderColor: COLORS.primaryLight },
});
