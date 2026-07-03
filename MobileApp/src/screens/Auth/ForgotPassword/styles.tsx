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
    width: '100%',
    
  },
  backbuttonStyle: {
    borderWidth:2,
    borderColor: COLORS.primaryMain,
    marginVertical: THEME.MARGIN.SUPERLOW,
    width: '90%',
    alignItems: 'center',
  },
  sendButton: {
    borderWidth: 0,
    marginVertical: THEME.MARGIN.SUPERLOW,
    backgroundColor: COLORS.primaryMain,
    width: '90%',
    alignItems: 'center',
  },
  mainIcon: {
    width: '100%',
    height: '100%',
    
  },
  bottomContainer: {
    
    borderTopLeftRadius: THEME.RADIUS.OVAL,
    borderTopRightRadius: THEME.RADIUS.OVAL,
    flex: 1,
    paddingHorizontal: THEME.PADDING.MID_LOW,

    backgroundColor: COLORS.primaryLight,
  },
  
  inputView: {marginVertical: THEME.MARGIN.VERYHIGH},
  bottomHeader: {
    marginTop: THEME.MARGIN.VERYHIGH,
    alignSelf: 'center',
    
  },
  labelStyle: {color: COLORS.white},

  forgotPassword: {
    alignSelf: 'flex-end',
    
  },

  buttonText: {color: COLORS.white,},
  noAccountText: {
    color: COLORS.white,
    alignSelf: 'flex-end',
    textDecorationLine: 'underline',
  },
  errors: {
    
    marginLeft: RF(10),
  },
});
export default styles;
