import React, { useState } from 'react'
import {
  View,
  TouchableOpacity,
  Text,
  Platform,
  StyleSheet,
  TextStyle,
  StyleProp,
  ViewStyle,
  TouchableOpacityProps
} from 'react-native'
import DateTimePicker from '@react-native-community/datetimepicker'
import { COLORS, THEME } from 'shared/theme'
import { RF } from 'shared/theme/responsive'
import AnyIcon, { Icons } from '../AnyIcon'
import AppText from '../AppText/AppText'


interface DatePickerProps {
  label: string
  labelStyle?: StyleProp<TextStyle>
  placeholder?: string
  value?: string
  onChange: (date: string) => void
  error?: any
  style?: StyleProp<ViewStyle>
  placeholderStyle?: StyleProp<TextStyle>
}

const DatePicker: React.FC<DatePickerProps> = ({
  label,
  labelStyle,
  placeholder,
  value,
  onChange,
  error,
  style,
  placeholderStyle
}) => {
  const [date, setDate] = useState<Date | undefined>(undefined)
  const [showPicker, setShowPicker] = useState(false)

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowPicker(false)
    if (selectedDate) {
      setDate(selectedDate)
      onChange(selectedDate.toISOString().split('T')[0]) // Format as YYYY-MM-DD
    }
  }

  return (
    <>
      <TouchableOpacity
        style={[{ marginVertical: THEME.MARGIN.LOW }]}
        activeOpacity={1}
        onPress={() => setShowPicker(true)}
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
            {value || placeholder || 'Select Date'}
          </Text>

          <AnyIcon
            disabled
            name="calendar"
            type={Icons.Feather}
            size={15}
            color={COLORS.descriptionColor}
          />
        </View>
      </TouchableOpacity>
      {error && <AppText style={styles.errorText}>{error}</AppText>}
      {showPicker && (
        <DateTimePicker
          value={date || new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'inline' : 'default'}
          onChange={handleDateChange}
        />
      )}
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
  errorText: {
    color: COLORS.error,
    fontSize: RF(12),
    marginTop: RF(2)
  }
})

export default DatePicker