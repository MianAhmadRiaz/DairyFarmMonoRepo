import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  View,
  TouchableOpacity,
  Text,
  FlatList,
  Modal,
  StyleSheet,
  StyleProp,
  TextStyle,
  ViewStyle,
  TextInput
} from 'react-native'
import { COLORS, FONT_FAMILY, THEME } from 'shared/theme'
import { RF } from 'shared/theme/responsive'
import AnyIcon, { Icons } from '../AnyIcon'
import AppText from '../AppText/AppText'

interface DropDownProps {
  label: string
  labelStyle?: StyleProp<TextStyle>
  placeholder?: string
  options: string[]
  value: string
  onChange: (value: string) => void
  error?: any
  style?: StyleProp<ViewStyle>
  placeholderStyle?: StyleProp<TextStyle>
}

const DropDown: React.FC<DropDownProps> = ({
  label,
  labelStyle,
  placeholder,
  options,
  value,
  onChange,
  error,
  style,
  placeholderStyle,
}) => {
  const { t } = useTranslation()
  const [visible, setVisible] = useState(false)
  const [searchText, setSearchText] = useState('')

  // Filtered options based on search input
  const filteredOptions = options.filter(item =>
    item?.toLowerCase().includes(searchText.toLowerCase())
  )

  return (
    <>
      <TouchableOpacity
        style={{ marginVertical: THEME.MARGIN.LOW }}
        activeOpacity={1}
        onPress={() => setVisible(true)}
      >
        {label && <AppText style={[styles.label, labelStyle]}>{label}</AppText>}
        <View style={[styles.container, style]}>
          <Text
            style={[
              styles.text,
              !value && placeholderStyle,
              { color: value ? COLORS.darkestGrey : COLORS.placeholder }
            ]}
          >
            {value || placeholder || t('shared.dropdown.select')}
          </Text>
          <AnyIcon
            disabled
            name="chevron-down"
            type={Icons.Feather}
            size={15}
            color={COLORS.descriptionColor}
          />
        </View>
      </TouchableOpacity>
      {error && <AppText style={styles.errorText}>{error}</AppText>}
      <Modal transparent visible={visible} animationType="fade">
        <TouchableOpacity
          style={styles.overlay}
          onPress={() => setVisible(false)}
        />
        <View style={styles.modal}>
          {/* Search Input */}
         <View style={styles.searchContainer}>
          <AnyIcon 
            name="search" 
            type={Icons.Feather} 
            size={18} 
            color={COLORS.placeholder} 
            style={styles.searchIcon} 
          />
          <TextInput
            style={styles.searchInput}
            placeholder={t('shared.common.searchPlaceholder')}
            placeholderTextColor={COLORS.placeholder}
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>

          <FlatList
            data={filteredOptions}
            keyExtractor={item => item}
            ListEmptyComponent={<Text style={styles.noResults}>{t('shared.dropdown.noResults')}</Text>}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.option}
                onPress={() => {
                  onChange(item)
                  setVisible(false)
                  setSearchText('')
                }}
              >
                <Text
                  style={[
                    styles.optionText,
                    item === "Add New" && { color: 'green', textDecorationLine: 'underline' }
                  ]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </Modal>
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '90%',
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: RF(50),
    borderColor: COLORS.primaryMain,
    borderWidth: 1,
    borderRadius: THEME.RADIUS.OVALBOX,
    marginVertical: THEME.MARGIN.LOW,
    paddingHorizontal: THEME.MARGIN.MID_LOW,
    backgroundColor: COLORS.white
  },
  label: {
    fontSize: THEME.FONTS.SIZE.subtitle,
    marginTop: RF(5),
    marginLeft: RF(20),
    color: COLORS.primaryMain,
    fontFamily: THEME.FONTS.TYPE.SEMIBOLD
  },

  text: {
    color: COLORS.darkestGrey,
    fontFamily: THEME.FONTS.TYPE.MEDIUM,
    fontSize: THEME.FONTS.SIZE.subtitle
  },

  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
  modal: {
    position: 'absolute',
    bottom: RF(50),
    width: '90%',
    alignSelf: 'center',
    backgroundColor: COLORS.white,
    borderRadius: RF(10),
    padding: RF(10)
  },
  searchContainer: {
  flexDirection: 'row',
  alignItems: 'center',
  height: RF(40),
  borderColor: COLORS.cardGrey,
  borderWidth: 1,
  borderRadius: RF(8),
  paddingHorizontal: RF(10),
  marginBottom: RF(10),
  backgroundColor: COLORS.white,
  },
  searchIcon: {
    marginRight: RF(8),
  },
  searchInput: {
    flex: 1,
    fontSize: RF(14),
    color: COLORS.darkestGrey,
  },
  option: {
    padding: RF(12),
    borderBottomWidth: 1,
    borderColor: COLORS.cardGrey
  },
  optionText: { fontSize: RF(14), color: COLORS.darkestGrey },
  noResults: {
    textAlign: 'center',
    color: COLORS.placeholder,
    paddingVertical: RF(10),
    fontSize: RF(14)
  },
  errorText: {
    color: COLORS.error,
    fontSize: RF(12),
    marginTop: RF(2)
  }
})

export default DropDown
