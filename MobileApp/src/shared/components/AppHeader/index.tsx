import { DrawerActions, useNavigation } from '@react-navigation/core'
import React, { ReactNode } from 'react'
import {
  Platform,
  StyleProp,
  StyleSheet,
  TextStyle,
  TouchableOpacity,
  UIManager,
  View,
  ViewStyle
} from 'react-native'
import { COLORS, THEME } from '../../theme'
import { RF } from '../../theme/responsive'

import AnyIcon, { Icons } from '../AnyIcon'
import AppText from '../AppText/AppText'

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true)
}

interface Props {
  title?: string
  titleStyle?: StyleProp<TextStyle>
  rightElement?: ReactNode

  showBack?: boolean
  showHam?: boolean
  showProfile?: boolean
  backAction?: () => void
  onPressHam?: () => void
  onPressProfile?: () => void
  onPressRightText?: () => void
  headerStyle?: StyleProp<ViewStyle>
}

const AppHeader = (props: Props) => {
  const navigation = useNavigation()

  // const {darkMode} = useSelector((state: RootState) => state.settings);
  const darkMode = false

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: darkMode ? COLORS.primaryDark : COLORS.background
        },
        props.headerStyle
      ]}
    >
      <View style={styles.left}>
        {props.showBack && navigation.canGoBack() ? (
          <TouchableOpacity
            activeOpacity={1}
            onPress={props.backAction ? props.backAction : navigation.goBack}
            style={styles.backView}
          >
            <AnyIcon
              disabled
              name="arrow-left"
              type={Icons.Feather}
              size={25}
              color={COLORS.primaryDark}
            />
          </TouchableOpacity>
        ) : props?.showHam ? (
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}
            style={styles.backView}
          >
            <AnyIcon
              disabled
              name="menu"
              type={Icons.Ionicons}
              size={25}
              color={COLORS.darkestGrey}
            />
          </TouchableOpacity>
        ) : (
          <View />
        )}
      </View>

      <View style={styles.center}>
        <AppText style={[styles.header, props.titleStyle]}>
          {props?.title}
        </AppText>
      </View>

      <View style={styles.right}>
        {Boolean(props.rightElement) ? props.rightElement : <View />}
      </View>
    </View>
  )
}

export default AppHeader

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: RF(Platform.OS === 'ios' ? 40 : 60),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: RF(10),
    zIndex: 9999
  },
  left: {
    flex: 0.5,

    alignItems: 'center',
    flexDirection: 'row'
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row'
  },
  right: {
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    flex: 0.5,
    flexDirection: 'row'
  },

  backView: {
    alignSelf: 'center',
    height: '100%',
    paddingHorizontal: RF(5)
  },
  rightButton: {
    alignSelf: 'center',
    alignItems: 'center'
  },

  header: {
    fontSize: THEME.FONTS.SIZE.h6,
    fontFamily: THEME.FONTS.TYPE.BOLD
  }
})
