import {StyleSheet} from 'react-native';
import {COLORS, THEME} from '../../../shared/theme';
import { RF } from 'shared/theme/responsive';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F8F7',
  },
   top: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: THEME.PADDING.NORMAL,
  },
  languageButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
   card: {
    backgroundColor: 'white',
    padding: THEME.PADDING.NORMAL,
    borderRadius: THEME.RADIUS.SMALLBOX,
    marginTop: THEME.MARGIN.NORMAL,
    marginHorizontal: THEME.MARGIN.NORMAL
  },
    buttonContainer: {
    flexDirection: 'row',
    marginTop: THEME.MARGIN.NORMAL,
    marginHorizontal: THEME.MARGIN.MID_LOW
  },
    button1: {
    backgroundColor: COLORS.primaryMain,
    borderRadius: THEME.RADIUS.BOX,
    flex: 1, 
    height: RF(42),
    marginRight: THEME.MARGIN.NORMAL, 
    alignItems: 'center',
    marginHorizontal: THEME.MARGIN.VERYLOW
  },
   button2: {
    backgroundColor: COLORS.mediumGrey,
    borderRadius: THEME.RADIUS.BOX,
    flex: 1, 
    height: RF(42),
    marginLeft: THEME.MARGIN.NORMAL, 
    alignItems: 'center',
    marginHorizontal: THEME.MARGIN.VERYLOW
  },
   buttonText1: { 
    color: 'white', 
    fontSize: THEME.FONTS.SIZE.subtitle,
  },
  buttonText2: { 
    color: COLORS.darkGrey, 
    fontSize: THEME.FONTS.SIZE.subtitle,
  },
  textStyle: {
    gap:4, 
    marginBottom: THEME.MARGIN.MID_LOW,
  }
});
export default styles;