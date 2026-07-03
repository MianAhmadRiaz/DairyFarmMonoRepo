import React, { useEffect, useState } from 'react'
import { useNavigation } from '@react-navigation/native'
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native'
import CheckBox from '@react-native-community/checkbox'
import Toast from 'react-native-toast-message'
import AppContainer from 'shared/components/AppContainer'
import AppHeader from 'shared/components/AppHeader'
import AppInput from 'shared/components/AppInput'
import AppText from 'shared/components/AppText/AppText'
import Dropdown from 'shared/components/Dropdown'
import PrimaryButton from 'shared/components/PrimaryButton'
import { addTreatment, getStockItems } from 'shared/services/health.services'
import { getAnimals } from 'shared/services/cattle.services'
import { getNormalizedError } from 'shared/services/helper.services'
import usePermissions from 'shared/rbac/usePermissions'
import { PERMISSIONS } from 'shared/rbac/permissions'
import { COLORS } from 'shared/theme'
import { RF } from 'shared/theme/responsive'

const TREATMENT_TYPES = ['treatment', 'vaccination', 'deworming', 'hoof trimming', 'vet visit', 'other']
const today = new Date().toISOString().split('T')[0]

const AddTreatment = () => {
  const navigation = useNavigation<any>()
  const { can } = usePermissions()
  const allowed = can(PERMISSIONS.HEALTH_MANAGE)

  const [animals, setAnimals] = useState<any[]>([])
  const [stockItems, setStockItems] = useState<any[]>([])
  const [animalLabel, setAnimalLabel] = useState('')
  const [treatmentType, setTreatmentType] = useState('treatment')
  const [diagnosis, setDiagnosis] = useState('')
  const [medicineName, setMedicineName] = useState('')
  const [dosage, setDosage] = useState('')
  const [vetName, setVetName] = useState('')
  const [cost, setCost] = useState('')
  const [milkWithdrawalDays, setMilkWithdrawalDays] = useState('')
  const [meatWithdrawalDays, setMeatWithdrawalDays] = useState('')
  const [comments, setComments] = useState('')
  const [medicineStockLabel, setMedicineStockLabel] = useState('')
  const [quantityUsed, setQuantityUsed] = useState('')
  const [markSick, setMarkSick] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!allowed) return
    getAnimals({ limit: 200 })
      .then(res => setAnimals(res?.data?.data?.animals || []))
      .catch(() => {})
    getStockItems({ limit: 200 })
      .then(res => setStockItems(res?.data?.data?.items || []))
      .catch(() => {})
  }, [allowed])

  const animalOptionLabel = (a: any) => `${a.name || 'Unnamed'} (${a.tagName || 'No Tag'})`
  const stockOptionLabel = (s: any) => `${s.name}`

  if (!allowed) {
    return (
      <AppContainer>
        <AppHeader title="Add Treatment" showBack />
        <View style={styles.noPerm}>
          <AppText color="descriptionColor">You do not have permission to record treatments.</AppText>
        </View>
      </AppContainer>
    )
  }

  const onSubmit = async () => {
    const animal = animals.find(a => animalOptionLabel(a) === animalLabel)
    if (!animal) {
      Toast.show({ type: 'error', text1: 'Validation', text2: 'Select an animal' })
      return
    }
    if (!treatmentType) {
      Toast.show({ type: 'error', text1: 'Validation', text2: 'Select a treatment type' })
      return
    }
    const stockItem = stockItems.find(s => stockOptionLabel(s) === medicineStockLabel)
    try {
      setLoading(true)
      const payload: any = {
        animalId: animal.uuid,
        date: today,
        treatmentType,
        diagnosis: diagnosis || undefined,
        medicineName: medicineName || undefined,
        dosage: dosage || undefined,
        vetName: vetName || undefined,
        cost: cost ? Number(cost) : 0,
        milkWithdrawalDays: milkWithdrawalDays ? Number(milkWithdrawalDays) : 0,
        meatWithdrawalDays: meatWithdrawalDays ? Number(meatWithdrawalDays) : 0,
        comments: comments || undefined,
        markSick
      }
      if (stockItem && Number(quantityUsed) > 0) {
        payload.medicineStockItemId = stockItem.uuid
        payload.quantityUsed = Number(quantityUsed)
      }
      await addTreatment(payload)
      Toast.show({ type: 'success', text1: 'Success', text2: 'Treatment recorded' })
      navigation.goBack()
    } catch (e) {
      Toast.show({ type: 'error', text1: 'Error', text2: getNormalizedError(e) })
    } finally {
      setLoading(false)
    }
  }

  return (
    <AppContainer>
      <AppHeader title="Add Treatment" showBack />
      <ScrollView contentContainerStyle={{ padding: RF(16), paddingBottom: RF(40) }}>
        <Dropdown label="Animal" options={animals.map(animalOptionLabel)} value={animalLabel} onChange={setAnimalLabel} />
        <Dropdown label="Treatment Type" options={TREATMENT_TYPES} value={treatmentType} onChange={setTreatmentType} />
        <AppInput label="Diagnosis" value={diagnosis} onChangeText={setDiagnosis} placeholder="e.g. mastitis" error={undefined} style={undefined} />
        <AppInput label="Medicine Name" value={medicineName} onChangeText={setMedicineName} placeholder="Medicine used" error={undefined} style={undefined} />
        <AppInput label="Dosage" value={dosage} onChangeText={setDosage} placeholder="e.g. 10ml" error={undefined} style={undefined} />
        <AppInput label="Vet Name" value={vetName} onChangeText={setVetName} placeholder="Attending vet" error={undefined} style={undefined} />
        <AppInput label="Cost" value={cost} onChangeText={setCost} keyboardType="numeric" placeholder="0" error={undefined} style={undefined} />
        <AppInput label="Milk Withdrawal (days)" value={milkWithdrawalDays} onChangeText={setMilkWithdrawalDays} keyboardType="numeric" placeholder="0" error={undefined} style={undefined} />
        <AppInput label="Meat Withdrawal (days)" value={meatWithdrawalDays} onChangeText={setMeatWithdrawalDays} keyboardType="numeric" placeholder="0" error={undefined} style={undefined} />

        <AppText fontSize="caption" color="descriptionColor" style={styles.sectionLabel}>
          Deduct medicine from stock (optional)
        </AppText>
        <Dropdown label="Medicine from Stock" options={stockItems.map(stockOptionLabel)} value={medicineStockLabel} onChange={setMedicineStockLabel} />
        <AppInput label="Quantity Used" value={quantityUsed} onChangeText={setQuantityUsed} keyboardType="numeric" placeholder="0" error={undefined} style={undefined} />

        <AppInput label="Comments" value={comments} onChangeText={setComments} placeholder="Additional notes" error={undefined} style={undefined} />

        <TouchableOpacity style={styles.checkRow} activeOpacity={0.8} onPress={() => setMarkSick(!markSick)}>
          <CheckBox
            value={markSick}
            onValueChange={setMarkSick}
            tintColors={{ true: COLORS.primaryMain, false: COLORS.labelGrey }}
          />
          <AppText style={{ marginLeft: RF(6) }}>Mark this animal as sick</AppText>
        </TouchableOpacity>

        <PrimaryButton title="Save Treatment" loading={loading} loaderColor={COLORS.white} onPress={onSubmit} buttonStyle={{ marginTop: RF(16) }} />
      </ScrollView>
    </AppContainer>
  )
}

const styles = StyleSheet.create({
  noPerm: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: RF(20) },
  sectionLabel: { marginTop: RF(16), marginLeft: RF(20) },
  checkRow: { flexDirection: 'row', alignItems: 'center', marginTop: RF(16), marginLeft: RF(16) }
})

export default AddTreatment
