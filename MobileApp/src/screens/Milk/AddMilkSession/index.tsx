import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigation } from '@react-navigation/native'
import { ScrollView } from 'react-native'
import Toast from 'react-native-toast-message'
import AppContainer from 'shared/components/AppContainer'
import AppHeader from 'shared/components/AppHeader'
import AppInput from 'shared/components/AppInput'
import Dropdown from 'shared/components/Dropdown'
import PrimaryButton from 'shared/components/PrimaryButton'
import { addMilkingSession } from 'shared/services/milk.services'
import { getAnimals } from 'shared/services/cattle.services'
import { getNormalizedError } from 'shared/services/helper.services'
import { COLORS } from 'shared/theme'
import { RF } from 'shared/theme/responsive'

const TIMES = ['morning', 'afternoon', 'evening']
const today = new Date().toISOString().split('T')[0]

const AddMilkSession = () => {
  const { t } = useTranslation()
  const navigation = useNavigation<any>()
  const [animals, setAnimals] = useState<any[]>([])
  const [animalLabel, setAnimalLabel] = useState('')
  const [milkingTime, setMilkingTime] = useState('morning')
  const [milk, setMilk] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    getAnimals({ limit: 200 })
      .then(res => setAnimals((res?.data?.data?.animals || []).filter((a: any) => a.gender === 'female')))
      .catch(() => {})
  }, [])

  const label = (a: any) => `${a.name || t('milk.addMilkSession.unnamed')} (${a.tagName || t('milk.addMilkSession.noTag')})`

  const onSubmit = async () => {
    const animal = animals.find(a => label(a) === animalLabel)
    if (!animal) {
      Toast.show({ type: 'error', text1: t('milk.common.validation'), text2: t('milk.addMilkSession.selectAnimal') })
      return
    }
    if (!(Number(milk) >= 0)) {
      Toast.show({ type: 'error', text1: t('milk.common.validation'), text2: t('milk.addMilkSession.enterMilkQuantity') })
      return
    }
    try {
      setLoading(true)
      const res = await addMilkingSession({ animalId: animal.uuid, date: today, milkingTime, milk: Number(milk) })
      if (res?.data?.data?.underMilkWithdrawal) {
        Toast.show({
          type: 'info',
          text1: t('milk.addMilkSession.withdrawalWarningTitle'),
          text2: t('milk.addMilkSession.withdrawalWarningBody', { date: res.data.data.milkWithdrawalUntil }),
          visibilityTime: 6000
        })
      } else {
        Toast.show({ type: 'success', text1: t('milk.common.success'), text2: t('milk.addMilkSession.sessionRecorded') })
      }
      navigation.goBack()
    } catch (e) {
      Toast.show({ type: 'error', text1: t('milk.common.error'), text2: getNormalizedError(e) })
    } finally {
      setLoading(false)
    }
  }

  return (
    <AppContainer>
      <AppHeader title={t('milk.addMilkSession.title')} showBack />
      <ScrollView contentContainerStyle={{ padding: RF(16) }}>
        <Dropdown label={t('milk.addMilkSession.animal')} options={animals.map(label)} value={animalLabel} onChange={setAnimalLabel} />
        <Dropdown label={t('milk.addMilkSession.milkingTime')} options={TIMES} value={milkingTime} onChange={setMilkingTime} />
        <AppInput label={t('milk.addMilkSession.milkL')} value={milk} onChangeText={setMilk} keyboardType="numeric" placeholder="0" />
        <PrimaryButton title={t('milk.addMilkSession.saveSession')} loading={loading} loaderColor={COLORS.white} onPress={onSubmit} buttonStyle={{ marginTop: RF(16) }} />
      </ScrollView>
    </AppContainer>
  )
}

export default AddMilkSession
