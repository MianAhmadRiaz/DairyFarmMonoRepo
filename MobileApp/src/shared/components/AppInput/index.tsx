import React, { forwardRef } from 'react'
import {
  ActivityIndicator,
  StyleProp,
  StyleSheet,
  TextInput,
  TextInputProps,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle
} from 'react-native'

import { COLORS, FONT_FAMILY, THEME } from '../../theme'
import { RF } from '../../theme/responsive'
import AnyIcon, { Icons } from '../AnyIcon'
import AppText from '../AppText/AppText'

interface Props extends TextInputProps {
  viewStyle?: StyleProp<ViewStyle>
  inputStyle?: StyleProp<ViewStyle>
  textInputStyle?: StyleProp<TextStyle>
  labelStyle?: StyleProp<TextStyle>
  icon?: string
  iconType?: any
  onPressIcon?: () => void
  rightIcon?: string
  rightIconType?: any
  onPressRightIcon?: () => void
  rightIconColor?: string
  eye?: string
  iconColor?: string
  label?: string
  leftIcon?: string
  leftIconType?: any
  onPressLeftIcon?: () => any
  showRightText?: boolean
  onPressRightText?: () => void
  rightText?: string
  onPress?: () => void
  loading?: boolean
  error?: any
  style?: StyleProp<ViewStyle>
}

const AppInput = (props: Props, ref: any) => {
  return (
    <TouchableOpacity
      activeOpacity={1}
      style={props?.viewStyle}
      onPress={props.onPress && props.onPress}
    >
      {props.label && (
        <AppText style={[styles.label, props.labelStyle]}>
          {props.label}
        </AppText>
      )}
      <View style={[styles.container, props.inputStyle, props.style]}>
        {props.leftIcon && (
          <TouchableOpacity
            style={styles.leftIconContainer}
            onPress={props.onPressLeftIcon}
          >
            <AnyIcon
              disabled
              style={{ alignSelf: 'center' }}
              name={props.leftIcon}
              type={props.leftIconType ? props.leftIconType : Icons.Feather}
              size={24}
              color={COLORS.white}
            />
          </TouchableOpacity>
        )}
        <View
          style={{ flex: 1 }}
          pointerEvents={props.onPress ? 'none' : 'auto'}
        >
          <TextInput
            {...props}
            placeholderTextColor={COLORS.placeholder}
            style={[styles.inputContainer, props.textInputStyle]}
            // selectionColor={darkMode ? COLORS.white : COLORS.black}
          />
        </View>
        {props.icon &&
          (props?.loading ? (
            <ActivityIndicator size={'small'} color={'white'} />
          ) : (
            <AnyIcon
              onPress={props.onPressIcon}
              disabled={!props?.value}
              style={styles.icon}
              name={props.icon}
              type={props?.iconType}
              size={25}
              color={
                !props?.value
                  ? COLORS.primaryLight
                  : props.iconColor
                    ? props.iconColor
                    : COLORS.white
              }
            />
          ))}
        {props.showRightText && (
          <TouchableOpacity
            style={{
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: THEME.MARGIN.MID_LOW
            }}
            onPress={props.onPressRightText}
          >
            <AppText style={styles.rightText}>{props.rightText}</AppText>
          </TouchableOpacity>
        )}
        {props.rightIcon && (
          <AnyIcon
            onPress={props.onPressRightIcon}
            disabled={!props?.value || props?.loading}
            style={styles.rightIcon}
            name={props.rightIcon}
            type={props?.rightIconType}
            size={25}
            color={
              props?.loading
                ? COLORS.primaryMain
                : props.rightIconColor
                  ? props.rightIconColor
                  : COLORS.white
            }
          />
        )}
      </View>
      {props?.error && (
        <AppText style={styles.errorText}>{props?.error}</AppText>
      )}
    </TouchableOpacity>
  )
}

export default forwardRef(AppInput)

const styles = StyleSheet.create({
  container: {
    width: '90%',
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    height: RF(50),
    borderColor: COLORS.primaryMain,
    borderWidth: 1,
    borderRadius: THEME.RADIUS.OVALBOX,
    marginVertical: THEME.MARGIN.LOW,
    backgroundColor: COLORS.white
  },
  inputContainer: {
    flex: 1,
    height: '100%',
    color: COLORS.darkGrey,
    fontFamily: THEME.FONTS.TYPE.MEDIUM,
    fontSize: THEME.FONTS.SIZE.subtitle,
    paddingHorizontal: RF(16)
  },
  maxButton: {
    width: RF(52),
    height: '100%',
    borderRadius: THEME.RADIUS.SMALLBOX,
    overflow: 'hidden'
  },
  label: {
    fontSize: THEME.FONTS.SIZE.subtitle,
    marginTop: RF(5),
    marginLeft: RF(20),
    color: COLORS.primaryMain,
    fontFamily: THEME.FONTS.TYPE.SEMIBOLD
  },
  leftIconContainer: {
    flex: 0.2,
    // backgroundColor: "red",
    alignItems: 'center',
    justifyContent: 'center',
    borderTopLeftRadius: RF(10),
    borderBottomLeftRadius: RF(10)
  },
  icon: {
    alignSelf: 'center',
    paddingHorizontal: THEME.PADDING.MID_LOW
  },
  rightIcon: {
    alignSelf: 'center',
    paddingHorizontal: THEME.PADDING.VERYLOW
  },
  rightText: {
    color: COLORS.white,
    fontFamily: FONT_FAMILY.PlusJakartaSans,
    fontSize: RF(14)
  },
  errorText: {
    color: COLORS.error,
    fontSize: RF(12),
    marginTop: RF(2)
  }
})
