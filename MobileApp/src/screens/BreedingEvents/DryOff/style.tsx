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
  boxContainer: {
    backgroundColor: 'white',
    borderRadius: THEME.RADIUS.BOX,
    marginHorizontal: THEME.MARGIN.NORMAL,
    marginTop: THEME.MARGIN.NORMAL,
  },
   midContainer: {
    backgroundColor: COLORS.background,
    borderRadius: THEME.RADIUS.BOX,
    marginHorizontal: THEME.MARGIN.NORMAL,
    marginTop: THEME.MARGIN.NORMAL,
  },
  text:{
    marginLeft: 23
  },
  customContainer: {
  borderColor: COLORS.lightSilver, 
  borderRadius: THEME.RADIUS.SMALLBOX,
  height: RF(36),
  marginBottom: 0,
},
  label:{
    color: COLORS.labelColor,
},
  placeholder: {
    fontSize: THEME.FONTS.SIZE[11]
},
  buttonContainer: {
    flexDirection: 'row',
    marginTop: THEME.MARGIN.NORMAL,
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
    fontSize: 14,
},
  buttonText2: { 
      color: COLORS.darkGrey, 
      fontSize: 14,
},
});
export default styles;