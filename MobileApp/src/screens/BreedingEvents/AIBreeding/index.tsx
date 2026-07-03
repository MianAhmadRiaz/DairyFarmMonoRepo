import React, { useState } from 'react'
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
                   text1: 'Success',
                   text2: 'Recorded Successfully',
                   type: 'success'
                 })
    } catch (error) {
      console.log('error adding new AI Breeding:', {error})
           Toast.show({
                   text1: 'Failed',
                   text2: 'Error adding new AI Breeding',
                   type: 'error'
                 })
    }
  }

  return (
    <>
      <AppHeader showBack title="AI Breeding" />
      <View style={styles.container}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="always"
          style={styles.tableContainer}
          showsVerticalScrollIndicator={false}
        >
          <AppInput
            label="Tag ID"
            textInputStyle={styles.placeholder}
            labelStyle={styles.label}
            placeholder="Tag ID"
            style={styles.customContainer}
            error={undefined}
            value={formData.tagId}
            onChangeText={(text) => handleChange('tagId', text)}
          />

          <DropDown
            label="AI Type"
            labelStyle={styles.label}
            placeholder="Select"
            placeholderStyle={styles.placeholder}
            style={styles.customContainer}
            options={[{ label: 'Type1', value: 'type1' }, { label: 'Type2', value: 'type2' }]}
            value={formData.aiType}
            onChange={(value) => handleChange('aiType', value)}
          />

          <DatePicker
            label="Date"
            labelStyle={styles.label}
            placeholder="Select"
            placeholderStyle={styles.placeholder}
            style={styles.customContainer}
            onChange={(date) => handleChange('date', date)}
          />

          <DropDown
            label="Semen"
            labelStyle={styles.label}
            placeholder="Select"
            placeholderStyle={styles.placeholder}
            style={styles.customContainer}
            options={[{ label: 'Semen1', value: 'semen1' }, { label: 'Semen2', value: 'semen2' }]}
            value={formData.semen}
            onChange={(value) => handleChange('semen', value)}
          />

          <AppInput
            label="Dose"
            textInputStyle={styles.placeholder}
            labelStyle={styles.label}
            placeholder="Dose"
            style={styles.customContainer}
            error={undefined}
            value={formData.dose}
            onChangeText={(text) => handleChange('dose', text)}
          />

          <AppInput
            label="Cost"
            textInputStyle={styles.placeholder}
            labelStyle={styles.label}
            placeholder="Cost"
            style={styles.customContainer}
            error={undefined}
            value={formData.cost}
            onChangeText={(text) => handleChange('cost', text)}
          />

          <TimePicker
            label="Time"
            labelStyle={styles.label}
            style={styles.customContainer}
            placeholder="Select"
            placeholderStyle={styles.placeholder}
            onChange={(time) => handleChange('time', time)}
          />

          <AppInput
            label="Weight"
            textInputStyle={styles.placeholder}
            labelStyle={styles.label}
            placeholder="Weight"
            style={styles.customContainer}
            error={undefined}
            value={formData.weight}
            onChangeText={(text) => handleChange('weight', text)}
          />

          <View style={styles.buttonContainer}>
            <PrimaryButton
              title="Cancel"
              buttonStyle={styles.button2}
              textStyle={styles.buttonText2}
              onPress={() => props.navigation?.goBack()}
            />
            <PrimaryButton
              title="Add New"
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
