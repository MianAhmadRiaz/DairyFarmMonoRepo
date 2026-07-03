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
import { addStockTransaction, getStockItems } from 'shared/services/stock.services'
import { getNormalizedError } from 'shared/services/helper.services'
import usePermissions from 'shared/rbac/usePermissions'
import { PERMISSIONS } from 'shared/rbac/permissions'
import { COLORS } from 'shared/theme'
import { RF } from 'shared/theme/responsive'

const Consumption = () => {
  const navigation = useNavigation<any>()
  const { can } = usePermissions()
  const canManage = can(PERMISSIONS.STOCK_MANAGE)

  const [items, setItems] = useState<any[]>([])
  const [itemLabel, setItemLabel] = useState('')
  const [quantity, setQuantity] = useState('')
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    getStockItems({ limit: 200 }).then(r => setItems(r?.data?.data?.items || [])).catch(() => {})
  }, [])

  const onSubmit = async () => {
    const item = items.find(i => i.name === itemLabel)
    if (!item) {
      Toast.show({ type: 'error', text1: 'Validation', text2: 'Select an item' })
      return
    }
    if (!(Number(quantity) > 0)) {
      Toast.show({ type: 'error', text1: 'Validation', text2: 'Enter a quantity' })
      return
    }
    try {
      setLoading(true)
      await addStockTransaction({ itemId: item.uuid, quantity: Number(quantity), transaction_type: 'usage', note })
      Toast.show({ type: 'success', text1: 'Success', text2: 'Consumption recorded' })
      navigation.goBack()
    } catch (e) {
      Toast.show({ type: 'error', text1: 'Error', text2: getNormalizedError(e) })
    } finally {
      setLoading(false)
    }
  }

  if (!canManage) {
    return (
      <AppContainer>
        <AppHeader title="Consumption" showBack />
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <AppText color="error">You do not have permission to issue stock.</AppText>
        </View>
      </AppContainer>
    )
  }

  return (
    <AppContainer>
      <AppHeader title="Stock Consumption" showBack />
      <ScrollView contentContainerStyle={{ padding: RF(16) }}>
        <Dropdown label="Item" options={items.map(i => i.name)} value={itemLabel} onChange={setItemLabel} />
        <AppInput label="Quantity Used" value={quantity} onChangeText={setQuantity} keyboardType="numeric" placeholder="0" />
        <AppInput label="Note" value={note} onChangeText={setNote} placeholder="Optional" />
        <PrimaryButton title="Record Consumption" loading={loading} loaderColor={COLORS.white} onPress={onSubmit} buttonStyle={{ marginTop: RF(16) }} />
      </ScrollView>
    </AppContainer>
  )
}

export default Consumption
