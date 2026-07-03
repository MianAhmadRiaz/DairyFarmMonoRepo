import { createStackNavigator } from '@react-navigation/stack'
import React from 'react'
import FeedingHome from 'screens/Feeding/FeedingHome'
import Recipes from 'screens/Feeding/Recipes'
import AddRecipe from 'screens/Feeding/AddRecipe'
import ApplyFeed from 'screens/Feeding/ApplyFeed'
import FeedReport from 'screens/Feeding/FeedReport'

const Stack = createStackNavigator()

const FeedingStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false, gestureEnabled: false }}>
    <Stack.Screen name="FeedingHome" component={FeedingHome} />
    <Stack.Screen name="Recipes" component={Recipes} />
    <Stack.Screen name="AddRecipe" component={AddRecipe} />
    <Stack.Screen name="ApplyFeed" component={ApplyFeed} />
    <Stack.Screen name="FeedReport" component={FeedReport} />
  </Stack.Navigator>
)

export default FeedingStack
