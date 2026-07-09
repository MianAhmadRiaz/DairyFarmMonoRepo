import React, { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
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
  const { t } = useTranslation()
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
      Toast.show({ type: 'error', text1: t('stock.common.error'), text2: getNormalizedError(e) })
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useFocusEffect(useCallback(() => { load() }, [load]))

  const onAdd = async () => {
    if (!name.trim()) {
      Toast.show({ type: 'error', text1: t('stock.common.validation'), text2: t('stock.suppliers.nameRequired') })
      return
    }
    try {
      setSaving(true)
      await addSupplier({ name: name.trim(), contact: contact ? [contact] : [], address })
      Toast.show({ type: 'success', text1: t('stock.common.success'), text2: t('stock.suppliers.supplierAdded') })
      setModal(false)
      setName(''); setContact(''); setAddress('')
      load()
    } catch (e) {
      Toast.show({ type: 'error', text1: t('stock.common.error'), text2: getNormalizedError(e) })
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <ListScreen
        title={t('stock.suppliers.title')}
        data={suppliers}
        loading={loading}
        refreshing={refreshing}
        onRefresh={() => { setRefreshing(true); load() }}
        keyExtractor={(item: any, i) => item.uuid || String(i)}
        emptyText={t('stock.suppliers.empty')}
        onPressAdd={canManage ? () => setModal(true) : undefined}
        renderItem={({ item }: any) => (
          <InfoCard
            title={item.name}
            subtitle={Array.isArray(item.contact) ? item.contact.join(', ') : item.contact}
            leftIcon={{ type: Icons.MaterialCommunityIcons, name: 'account-tie' }}
            rows={[{ label: t('stock.suppliers.address'), value: item.address }]}
          />
        )}
      />
      <Modal visible={modal} transparent animationType="slide" onRequestClose={() => setModal(false)}>
        <View style={styles.backdrop}>
          <View style={styles.sheet}>
            <AppText fontSize="h6" semiBold style={{ marginBottom: RF(12) }}>{t('stock.suppliers.addSupplier')}</AppText>
            <AppInput label={t('stock.suppliers.name')} value={name} onChangeText={setName} placeholder={t('stock.suppliers.namePlaceholder')} />
            <AppInput label={t('stock.suppliers.contact')} value={contact} onChangeText={setContact} placeholder={t('stock.suppliers.contactPlaceholder')} />
            <AppInput label={t('stock.suppliers.address')} value={address} onChangeText={setAddress} placeholder={t('stock.common.optional')} />
            <View style={{ flexDirection: 'row', gap: RF(10), marginTop: RF(10) }}>
              <PrimaryButton title={t('common.cancel')} onPress={() => setModal(false)} buttonStyle={{ flex: 1, backgroundColor: COLORS.mediumGrey }} textStyle={{ color: COLORS.primaryDark }} />
              <PrimaryButton title={t('common.add')} loading={saving} loaderColor={COLORS.white} onPress={onAdd} buttonStyle={{ flex: 1 }} />
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
