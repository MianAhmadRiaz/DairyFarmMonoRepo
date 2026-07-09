import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { TouchableOpacity, View } from 'react-native'
import AnyIcon, { Icons } from 'shared/components/AnyIcon'
import AppText from 'shared/components/AppText/AppText'
import { GenericNavigation } from 'shared/utils/models/types'
import styles from './style'
import PrimaryButton from 'shared/components/PrimaryButton'
import {
  GestureHandlerRootView,
  ScrollView
} from 'react-native-gesture-handler'
import AppInput from 'shared/components/AppInput'
import DropDown from 'shared/components/Dropdown'
import DatePicker from 'shared/components/Datepicker'
import TimePicker from 'shared/components/TimePicker'
import AppHeader from 'shared/components/AppHeader'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'

interface Props extends GenericNavigation {}
const BullBreeding = (props: Props) => {
  const { t } = useTranslation()
  return (
    <>
      {/* <View style={styles.container}> */}
      <AppHeader title={t('breeding.bullBreeding.headerTitle')} showBack />
      <KeyboardAwareScrollView
        keyboardShouldPersistTaps="always"
        style={styles.tableContainer}
        showsVerticalScrollIndicator={false}
      >
        <AppInput
          label={t('breeding.common.tagId')}
          textInputStyle={styles.placeholder}
          labelStyle={styles.label}
          placeholder={t('breeding.common.tagIdPlaceholder')}
          style={styles.customContainer}
          error={undefined}
        />
        <DropDown
          label={t('breeding.common.aiType')}
          labelStyle={styles.label}
          placeholder={t('breeding.common.select')}
          placeholderStyle={styles.placeholder}
          style={styles.customContainer}
          options={[]}
          value={''}
          onChange={function (value: string): void {
            throw new Error('Function not implemented.')
          }}
        />
        <DatePicker
          label={t('breeding.common.date')}
          labelStyle={styles.label}
          placeholder={t('breeding.common.select')}
          placeholderStyle={styles.placeholder}
          style={styles.customContainer}
          onChange={function (date: string): void {
            throw new Error('Function not implemented.')
          }}
        />
        <DropDown
          label={t('breeding.common.semen')}
          labelStyle={styles.label}
          placeholder={t('breeding.common.select')}
          placeholderStyle={styles.placeholder}
          style={styles.customContainer}
          options={[]}
          value={''}
          onChange={function (value: string): void {
            throw new Error('Function not implemented.')
          }}
        />
        <AppInput
          label={t('breeding.common.dose')}
          textInputStyle={styles.placeholder}
          labelStyle={styles.label}
          placeholder={t('breeding.common.select')}
          style={styles.customContainer}
          error={undefined}
        />
        <AppInput
          label={t('breeding.common.cost')}
          textInputStyle={styles.placeholder}
          labelStyle={styles.label}
          placeholder={t('breeding.common.select')}
          style={styles.customContainer}
          error={undefined}
        />
        <TimePicker
          label={t('breeding.common.time')}
          labelStyle={styles.label}
          style={styles.customContainer}
          placeholder={t('breeding.common.select')}
          placeholderStyle={styles.placeholder}
          onChange={function (date: string): void {
            throw new Error('Function not implemented.')
          }}
        />
        <AppInput
          label={t('breeding.common.weight')}
          textInputStyle={styles.placeholder}
          labelStyle={styles.label}
          placeholder={t('breeding.common.select')}
          style={styles.customContainer}
          error={undefined}
        />

        <View style={styles.buttonContainer}>
          <PrimaryButton
            title={t('breeding.bullBreeding.cancel')}
            buttonStyle={styles.button2}
            textStyle={styles.buttonText2}
          />
          <PrimaryButton
            title={t('breeding.common.addNew')}
            buttonStyle={styles.button1}
            textStyle={styles.buttonText1}
          />
        </View>
      </KeyboardAwareScrollView>
      {/* </View> */}
    </>
  )
}

export default BullBreeding
