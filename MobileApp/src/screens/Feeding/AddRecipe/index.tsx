import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigation } from '@react-navigation/native'
import { ScrollView, TouchableOpacity, View } from 'react-native'
import Toast from 'react-native-toast-message'
import AppContainer from 'shared/components/AppContainer'
import AppHeader from 'shared/components/AppHeader'
import AppInput from 'shared/components/AppInput'
import AppText from 'shared/components/AppText/AppText'
import Dropdown from 'shared/components/Dropdown'
import PrimaryButton from 'shared/components/PrimaryButton'
import AnyIcon, { Icons } from 'shared/components/AnyIcon'
import { createRecipe, getRecipeGroups, getIngredients } from 'shared/services/feeding.services'
import { getNormalizedError } from 'shared/services/helper.services'
import usePermissions from 'shared/rbac/usePermissions'
import { PERMISSIONS } from 'shared/rbac/permissions'
import { COLORS } from 'shared/theme'
import { RF } from 'shared/theme/responsive'

type IngRow = { label: string; quantity: string }

const AddRecipe = () => {
  const { t } = useTranslation()
  const navigation = useNavigation<any>()
  const { can } = usePermissions()
  const canManage = can(PERMISSIONS.FEED_MANAGE)

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [groups, setGroups] = useState<any[]>([])
  const [groupLabel, setGroupLabel] = useState('')
  const [ingredients, setIngredients] = useState<any[]>([])
  const [rows, setRows] = useState<IngRow[]>([{ label: '', quantity: '' }])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    getRecipeGroups().then(r => setGroups(r?.data?.data?.recipeGroups || r?.data?.data?.groups || [])).catch(() => {})
    getIngredients().then(r => setIngredients(r?.data?.data?.ingredients || [])).catch(() => {})
  }, [])

  const addRow = () => setRows(prev => [...prev, { label: '', quantity: '' }])
  const updateRow = (i: number, key: keyof IngRow, value: string) =>
    setRows(prev => prev.map((r, idx) => (idx === i ? { ...r, [key]: value } : r)))
  const removeRow = (i: number) => setRows(prev => prev.filter((_, idx) => idx !== i))

  const onSubmit = async () => {
    if (!name.trim()) {
      Toast.show({ type: 'error', text1: t('feeding.common.validation'), text2: t('feeding.addRecipe.nameRequired') })
      return
    }
    const group = groups.find(g => g.name === groupLabel)
    const items = rows
      .map(r => {
        const ing = ingredients.find(i => (i.name || i.item_name) === r.label)
        return ing && Number(r.quantity) > 0 ? { itemId: ing.uuid, quantity: Number(r.quantity) } : null
      })
      .filter(Boolean)
    if (items.length === 0) {
      Toast.show({ type: 'error', text1: t('feeding.common.validation'), text2: t('feeding.addRecipe.ingredientRequired') })
      return
    }
    try {
      setLoading(true)
      await createRecipe({ name: name.trim(), description, recipeGroupId: group?.uuid, ingredients: items })
      Toast.show({ type: 'success', text1: t('feeding.common.success'), text2: t('feeding.addRecipe.recipeCreated') })
      navigation.goBack()
    } catch (e) {
      Toast.show({ type: 'error', text1: t('feeding.common.error'), text2: getNormalizedError(e) })
    } finally {
      setLoading(false)
    }
  }

  if (!canManage) {
    return (
      <AppContainer>
        <AppHeader title={t('feeding.addRecipe.title')} showBack />
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <AppText color="error">{t('feeding.addRecipe.noPermission')}</AppText>
        </View>
      </AppContainer>
    )
  }

  return (
    <AppContainer>
      <AppHeader title={t('feeding.addRecipe.title')} showBack />
      <ScrollView contentContainerStyle={{ padding: RF(16), paddingBottom: RF(40) }}>
        <AppInput label={t('feeding.addRecipe.recipeName')} value={name} onChangeText={setName} placeholder={t('feeding.addRecipe.recipeNamePlaceholder')} />
        <AppInput label={t('feeding.addRecipe.description')} value={description} onChangeText={setDescription} placeholder={t('feeding.addRecipe.descriptionPlaceholder')} />
        <Dropdown label={t('feeding.addRecipe.recipeGroup')} options={groups.map(g => g.name)} value={groupLabel} onChange={setGroupLabel} />

        <AppText fontSize="h7" semiBold style={{ marginTop: RF(16), marginBottom: RF(8) }}>
          {t('feeding.addRecipe.ingredients')}
        </AppText>
        {rows.map((row, i) => (
          <View key={i} style={{ marginBottom: RF(12), backgroundColor: COLORS.white, borderRadius: RF(10), padding: RF(10) }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <AppText fontSize="caption" color="labelGrey">{t('feeding.addRecipe.ingredientN', { count: i + 1 })}</AppText>
              {rows.length > 1 ? (
                <TouchableOpacity onPress={() => removeRow(i)}>
                  <AnyIcon disabled type={Icons.Feather} name="x" size={RF(18)} color={COLORS.error} />
                </TouchableOpacity>
              ) : null}
            </View>
            <Dropdown label="" options={ingredients.map(x => x.name || x.item_name)} value={row.label} onChange={v => updateRow(i, 'label', v)} />
            <AppInput label={t('feeding.addRecipe.quantityKg')} value={row.quantity} onChangeText={v => updateRow(i, 'quantity', v)} keyboardType="numeric" placeholder="0" />
          </View>
        ))}
        <TouchableOpacity onPress={addRow} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: RF(16) }}>
          <AnyIcon disabled type={Icons.Ionicons} name="add-circle" size={RF(22)} color={COLORS.primaryMain} />
          <AppText color="primaryMain" medium style={{ marginLeft: RF(6) }}>{t('feeding.addRecipe.addIngredient')}</AppText>
        </TouchableOpacity>

        <PrimaryButton title={t('feeding.addRecipe.createRecipe')} loading={loading} loaderColor={COLORS.white} onPress={onSubmit} />
      </ScrollView>
    </AppContainer>
  )
}

export default AddRecipe
