import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
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
  const { t } = useTranslation()
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

  const animalOptionLabel = (a: any) => `${a.name || t('health.common.unnamed')} (${a.tagName || t('health.common.noTag')})`
  const stockOptionLabel = (s: any) => `${s.name}`

  if (!allowed) {
    return (
      <AppContainer>
        <AppHeader title={t('health.addTreatment.title')} showBack />
        <View style={styles.noPerm}>
          <AppText color="descriptionColor">{t('health.addTreatment.noPermission')}</AppText>
        </View>
      </AppContainer>
    )
  }

  const onSubmit = async () => {
    const animal = animals.find(a => animalOptionLabel(a) === animalLabel)
    if (!animal) {
      Toast.show({ type: 'error', text1: t('health.common.validation'), text2: t('health.addTreatment.selectAnimal') })
      return
    }
    if (!treatmentType) {
      Toast.show({ type: 'error', text1: t('health.common.validation'), text2: t('health.addTreatment.selectTreatmentType') })
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
      Toast.show({ type: 'success', text1: t('health.common.success'), text2: t('health.addTreatment.treatmentRecorded') })
      navigation.goBack()
    } catch (e) {
      Toast.show({ type: 'error', text1: t('health.common.error'), text2: getNormalizedError(e) })
    } finally {
      setLoading(false)
    }
  }

  return (
    <AppContainer>
      <AppHeader title={t('health.addTreatment.title')} showBack />
      <ScrollView contentContainerStyle={{ padding: RF(16), paddingBottom: RF(40) }}>
        <Dropdown label={t('health.addTreatment.animal')} options={animals.map(animalOptionLabel)} value={animalLabel} onChange={setAnimalLabel} />
        <Dropdown label={t('health.addTreatment.treatmentType')} options={TREATMENT_TYPES} value={treatmentType} onChange={setTreatmentType} />
        <AppInput label={t('health.addTreatment.diagnosis')} value={diagnosis} onChangeText={setDiagnosis} placeholder={t('health.addTreatment.diagnosisPlaceholder')} error={undefined} style={undefined} />
        <AppInput label={t('health.addTreatment.medicineName')} value={medicineName} onChangeText={setMedicineName} placeholder={t('health.addTreatment.medicineNamePlaceholder')} error={undefined} style={undefined} />
        <AppInput label={t('health.addTreatment.dosage')} value={dosage} onChangeText={setDosage} placeholder={t('health.addTreatment.dosagePlaceholder')} error={undefined} style={undefined} />
        <AppInput label={t('health.addTreatment.vetName')} value={vetName} onChangeText={setVetName} placeholder={t('health.addTreatment.vetNamePlaceholder')} error={undefined} style={undefined} />
        <AppInput label={t('health.addTreatment.cost')} value={cost} onChangeText={setCost} keyboardType="numeric" placeholder="0" error={undefined} style={undefined} />
        <AppInput label={t('health.addTreatment.milkWithdrawalDays')} value={milkWithdrawalDays} onChangeText={setMilkWithdrawalDays} keyboardType="numeric" placeholder="0" error={undefined} style={undefined} />
        <AppInput label={t('health.addTreatment.meatWithdrawalDays')} value={meatWithdrawalDays} onChangeText={setMeatWithdrawalDays} keyboardType="numeric" placeholder="0" error={undefined} style={undefined} />

        <AppText fontSize="caption" color="descriptionColor" style={styles.sectionLabel}>
          {t('health.addTreatment.deductStockLabel')}
        </AppText>
        <Dropdown label={t('health.addTreatment.medicineFromStock')} options={stockItems.map(stockOptionLabel)} value={medicineStockLabel} onChange={setMedicineStockLabel} />
        <AppInput label={t('health.addTreatment.quantityUsed')} value={quantityUsed} onChangeText={setQuantityUsed} keyboardType="numeric" placeholder="0" error={undefined} style={undefined} />

        <AppInput label={t('health.addTreatment.comments')} value={comments} onChangeText={setComments} placeholder={t('health.addTreatment.commentsPlaceholder')} error={undefined} style={undefined} />

        <TouchableOpacity style={styles.checkRow} activeOpacity={0.8} onPress={() => setMarkSick(!markSick)}>
          <CheckBox
            value={markSick}
            onValueChange={setMarkSick}
            tintColors={{ true: COLORS.primaryMain, false: COLORS.labelGrey }}
          />
          <AppText style={{ marginLeft: RF(6) }}>{t('health.addTreatment.markSick')}</AppText>
        </TouchableOpacity>

        <PrimaryButton title={t('health.addTreatment.saveTreatment')} loading={loading} loaderColor={COLORS.white} onPress={onSubmit} buttonStyle={{ marginTop: RF(16) }} />
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
