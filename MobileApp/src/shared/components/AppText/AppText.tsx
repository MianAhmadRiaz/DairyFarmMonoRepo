import React, { ReactChild } from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';
import { COLORS, FONT_FAMILY, fontColorProperty, THEME } from 'shared/theme';
import { RF } from 'shared/theme/responsive';

interface Props extends TextProps {
  children: ReactChild | undefined | any;
  bold?: boolean;
  isInter?: boolean;
  regular?: boolean;
  extraLight?: boolean;
  medium?: boolean;
  extraBold?: boolean;
  semiBold?: boolean;
  light?: boolean;
  color?: keyof typeof COLORS;
  fontSize?: keyof typeof THEME.FONTS.SIZE;
}

const AppText = ({
  children,
  isInter = true,
  bold,
  medium,
  semiBold,
  extraLight,
  regular = true,
  light,
  extraBold,
  color = 'darkestGrey',
  style,
  fontSize = 'subtitle',
  ...restProps
}: Props) => {
  // Default font family is regular
  let fontFamily = THEME.FONTS.TYPE.REGULAR;

  // Override based on the props
  if (bold) fontFamily = THEME.FONTS.TYPE.BOLD;
  if (extraBold) fontFamily = THEME.FONTS.TYPE.EXTRABOLD;
  if (extraLight) fontFamily = THEME.FONTS.TYPE.EXTRALIGHT;
  if (light) fontFamily = THEME.FONTS.TYPE.LIGHT;
  if (medium) fontFamily = THEME.FONTS.TYPE.MEDIUM;
  if (semiBold) fontFamily = THEME.FONTS.TYPE.SEMIBOLD;

  const combinedStyles = [
    fontColorProperty(),
    {
      fontFamily,
      color: color ? COLORS[color] : COLORS.primaryMain,
      fontSize: fontSize ? THEME.FONTS.SIZE[fontSize] : RF(12),
    },
    style,
  ];

  return (
    <Text {...restProps} style={combinedStyles}>
      {children}
    </Text>
  );
};

export default AppText;
