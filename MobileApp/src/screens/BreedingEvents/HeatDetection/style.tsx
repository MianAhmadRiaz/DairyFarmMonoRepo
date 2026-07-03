import { StyleSheet } from 'react-native'
import { COLORS, THEME } from '../../../shared/theme'
import { RF } from 'shared/theme/responsive'

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F8F7'
  },
  top: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: THEME.PADDING.NORMAL
  },
  languageButton: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  label: {
    color: COLORS.labelColor,
    fontSize: THEME.FONTS.SIZE.caption
  },
  placeholder: {
    color: COLORS.descriptionColor,
    fontSize: THEME.FONTS.SIZE[11],
    textAlignVertical: 'top'
  },
  buttonContainer: {
    flexDirection: 'row',
    marginTop: THEME.MARGIN.NORMAL
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
    fontSize: 14
  },
  buttonText2: {
    color: COLORS.darkGrey,
    fontSize: 14
  },
  customContainer: {
    borderColor: COLORS.lightSilver,
    borderRadius: THEME.RADIUS.SMALLBOX,
    height: RF(36),
    marginVertical: THEME.MARGIN.VERYLOW
  },

  cardContainer: {
    backgroundColor: 'white',
    padding: THEME.PADDING.LOW,
    borderRadius: THEME.RADIUS.BOX,
    elevation: 1,
    marginHorizontal: THEME.MARGIN.NORMAL,
    marginTop: THEME.MARGIN.HIGH
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)'
  },
  box: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: THEME.MARGIN.NORMAL
  },
  button: {
    marginTop: THEME.MARGIN.NORMAL,
    backgroundColor: COLORS.primaryMain,
    borderRadius: THEME.RADIUS.BOX,
    height: RF(42),
    width: '85%'
  },
  buttonText: {
    color: 'white',
    fontSize: THEME.FONTS.SIZE.subtitle,
    fontFamily: THEME.FONTS.TYPE.BOLD
  },
  recentEntriesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginLeft: THEME.MARGIN.LOW,
    paddingLeft: THEME.PADDING.LOW
  },
  tableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: COLORS.lightGrey,
    paddingVertical: THEME.PADDING.NORMAL,
    marginTop: THEME.MARGIN.MID_LOW,
    marginHorizontal: THEME.MARGIN.NORMAL
  },
  headerText: {
    fontSize: THEME.FONTS.SIZE[10],
    color: COLORS.darkestGrey,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center'
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: THEME.PADDING.NORMAL
  },
  rowText: {
    color: COLORS.darkestGrey,
    fontSize: THEME.FONTS.SIZE.caption,
    flex: 1,
    textAlign: 'center'
  },
  loadMore: {
    paddingVertical: THEME.PADDING.NORMAL,
    alignSelf: 'center',
    marginBottom: THEME.MARGIN.NORMAL,
    backgroundColor: 'white'
  },
  loadMoreText: {
    fontSize: THEME.FONTS.SIZE.subtitle,
    fontWeight: 'bold',
    color: COLORS.darkestGrey
  },
  tableContainer: {
    backgroundColor: 'white',
    borderRadius: THEME.RADIUS.BOX,
    marginHorizontal: THEME.MARGIN.NORMAL
  }
})
export default styles
