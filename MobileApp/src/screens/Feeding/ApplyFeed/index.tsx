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
import { getSheds, getRecipes, applyRecipeToShed } from 'shared/services/feeding.services'
import { getNormalizedError } from 'shared/services/helper.services'
import usePermissions from 'shared/rbac/usePermissions'
import { PERMISSIONS } from 'shared/rbac/permissions'
import { COLORS } from 'shared/theme'
import { RF } from 'shared/theme/responsive'

const MEAL_TIMES = ['morning', 'afternoon', 'evening', 'night']
const today = new Date().toISOString().split('T')[0]

const ApplyFeed = () => {
  const { t } = useTranslation()
  const navigation = useNavigation<any>()
  const { can } = usePermissions()
  const canManage = can(PERMISSIONS.FEED_MANAGE)

  const [sheds, setSheds] = useState<any[]>([])
  const [recipes, setRecipes] = useState<any[]>([])
  const [shedLabel, setShedLabel] = useState('')
  const [recipeLabel, setRecipeLabel] = useState('')
  const [mealTime, setMealTime] = useState('morning')
  const [perAnimal, setPerAnimal] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    getSheds().then(r => setSheds(r?.data?.data?.sheds || [])).catch(() => {})
    getRecipes().then(r => setRecipes(r?.data?.data?.recipes || [])).catch(() => {})
  }, [])

  const onSubmit = async () => {
    const shed = sheds.find(s => s.name === shedLabel)
    const recipe = recipes.find(r => r.name === recipeLabel)
    if (!shed || !recipe) {
      Toast.show({ type: 'error', text1: t('feeding.common.validation'), text2: t('feeding.applyFeed.selectShedRecipe') })
      return
    }
    try {
      setLoading(true)
      const res = await applyRecipeToShed({
        shedId: shed.uuid,
        recipeId: recipe.uuid,
        feeding_date: today,
        meal_time: mealTime,
        quantity_per_animal: perAnimal ? Number(perAnimal) : undefined,
        auto_calculate: true
      })
      const d = res?.data?.data
      Toast.show({
        type: 'success',
        text1: t('feeding.applyFeed.feedApplied'),
        text2: d
          ? t('feeding.applyFeed.appliedSummary', { total: d.totalFeedRequired, cost: d.totalCost })
          : t('feeding.applyFeed.applied'),
        visibilityTime: 5000
      })
      navigation.goBack()
    } catch (e) {
      Toast.show({ type: 'error', text1: t('feeding.common.error'), text2: getNormalizedError(e), visibilityTime: 5000 })
    } finally {
      setLoading(false)
    }
  }

  if (!canManage) {
    return (
      <AppContainer>
        <AppHeader title={t('feeding.applyFeed.title')} showBack />
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <AppText color="error">{t('feeding.applyFeed.noPermission')}</AppText>
        </View>
      </AppContainer>
    )
  }

  return (
    <AppContainer>
      <AppHeader title={t('feeding.applyFeed.headerTitle')} showBack />
      <ScrollView contentContainerStyle={{ padding: RF(16) }}>
        <Dropdown label={t('feeding.applyFeed.shed')} options={sheds.map(s => s.name)} value={shedLabel} onChange={setShedLabel} />
        <Dropdown label={t('feeding.applyFeed.recipe')} options={recipes.map(r => r.name)} value={recipeLabel} onChange={setRecipeLabel} />
        <Dropdown label={t('feeding.applyFeed.mealTime')} options={MEAL_TIMES} value={mealTime} onChange={setMealTime} />
        <AppInput label={t('feeding.applyFeed.quantityPerAnimal')} value={perAnimal} onChangeText={setPerAnimal} keyboardType="numeric" placeholder={t('feeding.applyFeed.quantityPerAnimalPlaceholder')} />
        <PrimaryButton title={t('feeding.applyFeed.applyFeedBtn')} loading={loading} loaderColor={COLORS.white} onPress={onSubmit} buttonStyle={{ marginTop: RF(16) }} />
      </ScrollView>
    </AppContainer>
  )
}

export default ApplyFeed
