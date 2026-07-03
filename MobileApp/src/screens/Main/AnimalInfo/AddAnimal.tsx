import React, { useState } from 'react'
import { SafeAreaView, StyleSheet, View } from 'react-native'
import { Formik } from 'formik'

import AppHeader from 'shared/components/AppHeader'
import { COLORS, THEME } from 'shared/theme'
import { RF } from 'shared/theme/responsive'
import { GenericNavigation } from 'shared/utils/models/types'
import AppContainer from 'shared/components/AppContainer'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import AppInput from 'shared/components/AppInput'
import PrimaryButton from 'shared/components/PrimaryButton'
import DropDown from 'shared/components/Dropdown'
import DatePicker from 'shared/components/Datepicker'
import AppText from 'shared/components/AppText/AppText'
import { animalValidationSchema } from 'shared/utils/validations/animal.validations'
import { conditionsType } from 'shared/utils/constants/constants'

function AddAnimal(props: GenericNavigation) {
  const initialValues = {
    penID: '',
    tagId: '',
    eId: '',
    animalName: '',
    animalType: '',
    breedType: '',
    purchasedFrom: '',
    country: '',
    gender: '',
    type: conditionsType[0],
    arrivalDate: '',
    birthDate: '',
    price: '',
    weight: '',
    weightDate: '',
    subcategory: ''
  }
  const [showPedigreeInfo, setShowPedigreeInfo] = useState(false)

  const handleSubmit = (values: typeof initialValues) => {
    console.log('Form Submitted:', values)
  }

  return (
    <AppContainer>
      <AppHeader showBack title="Animal Management" />
      <KeyboardAwareScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="always"
        style={styles.bottomContainer}
        contentContainerStyle={{ paddingBottom: RF(100) }}
      >
        <Formik
          initialValues={initialValues}
          validationSchema={animalValidationSchema}
          onSubmit={handleSubmit}
        >
          {({
            values,
            errors,
            touched,
            handleChange,
            handleBlur,
            handleSubmit,
            setFieldValue
          }) => (
            <View style={styles.main}>
              <View style={styles.inputView}>
                <DropDown
                  label="Pen ID"
                  placeholder="Select"
                  options={['Option 1', 'Option 2']}
                  value={values.penID}
                  onChange={value => setFieldValue('penID', value)}
                  error={touched.penID && errors.penID}
                />

                <AppInput
                  value={values.tagId}
                  onChangeText={handleChange('tagId')}
                  onBlur={handleBlur('tagId')}
                  inputStyle={styles.inputStyle}
                  label="Tag ID"
                  placeholder="Enter Tag ID"
                  error={touched.tagId && errors.tagId}
                />
                <AppInput
                  value={values.eId}
                  onChangeText={handleChange('eId')}
                  onBlur={handleBlur('eId')}
                  inputStyle={styles.inputStyle}
                  label="Electronic ID"
                  placeholder="Enter Electronic ID"
                  error={touched.eId && errors.eId}
                />
                <AppInput
                  value={values.animalName}
                  onChangeText={handleChange('animalName')}
                  onBlur={handleBlur('animalName')}
                  inputStyle={styles.inputStyle}
                  label="Animal Name"
                  placeholder="Enter Animal Name"
                  error={touched.animalName && errors.animalName}
                />

                <DropDown
                  label="Animal Type"
                  placeholder="Select"
                  options={['Option 1', 'Option 2']}
                  value={values.animalType}
                  onChange={value => setFieldValue('animalType', value)}
                  error={touched.animalType && errors.animalType}
                />

                <DropDown
                  label="Breed Type"
                  placeholder="Select"
                  options={['Option 1', 'Option 2']}
                  value={values.breedType}
                  onChange={value => setFieldValue('breedType', value)}
                  error={touched.breedType && errors.breedType}
                />

                <AppInput
                  value={values.purchasedFrom}
                  onChangeText={handleChange('purchasedFrom')}
                  onBlur={handleBlur('purchasedFrom')}
                  inputStyle={styles.inputStyle}
                  label="Purchased From"
                  placeholder="Enter Purchased From"
                  error={touched.purchasedFrom && errors.purchasedFrom}
                />

                <DropDown
                  label="Country"
                  placeholder="Select Country"
                  options={['Pakistan', 'Australia', 'America']}
                  value={values.country}
                  onChange={value => setFieldValue('country', value)}
                  error={touched.country && errors.country}
                />

                <DropDown
                  label="Gender"
                  placeholder="Select Gender"
                  options={['Male', 'Female']}
                  value={values.gender}
                  onChange={value => setFieldValue('gender', value)}
                  error={touched.gender && errors.gender}
                />

                <DropDown
                  label="Condition Type"
                  placeholder="Select Type"
                  options={conditionsType}
                  value={values.type}
                  onChange={value => setFieldValue('type', value)}
                  error={touched.type && errors.type}
                />

                <View
                  style={{
                    backgroundColor: COLORS.background,
                    borderRadius: 10,
                    marginHorizontal: RF(5),
                    paddingVertical: RF(10)
                  }}
                >
                  {values.type == 'Pregnant Heifer' && (
                    <>
                      <AppInput
                        value={values.pgDays}
                        onChangeText={handleChange('pgDays')}
                        onBlur={handleBlur('pgDays')}
                        inputStyle={styles.inputStyle}
                        label="PG Days"
                        placeholder="Enter Days"
                        error={touched.pgDays && errors.pgDays}
                      />
                    </>
                  )}
                  {(values.type == 'Pregnant Cow' || values.type == 'Cow') && (
                    <>
                      <AppInput
                        value={values.price}
                        onChangeText={handleChange('price')}
                        onBlur={handleBlur('price')}
                        inputStyle={styles.inputStyle}
                        label="No. of Lactations"
                        placeholder="Enter Lactation No."
                        error={touched.price && errors.price}
                      />
                      <DatePicker
                        label="Last Calving Date"
                        placeholder="Select"
                        value={values.calvingDate}
                        onChange={val => setFieldValue('calvingDate', val)}
                        error={touched.calvingDate && errors.calvingDate}
                      />

                      <DatePicker
                        label="AI Date"
                        placeholder="Select"
                        value={values.aiDate}
                        onChange={val => setFieldValue('aiDate', val)}
                        error={touched.aiDate && errors.aiDate}
                      />
                    </>
                  )}
                  <DatePicker
                    label="Arrival Date"
                    placeholder="Select"
                    value={values.arrivalDate}
                    onChange={val => setFieldValue('arrivalDate', val)}
                    error={touched.arrivalDate && errors.arrivalDate}
                  />

                  <DatePicker
                    label="Birth Date"
                    placeholder="Select"
                    value={values.birthDate}
                    onChange={val => setFieldValue('birthDate', val)}
                    error={touched.birthDate && errors.birthDate}
                  />

                  <AppInput
                    value={values.price}
                    onChangeText={handleChange('price')}
                    onBlur={handleBlur('price')}
                    inputStyle={styles.inputStyle}
                    label="Price"
                    placeholder="Enter Price"
                    error={touched.price && errors.price}
                  />

                  <AppInput
                    value={values.weight}
                    onChangeText={handleChange('weight')}
                    onBlur={handleBlur('weight')}
                    inputStyle={styles.inputStyle}
                    label="Weight"
                    placeholder="Enter In Kgs"
                    error={touched.weight && errors.weight}
                  />
                  <DatePicker
                    label="Weight Date"
                    placeholder="Select"
                    value={values.weightDate}
                    onChange={val => setFieldValue('weightDate', val)}
                    error={touched.weightDate && errors.weightDate}
                  />

                  <DropDown
                    label="Animal Subcategory"
                    placeholder="Select Category"
                    options={conditionsType}
                    value={values.subcategory}
                    onChange={value => setFieldValue('subcategory', value)}
                    error={touched.subcategory && errors.subcategory}
                  />

                  <DropDown
                    label="Pedigree Info"
                    placeholder="Select"
                    options={['Yes', 'No']}
                    value={showPedigreeInfo ? 'Yes' : 'No'}
                    onChange={value =>
                      setShowPedigreeInfo(value == 'Yes' ? true : false)
                    }
                  />

                  {showPedigreeInfo && (
                    <>
                      <AppInput
                        value={values.sireId}
                        onChangeText={handleChange('sireId')}
                        onBlur={handleBlur('sireId')}
                        inputStyle={styles.inputStyle}
                        label="Sire Tag ID"
                        placeholder="Enter ID"
                        error={touched.sireId && errors.sireId}
                      />
                      <AppInput
                        value={values.damId}
                        onChangeText={handleChange('damId')}
                        onBlur={handleBlur('damId')}
                        inputStyle={styles.inputStyle}
                        label="Dam Tag ID"
                        placeholder="Enter ID"
                        error={touched.damId && errors.damId}
                      />
                    </>
                  )}
                </View>
              </View>

              <PrimaryButton
                title="Add"
                buttonStyle={styles.addButton}
                textStyle={styles.addText}
                onPress={handleSubmit}
              />
            </View>
          )}
        </Formik>
      </KeyboardAwareScrollView>
    </AppContainer>
  )
}

const styles = StyleSheet.create({
  bottomContainer: {
    flex: 1,

    marginHorizontal: RF(15)
  },
  inputView: {
    marginBottom: RF(15)
  },
  main: {
    backgroundColor: 'white',
    borderRadius: THEME.RADIUS.BOX,
    paddingVertical: THEME.PADDING.MID_LOW
  },
  inputStyle: {
    marginBottom: RF(10)
  },
  buttonContainer: {
    flexDirection: 'row',
    borderWidth: 1,
    alignItems: 'center'
    // justifyContent: 'space-between'
  },

  addButton: {
    // height: '70%',
    backgroundColor: COLORS.primaryMain,
    flex: 1
  },
  addText: {
    color: COLORS.white,
    fontSize: RF(14),
    fontFamily: THEME.FONTS.TYPE.MEDIUM
  },
  errorText: {
    color: COLORS.error,
    fontSize: RF(12),
    marginTop: RF(2)
  }
})

export default AddAnimal
