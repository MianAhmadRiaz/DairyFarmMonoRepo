import {StyleSheet} from 'react-native';
import {RF} from 'shared/theme/responsive';
import {COLORS, THEME} from '../../../shared/theme';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mainContainer: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  topContainer: {
    
    flex: 0.6,
    justifyContent: 'center',
    alignItems: 'center',
    
  },
  
  bottomContainer: {
    borderTopLeftRadius: THEME.RADIUS.OVAL,
    borderTopRightRadius: THEME.RADIUS.OVAL,
    overflow:"hidden",
    flex: 1,
    paddingHorizontal: THEME.PADDING.MID_LOW,
    backgroundColor: COLORS.primaryLight,
    
  },
  inputView: {marginVertical: THEME.MARGIN.VERYHIGH},
  
  
  inputStyle: {
    color:"red",
    borderColor: COLORS.primaryMain,
    backgroundColor:"white",

  },
  forgotPassword: {
    
    alignSelf: 'flex-end',
    
    marginRight: THEME.MARGIN.NORMAL,
  },
  buttonStyle: {
    backgroundColor:COLORS.primaryMain,
    
  },
  buttonText: {color: COLORS.white},
  noAccountText: {
    color: COLORS.white,
    alignSelf: 'flex-end',
    fontSize: THEME.FONTS.SIZE.XXSMALL,

    marginRight: THEME.MARGIN.NORMAL,
  },
  errors: {
    fontSize: THEME.FONTS.SIZE.XXXSMALL,
    color: COLORS.error,
    marginLeft: RF(10),
  },
});
export default styles;
