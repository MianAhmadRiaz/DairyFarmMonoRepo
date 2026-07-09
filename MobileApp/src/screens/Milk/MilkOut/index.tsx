import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
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

const today = new Date().toISOString().split('T')[0]

const MilkOut = () => {
  const { t } = useTranslation()
  const navigation = useNavigation<any>()
  const { can } = usePermissions()
  const canDispatch = can(PERMISSIONS.MILK_DISPATCH)

  const OUT_TYPES = useMemo(() => [
    { label: t('milk.milkOut.outTypes.sell'), value: 'sell' },
    { label: t('milk.milkOut.outTypes.suckler'), value: 'suckler' },
    { label: t('milk.milkOut.outTypes.employee'), value: 'employee' },
    { label: t('milk.milkOut.outTypes.dumped'), value: 'dumped' },
    { label: t('milk.milkOut.outTypes.other'), value: 'other' }
  ], [t])

  const [remaining, setRemaining] = useState<number>(0)
  const [outTypeLabel, setOutTypeLabel] = useState(() => t('milk.milkOut.outTypes.sell'))
  const [companies, setCompanies] = useState<any[]>([])
  const [companyName, setCompanyName] = useState('')
  const [volume, setVolume] = useState('')
  const [pricePerLitre, setPricePerLitre] = useState('')
  const [fat, setFat] = useState('')
  const [snf, setSnf] = useState('')
  const [loading, setLoading] = useState(false)

  const outType = OUT_TYPES.find(o => o.label === outTypeLabel)?.value || 'other'
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
      Toast.show({ type: 'error', text1: t('milk.common.validation'), text2: t('milk.milkOut.enterVolume') })
      return
    }
    if (isSale && !(Number(pricePerLitre) > 0)) {
      Toast.show({ type: 'error', text1: t('milk.common.validation'), text2: t('milk.milkOut.priceRequired') })
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
      Toast.show({ type: 'success', text1: t('milk.common.success'), text2: t('milk.milkOut.milkOutRecorded') })
      navigation.goBack()
    } catch (e) {
      Toast.show({ type: 'error', text1: t('milk.common.error'), text2: getNormalizedError(e) })
    } finally {
      setLoading(false)
    }
  }

  if (!canDispatch) {
    return (
      <AppContainer>
        <AppHeader title={t('milk.milkOut.shortTitle')} showBack />
        <View style={styles.noPerm}>
          <AppText color="error">{t('milk.milkOut.noPermission')}</AppText>
        </View>
      </AppContainer>
    )
  }

  return (
    <AppContainer>
      <AppHeader title={t('milk.milkOut.title')} showBack />
      <ScrollView contentContainerStyle={{ padding: RF(16), paddingBottom: RF(40) }}>
        <View style={styles.remainingCard}>
          <AppText color="descriptionColor" fontSize="caption">{t('milk.milkOut.remainingInTank')}</AppText>
          <AppText fontSize="h4" bold color="primaryMain">{remaining} L</AppText>
        </View>

        <Dropdown
          label={t('milk.milkOut.outType')}
          options={OUT_TYPES.map(o => o.label)}
          value={outTypeLabel}
          onChange={setOutTypeLabel}
        />

        {isSale ? (
          <>
            <Dropdown
              label={t('milk.milkOut.company')}
              options={companies.map(c => c.name)}
              value={companyName}
              onChange={setCompanyName}
            />
            <AppInput label={t('milk.milkOut.pricePerLitre')} value={pricePerLitre} onChangeText={setPricePerLitre} keyboardType="numeric" placeholder="0.00" />
            <AppInput label={t('milk.milkOut.fat')} value={fat} onChangeText={setFat} keyboardType="numeric" placeholder={t('milk.common.optional')} />
            <AppInput label={t('milk.milkOut.snf')} value={snf} onChangeText={setSnf} keyboardType="numeric" placeholder={t('milk.common.optional')} />
          </>
        ) : null}

        <AppInput label={t('milk.milkOut.volume')} value={volume} onChangeText={setVolume} keyboardType="numeric" placeholder="0" />

        <PrimaryButton
          title={t('milk.milkOut.recordMilkOut')}
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
