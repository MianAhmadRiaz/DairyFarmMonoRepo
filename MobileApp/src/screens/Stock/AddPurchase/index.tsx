import React, { useEffect, useState } from 'react'
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
      Toast.show({ type: 'error', text1: 'Validation', text2: 'Select supplier and item' })
      return
    }
    if (!(Number(quantity) > 0) || !(Number(cost) >= 0)) {
      Toast.show({ type: 'error', text1: 'Validation', text2: 'Enter valid quantity and cost' })
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
      Toast.show({ type: 'success', text1: 'Success', text2: 'Purchase recorded' })
      navigation.goBack()
    } catch (e) {
      Toast.show({ type: 'error', text1: 'Error', text2: getNormalizedError(e) })
    } finally {
      setLoading(false)
    }
  }

  if (!canPurchase) {
    return (
      <AppContainer>
        <AppHeader title="Add Purchase" showBack />
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <AppText color="error">You do not have permission to record purchases.</AppText>
        </View>
      </AppContainer>
    )
  }

  return (
    <AppContainer>
      <AppHeader title="Add Purchase" showBack />
      <ScrollView contentContainerStyle={{ padding: RF(16), paddingBottom: RF(40) }}>
        <Dropdown label="Supplier" options={suppliers.map(s => s.name)} value={supplierLabel} onChange={setSupplierLabel} />
        <Dropdown label="Item" options={items.map(i => i.name)} value={itemLabel} onChange={setItemLabel} />
        <AppInput label="Quantity" value={quantity} onChangeText={setQuantity} keyboardType="numeric" placeholder="0" />
        <AppInput label="Cost per Unit" value={cost} onChangeText={setCost} keyboardType="numeric" placeholder="0.00" />
        <AppInput label="Batch Number" value={batch} onChangeText={setBatch} placeholder="Optional" />
        <AppInput label="Expiry Date (YYYY-MM-DD)" value={expiry} onChangeText={setExpiry} placeholder="Optional" />
        <AppInput label="Note" value={note} onChangeText={setNote} placeholder="Optional" />
        <PrimaryButton title="Record Purchase" loading={loading} loaderColor={COLORS.white} onPress={onSubmit} buttonStyle={{ marginTop: RF(16) }} />
      </ScrollView>
    </AppContainer>
  )
}

export default AddPurchase
