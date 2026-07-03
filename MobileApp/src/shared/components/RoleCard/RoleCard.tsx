import React from 'react'
import { View } from 'react-native'
import AppText from 'shared/components/AppText/AppText'

import { COLORS } from 'shared/theme'
import { RF } from 'shared/theme/responsive'
import { RoleNames } from 'shared/utils/models/types'

const RoleCard = ({ role }: { role?: string }) => {
  // Prefer the human-readable API role name; fall back to the legacy map.
  const label = role ? RoleNames[role as keyof typeof RoleNames] || role : 'User'
  return (
    <View
      style={{
        display: 'flex',
        alignItems: 'center',
        borderRadius: 12,
        paddingHorizontal: RF(8),
        paddingVertical: RF(4),
        backgroundColor: COLORS.primaryLightest
      }}
    >
      <AppText medium fontSize="caption" color="primaryMain">
        {label}
      </AppText>
    </View>
  )
}

export default RoleCard
