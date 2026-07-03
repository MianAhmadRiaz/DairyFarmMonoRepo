import React, { useCallback, useEffect, useState } from 'react'
import { useNavigation } from '@react-navigation/native'
import { ScrollView, StyleSheet, View } from 'react-native'
import Toast from 'react-native-toast-message'
import AppContainer from 'shared/components/AppContainer'
import AppHeader from 'shared/components/AppHeader'
import AppInput from 'shared/components/AppInput'
import AppText from 'shared/components/AppText/AppText'
import PrimaryButton from 'shared/components/PrimaryButton'
import Dropdown from 'shared/components/Dropdown'
import { getMilkByDate, milkOut, getCompanies } from 'shared/services/milk.services'
import { getNormalizedError } from 'shared/services/helper.services'
import usePermissions from 'shared/rbac/usePermissions'
import { PERMISSIONS } from 'shared/rbac/permissions'
import { COLORS } from 'shared/theme'
import { RF } from 'shared/theme/responsive'

const OUT_TYPES = [
  { label: 'Company (Sale)', value: 'sell' },
  { label: 'Suckler (Calves)', value: 'suckler' },
  { label: 'Employee', value: 'employee' },
  { label: 'Dumped / Withheld', value: 'dumped' },
  { label: 'Other', value: 'other' }
]

const today = new Date().toISOString().split('T')[0]

const MilkOut = () => {
  const navigation = useNavigation<any>()
  const { can } = usePermissions()
  const canDispatch = can(PERMISSIONS.MILK_DISPATCH)

  const [remaining, setRemaining] = useState<number>(0)
  const [outTypeLabel, setOutTypeLabel] = useState('Company (Sale)')
  const [companies, setCompanies] = useState<any[]>([])
  const [companyName, setCompanyName] = useState('')
  const [volume, setVolume] = useState('')
  const [pricePerLitre, setPricePerLitre] = useState('')
  const [fat, setFat] = useState('')
  const [snf, setSnf] = useState('')
  const [loading, setLoading] = useState(false)

  const outType = OUT_TYPES.find(t => t.label === outTypeLabel)?.value || 'other'
  const isSale = outType === 'sell'

  const loadData = useCallback(async () => {
    try {
      const milk = await getMilkByDate(today)
      setRemaining(milk?.data?.data?.totalRemainingMilk ?? 0)
      const comp = await getCompanies()
      setCompanies(comp?.data?.data?.companies || [])
    } catch (e) {
      // non-blocking
    }
  }, [])

  useEffect(() => { loadData() }, [loadData])

  const onSubmit = async () => {
    if (!(Number(volume) > 0)) {
      Toast.show({ type: 'error', text1: 'Validation', text2: 'Enter a volume greater than 0' })
      return
    }
    if (isSale && !(Number(pricePerLitre) > 0)) {
      Toast.show({ type: 'error', text1: 'Validation', text2: 'Price per litre is required for a sale' })
      return
    }
    try {
      setLoading(true)
      const companyId = companies.find(c => c.name === companyName)?.uuid
      const payload: any = {
        date: today,
        volume: Number(volume),
        outType,
        ...(isSale ? { companyId, pricePerLitre: Number(pricePerLitre) } : {}),
        ...(fat ? { fat: Number(fat) } : {}),
        ...(snf ? { snf: Number(snf) } : {})
      }
      await milkOut(payload)
      Toast.show({ type: 'success', text1: 'Success', text2: 'Milk out recorded' })
      navigation.goBack()
    } catch (e) {
      Toast.show({ type: 'error', text1: 'Error', text2: getNormalizedError(e) })
    } finally {
      setLoading(false)
    }
  }

  if (!canDispatch) {
    return (
      <AppContainer>
        <AppHeader title="Milk Out" showBack />
        <View style={styles.noPerm}>
          <AppText color="error">You do not have permission to dispatch milk.</AppText>
        </View>
      </AppContainer>
    )
  }

  return (
    <AppContainer>
      <AppHeader title="Milk Out / Dispatch" showBack />
      <ScrollView contentContainerStyle={{ padding: RF(16), paddingBottom: RF(40) }}>
        <View style={styles.remainingCard}>
          <AppText color="descriptionColor" fontSize="caption">Remaining in tank</AppText>
          <AppText fontSize="h4" bold color="primaryMain">{remaining} L</AppText>
        </View>

        <Dropdown
          label="Out Type"
          options={OUT_TYPES.map(t => t.label)}
          value={outTypeLabel}
          onChange={setOutTypeLabel}
        />

        {isSale ? (
          <>
            <Dropdown
              label="Company"
              options={companies.map(c => c.name)}
              value={companyName}
              onChange={setCompanyName}
            />
            <AppInput label="Price / Litre" value={pricePerLitre} onChangeText={setPricePerLitre} keyboardType="numeric" placeholder="0.00" />
            <AppInput label="Fat %" value={fat} onChangeText={setFat} keyboardType="numeric" placeholder="Optional" />
            <AppInput label="SNF %" value={snf} onChangeText={setSnf} keyboardType="numeric" placeholder="Optional" />
          </>
        ) : null}

        <AppInput label="Volume (L)" value={volume} onChangeText={setVolume} keyboardType="numeric" placeholder="0" />

        <PrimaryButton
          title="Record Milk Out"
          loading={loading}
          loaderColor={COLORS.white}
          onPress={onSubmit}
          buttonStyle={{ marginTop: RF(16) }}
        />
      </ScrollView>
    </AppContainer>
  )
}

const styles = StyleSheet.create({
  remainingCard: {
    backgroundColor: COLORS.primaryLightest,
    borderRadius: RF(12),
    padding: RF(16),
    marginBottom: RF(16),
    alignItems: 'center'
  },
  noPerm: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: RF(20) }
})

export default MilkOut
