import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigation } from '@react-navigation/native'
import { ScrollView, View } from 'react-native'
import Toast from 'react-native-toast-message'
import AppContainer from 'shared/components/AppContainer'
import AppHeader from 'shared/components/AppHeader'
import AppInput from 'shared/components/AppInput'
import AppText from 'shared/components/AppText/AppText'
import Dropdown from 'shared/components/Dropdown'
import PrimaryButton from 'shared/components/PrimaryButton'
import { addPurchase, getStockItems, getSuppliers } from 'shared/services/stock.services'
import { getNormalizedError } from 'shared/services/helper.services'
import usePermissions from 'shared/rbac/usePermissions'
import { PERMISSIONS } from 'shared/rbac/permissions'
import { COLORS } from 'shared/theme'
import { RF } from 'shared/theme/responsive'

const today = new Date().toISOString().split('T')[0]

const AddPurchase = () => {
  const { t } = useTranslation()
  const navigation = useNavigation<any>()
  const { can } = usePermissions()
  const canPurchase = can(PERMISSIONS.STOCK_PURCHASE)

  const [suppliers, setSuppliers] = useState<any[]>([])
  const [items, setItems] = useState<any[]>([])
  const [supplierLabel, setSupplierLabel] = useState('')
  const [itemLabel, setItemLabel] = useState('')
  const [quantity, setQuantity] = useState('')
  const [cost, setCost] = useState('')
  const [batch, setBatch] = useState('')
  const [expiry, setExpiry] = useState('')
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    getSuppliers().then(r => setSuppliers(r?.data?.data?.suppliers || [])).catch(() => {})
    getStockItems({ limit: 200 }).then(r => setItems(r?.data?.data?.items || [])).catch(() => {})
  }, [])

  const onSubmit = async () => {
    const supplier = suppliers.find(s => s.name === supplierLabel)
    const item = items.find(i => i.name === itemLabel)
    if (!supplier || !item) {
      Toast.show({ type: 'error', text1: t('stock.common.validation'), text2: t('stock.addPurchase.selectSupplierItem') })
      return
    }
    if (!(Number(quantity) > 0) || !(Number(cost) >= 0)) {
      Toast.show({ type: 'error', text1: t('stock.common.validation'), text2: t('stock.addPurchase.invalidQuantityCost') })
      return
    }
    try {
      setLoading(true)
      await addPurchase({
        supplierId: supplier.uuid,
        itemId: item.uuid,
        quantity: Number(quantity),
        cost_per_unit: Number(cost),
        date: today,
        ...(batch ? { batch_number: batch } : {}),
        ...(expiry ? { expiry_date: expiry } : {}),
        ...(note ? { note } : {})
      })
      Toast.show({ type: 'success', text1: t('stock.common.success'), text2: t('stock.addPurchase.purchaseRecorded') })
      navigation.goBack()
    } catch (e) {
      Toast.show({ type: 'error', text1: t('stock.common.error'), text2: getNormalizedError(e) })
    } finally {
      setLoading(false)
    }
  }

  if (!canPurchase) {
    return (
      <AppContainer>
        <AppHeader title={t('stock.addPurchase.title')} showBack />
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <AppText color="error">{t('stock.addPurchase.noPermission')}</AppText>
        </View>
      </AppContainer>
    )
  }

  return (
    <AppContainer>
      <AppHeader title={t('stock.addPurchase.title')} showBack />
      <ScrollView contentContainerStyle={{ padding: RF(16), paddingBottom: RF(40) }}>
        <Dropdown label={t('stock.common.supplier')} options={suppliers.map(s => s.name)} value={supplierLabel} onChange={setSupplierLabel} />
        <Dropdown label={t('stock.common.item')} options={items.map(i => i.name)} value={itemLabel} onChange={setItemLabel} />
        <AppInput label={t('stock.common.quantity')} value={quantity} onChangeText={setQuantity} keyboardType="numeric" placeholder="0" />
        <AppInput label={t('stock.addPurchase.costPerUnit')} value={cost} onChangeText={setCost} keyboardType="numeric" placeholder="0.00" />
        <AppInput label={t('stock.addPurchase.batchNumber')} value={batch} onChangeText={setBatch} placeholder={t('stock.common.optional')} />
        <AppInput label={t('stock.addPurchase.expiryDateLabel')} value={expiry} onChangeText={setExpiry} placeholder={t('stock.common.optional')} />
        <AppInput label={t('stock.common.note')} value={note} onChangeText={setNote} placeholder={t('stock.common.optional')} />
        <PrimaryButton title={t('stock.addPurchase.recordPurchase')} loading={loading} loaderColor={COLORS.white} onPress={onSubmit} buttonStyle={{ marginTop: RF(16) }} />
      </ScrollView>
    </AppContainer>
  )
}

export default AddPurchase
