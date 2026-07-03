import {StyleSheet} from 'react-native';
import {THEME} from 'shared/theme';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primaryLightBackground,
  },
  listContent: {
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
    padding: 10,
    borderRadius: 10,
    maxWidth: '80%',
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#007bff',
  },
  botMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#e5e5e5',
  },
  messageText: {
    fontSize: 16,
    color: '#fff',
  },
  voiceIconContainer: {
    marginLeft: 10,
  },
});
export default styles;
