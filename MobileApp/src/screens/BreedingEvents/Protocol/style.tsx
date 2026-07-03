import {StyleSheet} from 'react-native';
import {COLORS, THEME} from '../../../shared/theme';
import { RF } from 'shared/theme/responsive';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
   top: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  languageButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label:{
    color: COLORS.labelColor,
  },
  placeholder: {
    fontSize: THEME.FONTS.SIZE[11]
  },
    button1: {
    backgroundColor: COLORS.primaryMain,
    borderRadius: THEME.RADIUS.BOX,
    flex: 1, 
    height: RF(42),
    marginRight: 5, 
    alignItems: 'center',
    marginHorizontal:15 
  },
   button2: {
    backgroundColor: COLORS.mediumGrey,
    borderRadius: THEME.RADIUS.BOX,
    flex: 1, 
    height: RF(42),
    marginLeft: 5, 
    alignItems: 'center',
    marginHorizontal:15 
  },
   buttonText1: { 
    color: 'white', 
    fontSize: 14,
},
buttonText2: { 
    color: COLORS.darkGrey, 
    fontSize: 14,
},
table: { 
    backgroundColor: "white", 
    padding: 10, 
    alignSelf: 'center', 
    width: "93%",
},
  tableHeader: { 
    flexDirection: "row", 
    backgroundColor: "white", 
},
tableHeaderText: { 
    flex: 2, 
    textAlign: "left", 
},
particularHeaderText: {
    flex: 3, 
    textAlign: "left", 
},
tableRow: { 
    flexDirection: "row", 
    paddingVertical: 10, 
},
tableCell: { 
    flex: 2, 
    textAlign: 'left',
    color:COLORS.darkestGrey, 
    fontSize:THEME.FONTS.SIZE[10],
    fontFamily:THEME.FONTS.TYPE.BOLD
},
particularTableCell: { 
    flex: 3, 
    textAlign: 'left',
    color:COLORS.darkestGrey, 
    fontSize:THEME.FONTS.SIZE[10],
    fontFamily:THEME.FONTS.TYPE.BOLD
},
customContainer: {
  borderColor: COLORS.lightSilver, 
  borderRadius: THEME.RADIUS.SMALLBOX,
  height: RF(36),
},
});
export default styles;