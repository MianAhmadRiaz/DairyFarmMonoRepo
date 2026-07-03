import React, { useCallback, useState } from 'react'
import { useFocusEffect } from '@react-navigation/native'
import { Modal, View } from 'react-native'
import Toast from 'react-native-toast-message'
import InfoCard from 'shared/components/InfoCard'
import ListScreen from 'shared/components/ListScreen'
import AppInput from 'shared/components/AppInput'
import AppText from 'shared/components/AppText/AppText'
import PrimaryButton from 'shared/components/PrimaryButton'
import { Icons } from 'shared/components/AnyIcon'
import { getSuppliers, addSupplier } from 'shared/services/stock.services'
import { getNormalizedError } from 'shared/services/helper.services'
import usePermissions from 'shared/rbac/usePermissions'
import { PERMISSIONS } from 'shared/rbac/permissions'
import { COLORS } from 'shared/theme'
import { RF } from 'shared/theme/responsive'

const Suppliers = () => {
  const { can } = usePermissions()
  const canManage = can(PERMISSIONS.STOCK_PURCHASE)
  const [suppliers, setSuppliers] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [modal, setModal] = useState(false)
  const [name, setName] = useState('')
  const [contact, setContact] = useState('')
  const [address, setAddress] = useState('')
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    try {
      setLoading(true)
      const res = await getSuppliers()
      setSuppliers(res?.data?.data?.suppliers || [])
    } catch (e) {
      Toast.show({ type: 'error', text1: 'Error', text2: getNormalizedError(e) })
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useFocusEffect(useCallback(() => { load() }, [load]))

  const onAdd = async () => {
    if (!name.trim()) {
      Toast.show({ type: 'error', text1: 'Validation', text2: 'Supplier name is required' })
      return
    }
    try {
      setSaving(true)
      await addSupplier({ name: name.trim(), contact: contact ? [contact] : [], address })
      Toast.show({ type: 'success', text1: 'Success', text2: 'Supplier added' })
      setModal(false)
      setName(''); setContact(''); setAddress('')
      load()
    } catch (e) {
      Toast.show({ type: 'error', text1: 'Error', text2: getNormalizedError(e) })
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <ListScreen
        title="Suppliers"
        data={suppliers}
        loading={loading}
        refreshing={refreshing}
        onRefresh={() => { setRefreshing(true); load() }}
        keyExtractor={(item: any, i) => item.uuid || String(i)}
        emptyText="No suppliers yet."
        onPressAdd={canManage ? () => setModal(true) : undefined}
        renderItem={({ item }: any) => (
          <InfoCard
            title={item.name}
            subtitle={Array.isArray(item.contact) ? item.contact.join(', ') : item.contact}
            leftIcon={{ type: Icons.MaterialCommunityIcons, name: 'account-tie' }}
            rows={[{ label: 'Address', value: item.address }]}
          />
        )}
      />
      <Modal visible={modal} transparent animationType="slide" onRequestClose={() => setModal(false)}>
        <View style={styles.backdrop}>
          <View style={styles.sheet}>
            <AppText fontSize="h6" semiBold style={{ marginBottom: RF(12) }}>Add Supplier</AppText>
            <AppInput label="Name" value={name} onChangeText={setName} placeholder="Supplier name" />
            <AppInput label="Contact" value={contact} onChangeText={setContact} placeholder="Phone / email" />
            <AppInput label="Address" value={address} onChangeText={setAddress} placeholder="Optional" />
            <View style={{ flexDirection: 'row', gap: RF(10), marginTop: RF(10) }}>
              <PrimaryButton title="Cancel" onPress={() => setModal(false)} buttonStyle={{ flex: 1, backgroundColor: COLORS.mediumGrey }} textStyle={{ color: COLORS.primaryDark }} />
              <PrimaryButton title="Add" loading={saving} loaderColor={COLORS.white} onPress={onAdd} buttonStyle={{ flex: 1 }} />
            </View>
          </View>
        </View>
      </Modal>
    </>
  )
}

const styles = {
  backdrop: { flex: 1, backgroundColor: COLORS.BLACK_TRANS, justifyContent: 'flex-end' as const },
  sheet: { backgroundColor: COLORS.background, borderTopLeftRadius: RF(20), borderTopRightRadius: RF(20), padding: RF(20) }
}

export default Suppliers
