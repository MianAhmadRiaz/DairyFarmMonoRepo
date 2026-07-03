import React from 'react';
import {
  ActivityIndicator,
  I18nManager,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
  ViewStyle,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import Icon from 'react-native-vector-icons/Entypo';
import Feather from 'react-native-vector-icons/Feather';
import {COLORS, FONT_FAMILY, THEME} from '../../theme';
import GLOBAL_STYLE from '../../theme/global';
import {RF} from '../../theme/responsive';

interface Props extends TouchableOpacityProps {
  title: string;
  image?: string;

  buttonStyle?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  icon?: string;
  loading?: boolean;
  small?: boolean;
  disabled?: boolean;
  disabledMessage?: string;
  rightIcon?: string;
  loaderColor?: string;
}

const PrimaryButton = (props: Props) => {
  let titleColorProp = {
    color:
      props.disabledMessage && props.disabled
        ? COLORS.textLight
        : COLORS.white,
  };

  let shadowColorProp = {
    shadowColor:
      props.disabledMessage && props.disabled
        ? COLORS.lightGrey
        : COLORS.secondaryLightBackground,
  };

  let buttonBackgroundColor = () => {
    if (props.disabled && props.disabledMessage) {
      return {backgroundColor: COLORS.white};
    } else {
      return {backgroundColor: COLORS.primaryLightBackground};
    }
  };
  return (
    <TouchableOpacity
      {...props}
      style={[
        shadowColorProp,
        buttonBackgroundColor(),
        props.small ? styles.smallContainer : styles.container,
        props.buttonStyle,
      ]}
      disabled={props.loading || props.disabled}
      activeOpacity={0.7}>
      <View style={styles.iconView}>
        {props.icon && <Icon name={props.icon} style={styles.icon} />}
        {props.image && (
          <FastImage
            source={props.image}
            style={styles.image}
            resizeMode={FastImage.resizeMode.contain}
          />
        )}
        {props.loading ? (
          <ActivityIndicator
            color={
              props.disabled
                ? COLORS.white
                : props.loaderColor
                ? props?.loaderColor
                : COLORS.white
            }
          />
        ) : (
          <>
            <Text
              {...props}
              style={[styles.buttonText, titleColorProp, props.textStyle]}>
              {props.disabled ? props.disabledMessage : props.title}
            </Text>
            {props.rightIcon && (
              <Feather name={props.rightIcon} style={styles.rightIcon} />
            )}
          </>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default PrimaryButton;

const styles = StyleSheet.create({
  container: {
    width: '90%',
    height: RF(50),
    alignSelf: 'center',
    borderRadius: THEME.RADIUS.OVALBOX,
    ...GLOBAL_STYLE.CENTER,
    marginBottom: THEME.MARGIN.NORMAL,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: COLORS.white,
  },
  iconView: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  smallContainer: {
    width: '60%',
    height: RF(40),
    alignSelf: 'center',
    borderRadius: THEME.RADIUS.BOX,
    ...GLOBAL_STYLE.CENTER,
    marginBottom: THEME.MARGIN.NORMAL,
    flexDirection: 'row',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,

    elevation: 8,
  },
  image: {
    width: RF(25),
    height: RF(25),
    marginRight: THEME.MARGIN.LOW,
    alignSelf: 'center',
  },
  icon: {
    fontSize: 20,
    color: COLORS.white,
    marginRight: THEME.MARGIN.LOW,
  },
  rightIcon: {
    fontSize: 25,
    alignSelf: 'center',
    color: COLORS.white,
  },
  buttonText: {
    fontWeight:"500",
    fontFamily:FONT_FAMILY.PlusJakartaSans,
    fontSize: I18nManager.isRTL
      ? THEME.FONTS.SIZE.subtitle
      : THEME.FONTS.SIZE.h7,
  },
});
