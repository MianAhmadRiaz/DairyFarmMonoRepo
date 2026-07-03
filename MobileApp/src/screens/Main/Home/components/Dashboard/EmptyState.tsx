import React from 'react'
import { View } from 'react-native'
import AppText from 'shared/components/AppText/AppText'
import { RF } from 'shared/theme/responsive'

interface Props {
  title: string
  icon?: string
}

/** Matches the web dashboard's EmptyState: emoji + muted message. */
const EmptyState = ({ title, icon = '📭' }: Props) => (
  <View style={{ paddingVertical: RF(22), alignItems: 'center' }}>
    <AppText fontSize="h5">{icon}</AppText>
    <AppText
      medium
      color="labelGrey"
      fontSize="caption"
      style={{ marginTop: RF(6), textAlign: 'center' }}
    >
      {title}
    </AppText>
  </View>
)

export default EmptyState
