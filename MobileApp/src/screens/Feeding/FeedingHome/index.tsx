import { useNavigation } from '@react-navigation/native'
import React from 'react'
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native'
import AppContainer from 'shared/components/AppContainer'
import AppHeader from 'shared/components/AppHeader'
import AppText from 'shared/components/AppText/AppText'
import AnyIcon, { Icons } from 'shared/components/AnyIcon'
import usePermissions from 'shared/rbac/usePermissions'
import { PERMISSIONS, PermissionName } from 'shared/rbac/permissions'
import { COLORS } from 'shared/theme'
import { RF } from 'shared/theme/responsive'

type Action = {
  label: string
  desc: string
  screen: string
  icon: { type: any; name: string }
  permission: PermissionName
}

const ACTIONS: Action[] = [
  { label: 'Recipes', desc: 'Feed formulations & ingredients', screen: 'Recipes', icon: { type: Icons.MaterialCommunityIcons, name: 'book-open-variant' }, permission: PERMISSIONS.FEED_VIEW },
  { label: 'Apply Feed to Shed', desc: 'Schedule feeding for a shed', screen: 'ApplyFeed', icon: { type: Icons.MaterialCommunityIcons, name: 'silo' }, permission: PERMISSIONS.FEED_MANAGE },
  { label: 'Feed Report', desc: 'Feeding schedules & history', screen: 'FeedReport', icon: { type: Icons.MaterialCommunityIcons, name: 'chart-box-outline' }, permission: PERMISSIONS.FEED_VIEW }
]

const FeedingHome = () => {
  const navigation = useNavigation<any>()
  const { can } = usePermissions()

  const visible = ACTIONS.filter(a => can(a.permission))

  return (
    <AppContainer>
      <AppHeader title="Feeding" showHam onPressHam={() => navigation.openDrawer?.()} />
      <ScrollView contentContainerStyle={{ padding: RF(16), paddingBottom: RF(40) }}>
        <AppText fontSize="h7" semiBold style={{ marginBottom: RF(12) }}>
          Actions
        </AppText>
        {visible.map((a, i) => (
          <TouchableOpacity key={i} style={styles.actionCard} onPress={() => navigation.navigate(a.screen)} activeOpacity={0.85}>
            <View style={styles.iconCircle}>
              <AnyIcon disabled type={a.icon.type} name={a.icon.name} size={RF(22)} color={COLORS.primaryMain} />
            </View>
            <View style={{ flex: 1 }}>
              <AppText fontSize="h7" semiBold>
                {a.label}
              </AppText>
              <AppText fontSize="caption" color="descriptionColor">
                {a.desc}
              </AppText>
            </View>
            <AnyIcon disabled type={Icons.Feather} name="chevron-right" size={RF(20)} color={COLORS.labelGrey} />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </AppContainer>
  )
}

const styles = StyleSheet.create({
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: RF(12),
    padding: RF(14),
    marginBottom: RF(12),
    elevation: 2,
    shadowColor: COLORS.cardGrey,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4
  },
  iconCircle: {
    width: RF(40),
    height: RF(40),
    borderRadius: RF(20),
    backgroundColor: COLORS.primaryLightest,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: RF(12)
  }
})

export default FeedingHome
