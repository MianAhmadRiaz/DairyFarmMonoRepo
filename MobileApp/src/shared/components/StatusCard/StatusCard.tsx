import React from 'react'
import { useTranslation } from 'react-i18next'
import { View } from 'react-native'
import AppText from 'shared/components/AppText/AppText'

import { COLORS } from 'shared/theme'
import { HP, RF } from 'shared/theme/responsive'
import { RoleNames } from 'shared/utils/models/types'

const StatusCard = ({
  status = 'Active'
}: {
  status?: 'Active' | 'InActive'
}) => {
  const { t } = useTranslation()
  // Map the incoming (untranslated) status VALUE to a localized label; keep the
  // original value untranslated so callers/comparisons stay intact.
  const label = t(`shared.status.${status === 'Active' ? 'active' : 'inactive'}`, status)
  return (
    <View
      style={{
        // display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 5,
        paddingHorizontal: RF(5),
        paddingVertical: RF(1),
        height: HP(3),
        backgroundColor:
          status === 'Active' ? COLORS.secondaryMain : COLORS.errorFade
      }}
    >
      <AppText medium fontSize="caption" color="white">
        {label}
      </AppText>
    </View>
  )
}

export default StatusCard
