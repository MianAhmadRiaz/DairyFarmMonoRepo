import {StyleSheet} from 'react-native';
import {COLORS, THEME} from '../../../shared/theme';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
  card: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 8.17,
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 7.5, 
  },
  image: { 
    width: '100%', 
    height: 100, 
    borderTopLeftRadius: 8, 
    borderTopRightRadius: 8
  },
  description:{
    textAlign:'center',
    marginBottom:5
  },
  button: {
    backgroundColor: COLORS.primaryMain,
    paddingVertical: 5,
    paddingHorizontal: 15,
    borderRadius: 6,
    width: "80%", 
    height: 25, 
    alignSelf: "center"
  },
  buttonText: { 
    color: 'white', 
    fontSize: 11
},

});
export default styles;