import React, { useState } from 'react'
import { Alert, View } from 'react-native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import Toast from 'react-native-toast-message'
import { useSelector } from 'react-redux'
import { ReasonModal } from 'screens/BreedingEvents/components/ReasonModal'
import AppHeader from 'shared/components/AppHeader'
import AppInput from 'shared/components/AppInput'
import DatePicker from 'shared/components/Datepicker'
import DropDown from 'shared/components/Dropdown'
import PrimaryButton from 'shared/components/PrimaryButton'
import { addNewHeatDetection } from 'shared/services/breedingEvents.services'
import { RootState } from 'shared/store/configureStore'
import styles from './style'
import TagsDropDown, { Animal } from 'shared/components/TagsDropDown'
import { HP } from 'shared/theme/responsive'

interface Props {
  // Navigation props can be added here
}

const AddHeatDetection = (props: Props) => {
  const [reasonOptions, setReasonOptions] = useState([
    'Ridding Others',
    'Being Ridden',
    'Bellowing'
  ])
  const [selectedReason, setSelectedReason] = useState('')
  const [isModalVisible, setModalVisible] = useState(false)
  const [newReason, setNewReason] = useState('')
  const [tag, setTag] = useState<Animal | null>(null)
  const [date, setDate] = useState('')
  const [comments, setComments] = useState('')

  const handleAddNewReason = () => {
    if (newReason.trim()) {
      setReasonOptions([...reasonOptions, newReason])
      setNewReason('')
      setModalVisible(false)
    }
  }

  const handleSaveChanges = async () => {
    if (!tag?.uuid || !date || !selectedReason) {
      Alert.alert('Missing Fields', 'Please fill all required fields.')
      return
    }

    const payload = {
      reason: selectedReason,
      comments,
      animalId: tag.uuid,
      date
    }

    try {
      const response = await addNewHeatDetection(payload)
      Toast.show({
        text1: 'Success',
        text2: 'Heat detection event recorded Successfully',
        type: 'success'
      })

      // Reset form
      setTag(null)
      setDate('')
      setSelectedReason('')
      setComments('')
    } catch (error: any) {
      console.log('error adding detection: ', error?.response?.data.message)

      Toast.show({
        text1: 'Failed',
        text2: error?.response?.data.message,
        type: 'error'
      })
    }
  }

  return (
    <>
      <KeyboardAwareScrollView style={{ flex: 1 }}>
        <View style={styles.container}>
          <AppHeader title="Heat Detection" showBack />
          <View style={styles.cardContainer}>
            <TagsDropDown
              style={styles.customContainer}
              value={tag?.tag}
              onChange={(value, animalUuid) => {
                setTag({ uuid: animalUuid, tag: value })
              }}
            />

            <DatePicker
              label="Date"
              value={date}
              onChange={setDate}
              style={styles.customContainer}
            />

            <AppInput
              label="Comments"
              value={comments}
              onChangeText={setComments}
              style={styles.customContainer}
            />

            <DropDown
              label="Choose Reason"
              options={['Add New', ...reasonOptions]}
              value={selectedReason}
              onChange={value => {
                if (value === 'Add New') setModalVisible(true)
                else setSelectedReason(value)
              }}
              style={styles.customContainer}
            />

            <View style={styles.buttonContainer}>
              <PrimaryButton
                title="Cancel"
                buttonStyle={styles.button2}
                textStyle={styles.buttonText2}
                onPress={() => {
                  setTag(null)
                  setDate('')
                  setSelectedReason('')
                  setComments('')
                }}
              />
              <PrimaryButton
                title="Save Changes"
                buttonStyle={styles.button1}
                textStyle={styles.buttonText1}
                onPress={handleSaveChanges}
              />
            </View>
          </View>
        </View>
      </KeyboardAwareScrollView>

      <ReasonModal
        isVisible={isModalVisible}
        reason={newReason}
        setReason={setNewReason}
        onAdd={handleAddNewReason}
        setModalVisible={setModalVisible}
      />
    </>
  )
}

export default AddHeatDetection
