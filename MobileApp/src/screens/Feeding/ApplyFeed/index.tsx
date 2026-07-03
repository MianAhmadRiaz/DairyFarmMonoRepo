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
import { getSheds, getRecipes, applyRecipeToShed } from 'shared/services/feeding.services'
import { getNormalizedError } from 'shared/services/helper.services'
import usePermissions from 'shared/rbac/usePermissions'
import { PERMISSIONS } from 'shared/rbac/permissions'
import { COLORS } from 'shared/theme'
import { RF } from 'shared/theme/responsive'

const MEAL_TIMES = ['morning', 'afternoon', 'evening', 'night']
const today = new Date().toISOString().split('T')[0]

const ApplyFeed = () => {
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
      Toast.show({ type: 'error', text1: 'Validation', text2: 'Select shed and recipe' })
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
        text1: 'Feed Applied',
        text2: d ? `Total ${d.totalFeedRequired} kg, cost ${d.totalCost}` : 'Applied',
        visibilityTime: 5000
      })
      navigation.goBack()
    } catch (e) {
      Toast.show({ type: 'error', text1: 'Error', text2: getNormalizedError(e), visibilityTime: 5000 })
    } finally {
      setLoading(false)
    }
  }

  if (!canManage) {
    return (
      <AppContainer>
        <AppHeader title="Apply Feed" showBack />
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <AppText color="error">You do not have permission to apply feed.</AppText>
        </View>
      </AppContainer>
    )
  }

  return (
    <AppContainer>
      <AppHeader title="Apply Feed to Shed" showBack />
      <ScrollView contentContainerStyle={{ padding: RF(16) }}>
        <Dropdown label="Shed" options={sheds.map(s => s.name)} value={shedLabel} onChange={setShedLabel} />
        <Dropdown label="Recipe" options={recipes.map(r => r.name)} value={recipeLabel} onChange={setRecipeLabel} />
        <Dropdown label="Meal Time" options={MEAL_TIMES} value={mealTime} onChange={setMealTime} />
        <AppInput label="Quantity per Animal (kg)" value={perAnimal} onChangeText={setPerAnimal} keyboardType="numeric" placeholder="Auto (default 5)" />
        <PrimaryButton title="Apply Feed" loading={loading} loaderColor={COLORS.white} onPress={onSubmit} buttonStyle={{ marginTop: RF(16) }} />
      </ScrollView>
    </AppContainer>
  )
}

export default ApplyFeed
