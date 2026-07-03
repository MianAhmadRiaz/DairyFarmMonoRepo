import React from 'react'
import { ActivityIndicator, View } from 'react-native'
import { COLORS } from 'shared/theme'
import { RF } from 'shared/theme/responsive'

/** Centered spinner shown while a dashboard tab loads its data. */
const TabLoader = () => (
  <View style={{ paddingVertical: RF(60), alignItems: 'center' }}>
    <ActivityIndicator size="large" color={COLORS.primaryMain} />
  </View>
)

export default TabLoader
