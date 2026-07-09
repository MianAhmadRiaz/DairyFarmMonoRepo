import React from 'react'
import { useTranslation } from 'react-i18next'
import {
  StyleProp,
  StyleSheet,
  TextInput,
  TextInputProps,
  View,
  ViewProps
} from 'react-native'
import { COLORS } from 'shared/theme'
import { RF } from 'shared/theme/responsive'
import AnyIcon, { Icons } from '../AnyIcon'

interface Props {
  value: string
  onChangeText: (text: string) => void
  viewStyle?: StyleProp<ViewProps>
  inputStyle?: StyleProp<TextInputProps>
}

const SearchInput = ({ value, onChangeText, viewStyle, inputStyle }: Props) => {
  const { t } = useTranslation()
  return (
    <View style={[styles.searchContainer, viewStyle]}>
      <AnyIcon
        name="search"
        type={Icons.Feather}
        size={18}
        color={COLORS.placeholder}
        style={styles.searchIcon}
      />
      <TextInput
        style={[styles.searchInput, inputStyle]}
        placeholder={t('shared.common.searchPlaceholder')}
        placeholderTextColor={COLORS.placeholder}
        value={value}
        onChangeText={onChangeText}
      />
    </View>
  )
}

export default SearchInput

const styles = StyleSheet.create({
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: RF(40),
    borderColor: COLORS.cardGrey,
    borderWidth: 1,
    borderRadius: RF(8),
    paddingHorizontal: RF(10),
    marginBottom: RF(10),
    backgroundColor: COLORS.white
  },
  searchIcon: {
    marginRight: RF(8)
  },
  searchInput: {
    flex: 1,
    fontSize: RF(14),
    color: COLORS.darkestGrey
  }
})
