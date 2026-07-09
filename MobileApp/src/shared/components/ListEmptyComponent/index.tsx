import React from 'react'
import { useTranslation } from 'react-i18next'
import { StyleProp, StyleSheet, TextStyle, View, ViewStyle } from 'react-native'
import { COLORS, THEME } from 'shared/theme'
import { RF } from 'shared/theme/responsive'
import AppText from '../AppText/AppText'

interface Props {
  message?: string
  style?: StyleProp<ViewStyle>
  textStyle?: StyleProp<TextStyle>
}

const ListEmptyComponent: React.FC<Props> = ({
  message,
  style,
  textStyle
}) => {
  const { t } = useTranslation()
  return (
    <View style={[styles.container, style]}>
      <AppText style={[styles.text, textStyle]}>
        {message || t('shared.listEmpty.message')}
      </AppText>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginTop: RF(100),
    alignItems: 'center'
  },
  text: {
    fontSize: THEME.FONTS.SIZE.h6,
    color: COLORS.placeholder,
    fontFamily: THEME.FONTS.TYPE.SEMIBOLD
  }
})

export default ListEmptyComponent
