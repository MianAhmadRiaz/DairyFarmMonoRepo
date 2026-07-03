import { useNavigation, useFocusEffect } from '@react-navigation/native'
import React, { useCallback, useState } from 'react'
import Toast from 'react-native-toast-message'
import InfoCard from 'shared/components/InfoCard'
import ListScreen from 'shared/components/ListScreen'
import { Icons } from 'shared/components/AnyIcon'
import { getRecipes } from 'shared/services/feeding.services'
import { getNormalizedError } from 'shared/services/helper.services'
import usePermissions from 'shared/rbac/usePermissions'
import { PERMISSIONS } from 'shared/rbac/permissions'

const Recipes = () => {
  const navigation = useNavigation<any>()
  const { can } = usePermissions()
  const [recipes, setRecipes] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  const load = useCallback(async () => {
    try {
      setLoading(true)
      const res = await getRecipes()
      const rows = res?.data?.data?.recipes || []
      setRecipes(Array.isArray(rows) ? rows : [])
    } catch (e) {
      Toast.show({ type: 'error', text1: 'Error', text2: getNormalizedError(e) })
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useFocusEffect(useCallback(() => { load() }, [load]))

  const renderItem = ({ item }: any) => (
    <InfoCard
      title={item.name || 'Recipe'}
      subtitle={item.recipeGroup?.name}
      leftIcon={{ type: Icons.MaterialCommunityIcons, name: 'book-open-variant' }}
      rows={[
        { label: 'Ingredients', value: item.ingredientsCount ?? item.totalIngredients },
        { label: 'Cost / kg', value: item.cost_per_kg ?? item.costPerKg }
      ]}
    />
  )

  return (
    <ListScreen
      title="Recipes"
      data={recipes}
      renderItem={renderItem}
      loading={loading}
      refreshing={refreshing}
      onRefresh={() => { setRefreshing(true); load() }}
      emptyText="No recipes found."
      keyExtractor={(item: any, i) => item.uuid || String(i)}
      onPressAdd={can(PERMISSIONS.FEED_MANAGE) ? () => navigation.navigate('AddRecipe') : undefined}
    />
  )
}

export default Recipes
