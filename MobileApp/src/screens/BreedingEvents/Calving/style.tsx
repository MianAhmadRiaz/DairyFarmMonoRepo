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
  tableContainer: {
    backgroundColor: 'white',
    borderRadius: THEME.RADIUS.BOX,
    marginHorizontal: THEME.MARGIN.NORMAL,
    marginTop: THEME.MARGIN.NORMAL,
  },
  customContainer: {
  borderColor: COLORS.lightSilver, 
  borderRadius: THEME.RADIUS.SMALLBOX,
  height: RF(36),
  marginBottom: 0,
},
  reasonContainer: {
  borderColor: COLORS.lightSilver, 
  borderRadius: THEME.RADIUS.SMALLBOX,
  height: RF(56),
  marginBottom: 0,
},
  label:{
    color: COLORS.labelColor,
},
reasonText: {
    textAlignVertical: 'top',
    fontSize: THEME.FONTS.SIZE[11]
},
  placeholder: {
    fontSize: THEME.FONTS.SIZE[11]
},
  text:{
    marginLeft: 23,
  },
  underline: {
    textDecorationLine: 'underline'
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
    fontSize: THEME.FONTS.SIZE.subtitle,
},
  buttonText2: { 
      color: COLORS.darkGrey, 
      fontSize: THEME.FONTS.SIZE.subtitle,
},
 childHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: THEME.MARGIN.VERYLOW,
    marginRight: THEME.MARGIN.VERYLOW
},
  childContainer: {
    backgroundColor: COLORS.background,
    padding: THEME.PADDING.LOW,
    borderRadius: THEME.RADIUS.BOX,
    marginVertical: THEME.MARGIN.VERYLOW,
    marginHorizontal: THEME.MARGIN.NORMAL    
  },
  midContainer: {
    borderWidth: 1,
    borderRadius: THEME.RADIUS.BOX,
    borderColor: COLORS.lightSilver,
    marginHorizontal: THEME.MARGIN.NORMAL,
  },
});
export default styles;