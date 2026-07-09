import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  View,
  TouchableOpacity,
  Text,
  Platform,
  StyleSheet,
  StyleProp,
  TextStyle,
  ViewStyle,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { COLORS, THEME } from 'shared/theme';
import { RF } from 'shared/theme/responsive';
import AnyIcon, { Icons } from '../AnyIcon';
import AppText from '../AppText/AppText';

interface TimePickerProps {
  label: string;
  labelStyle?: StyleProp<TextStyle>;
  placeholder?: string;
  value?: string;
  onChange: (time: string) => void;
  error?: any;
  style?: StyleProp<ViewStyle>;
  placeholderStyle?: StyleProp<TextStyle>;
}

const TimePicker: React.FC<TimePickerProps> = ({
  label,
  labelStyle,
  placeholder,
  value,
  onChange,
  error,
  style,
  placeholderStyle,
}) => {
  const { t } = useTranslation();
  const [time, setTime] = useState<Date | undefined>(undefined);
  const [showPicker, setShowPicker] = useState(false);

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    setShowPicker(false);
    if (selectedTime) {
      setTime(selectedTime);
      const formattedTime = selectedTime.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
      onChange(formattedTime);
    }
  };

  return (
    <>
      <TouchableOpacity
        style={{ marginVertical: THEME.MARGIN.LOW }}
        activeOpacity={1}
        onPress={() => setShowPicker(true)}
      >
        {label && <AppText style={[styles.label, labelStyle]}>{label}</AppText>}
        <View style={[styles.container, style]}>
          <Text
            style={[
              styles.text,
              !value && placeholderStyle,      
              { color: value ? COLORS.darkestGrey : COLORS.placeholder },
            ]}
          >
            {value || placeholder || t('shared.timePicker.select')}
          </Text>

          <AnyIcon
            disabled
            name="clock"
            type={Icons.Feather}
            size={15}
            color={COLORS.descriptionColor}
          />
        </View>
      </TouchableOpacity>
      {error && <AppText style={styles.errorText}>{error}</AppText>}
      {showPicker && (
        <DateTimePicker
          value={time || new Date()}
          mode="time"
          display={Platform.OS === 'ios' ? 'inline' : 'default'}
          onChange={handleTimeChange}
        />
      )}
    </>
  );
};

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
    backgroundColor: COLORS.white,
  },
  label: {
    fontSize: THEME.FONTS.SIZE.subtitle,
    marginTop: RF(5),
    marginLeft: RF(20),
    color: COLORS.primaryMain,
    fontFamily: THEME.FONTS.TYPE.SEMIBOLD,
  },
  text: {
    color: COLORS.darkestGrey,
    fontFamily: THEME.FONTS.TYPE.MEDIUM,
    fontSize: THEME.FONTS.SIZE.subtitle,
  },
  errorText: {
    color: COLORS.error,
    fontSize: RF(12),
    marginTop: RF(2),
  },
});

export default TimePicker;
