import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { View, Alert } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'
import AppHeader from 'shared/components/AppHeader'
import AppInput from 'shared/components/AppInput'
import DatePicker from 'shared/components/Datepicker'
import DropDown from 'shared/components/Dropdown'
import PrimaryButton from 'shared/components/PrimaryButton'
import TimePicker from 'shared/components/TimePicker'
import { GenericNavigation } from 'shared/utils/models/types'
import styles from './style'
import axios from 'axios'
import { addAIBreeding } from 'shared/services/breedingEvents.services'
import Toast from 'react-native-toast-message'

interface Props extends GenericNavigation {}
const AIBreeding = (props: Props) => {
  const { t } = useTranslation()
  const [formData, setFormData] = useState({
    tagId: '',
    aiType: '',
    date: '',
    semen: '',
    dose: '',
    cost: '',
    time: '',
    weight: '',
  })

  const handleChange = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }))
  }

  const handleSubmit = async () => {
    try {
      const response=await addAIBreeding(formData)
      console.log('Success:', response.data)
           Toast.show({
                   text1: t('breeding.common.success'),
                   text2: t('breeding.common.recordedSuccessfully'),
                   type: 'success'
                 })
    } catch (error) {
      console.log('error adding new AI Breeding:', {error})
           Toast.show({
                   text1: t('breeding.common.failed'),
                   text2: t('breeding.aiBreeding.addError'),
                   type: 'error'
                 })
    }
  }

  return (
    <>
      <AppHeader showBack title={t('breeding.aiBreeding.headerTitle')} />
      <View style={styles.container}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
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
            value={formData.tagId}
            onChangeText={(text) => handleChange('tagId', text)}
          />

          <DropDown
            label={t('breeding.common.aiType')}
            labelStyle={styles.label}
            placeholder={t('breeding.common.select')}
            placeholderStyle={styles.placeholder}
            style={styles.customContainer}
            options={[{ label: 'Type1', value: 'type1' }, { label: 'Type2', value: 'type2' }]}
            value={formData.aiType}
            onChange={(value) => handleChange('aiType', value)}
          />

          <DatePicker
            label={t('breeding.common.date')}
            labelStyle={styles.label}
            placeholder={t('breeding.common.select')}
            placeholderStyle={styles.placeholder}
            style={styles.customContainer}
            onChange={(date) => handleChange('date', date)}
          />

          <DropDown
            label={t('breeding.common.semen')}
            labelStyle={styles.label}
            placeholder={t('breeding.common.select')}
            placeholderStyle={styles.placeholder}
            style={styles.customContainer}
            options={[{ label: 'Semen1', value: 'semen1' }, { label: 'Semen2', value: 'semen2' }]}
            value={formData.semen}
            onChange={(value) => handleChange('semen', value)}
          />

          <AppInput
            label={t('breeding.common.dose')}
            textInputStyle={styles.placeholder}
            labelStyle={styles.label}
            placeholder={t('breeding.common.dose')}
            style={styles.customContainer}
            error={undefined}
            value={formData.dose}
            onChangeText={(text) => handleChange('dose', text)}
          />

          <AppInput
            label={t('breeding.common.cost')}
            textInputStyle={styles.placeholder}
            labelStyle={styles.label}
            placeholder={t('breeding.common.cost')}
            style={styles.customContainer}
            error={undefined}
            value={formData.cost}
            onChangeText={(text) => handleChange('cost', text)}
          />

          <TimePicker
            label={t('breeding.common.time')}
            labelStyle={styles.label}
            style={styles.customContainer}
            placeholder={t('breeding.common.select')}
            placeholderStyle={styles.placeholder}
            onChange={(time) => handleChange('time', time)}
          />

          <AppInput
            label={t('breeding.common.weight')}
            textInputStyle={styles.placeholder}
            labelStyle={styles.label}
            placeholder={t('breeding.common.weight')}
            style={styles.customContainer}
            error={undefined}
            value={formData.weight}
            onChangeText={(text) => handleChange('weight', text)}
          />

          <View style={styles.buttonContainer}>
            <PrimaryButton
              title={t('breeding.aiBreeding.cancel')}
              buttonStyle={styles.button2}
              textStyle={styles.buttonText2}
              onPress={() => props.navigation?.goBack()}
            />
            <PrimaryButton
              title={t('breeding.common.addNew')}
              buttonStyle={styles.button1}
              textStyle={styles.buttonText1}
              onPress={handleSubmit}
            />
          </View>
        </ScrollView>
      </View>
    </>
  )
}

export default AIBreeding
