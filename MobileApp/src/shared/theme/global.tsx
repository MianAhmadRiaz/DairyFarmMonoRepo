import { StyleSheet } from 'react-native';
import { COLORS, THEME } from '.';

const GLOBAL_STYLE = StyleSheet.create({
  CENTER: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  MAIN: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: THEME.PADDING.LOW,
  },
  ROW: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default GLOBAL_STYLE;
