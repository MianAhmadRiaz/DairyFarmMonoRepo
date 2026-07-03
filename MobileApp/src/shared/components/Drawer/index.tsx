import { useNavigation } from '@react-navigation/native'
import { ICONS } from 'assets/icons'
import React, { useState } from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'
import FastImage from 'react-native-fast-image'
import Toast from 'react-native-toast-message'
import { useDispatch, useSelector } from 'react-redux'

import PrimaryButton from 'shared/components/PrimaryButton'
import { capitalizeFirstWord } from 'shared/services/helper.services'

import { resetAuthState } from 'shared/store/reducers/authReducer'
import { resetUserState } from 'shared/store/reducers/userReducer'

import { COLORS } from 'shared/theme'
import { RF } from 'shared/theme/responsive'
import AppText from '../AppText/AppText'
import AnyIcon, { Icons } from '../AnyIcon'
import { FlatList } from 'react-native-gesture-handler'
import { RootState } from 'shared/store/configureStore'
import RoleCard from '../RoleCard/RoleCard'
import usePermissions from 'shared/rbac/usePermissions'
import { PERMISSIONS, PermissionName } from 'shared/rbac/permissions'

// The module registry: each drawer item declares the permission that makes it
// visible. Only items the user (or Owner) can access are rendered.
type DrawerModule = {
  name: string
  screen: string
  permission: PermissionName
  icon: { type: any; name: string }
}

const MODULES: DrawerModule[] = [
  { name: 'Home', screen: 'Home', permission: PERMISSIONS.DASHBOARD_VIEW, icon: { type: Icons.Entypo, name: 'home' } },
  { name: 'Animals Info', screen: 'AnimalsInfo', permission: PERMISSIONS.HERD_VIEW, icon: { type: Icons.MaterialCommunityIcons, name: 'cow' } },
  { name: 'Breeding Events', screen: 'BreedingEventsStack', permission: PERMISSIONS.BREEDING_VIEW, icon: { type: Icons.MaterialCommunityIcons, name: 'heart-pulse' } },
  { name: 'Health & Treatments', screen: 'HealthStack', permission: PERMISSIONS.HEALTH_VIEW, icon: { type: Icons.FontAwesome5, name: 'syringe' } },
  { name: 'Milk', screen: 'MilkStack', permission: PERMISSIONS.MILK_VIEW, icon: { type: Icons.MaterialCommunityIcons, name: 'cup-water' } },
  { name: 'Feeding', screen: 'FeedingStack', permission: PERMISSIONS.FEED_VIEW, icon: { type: Icons.MaterialCommunityIcons, name: 'grain' } },
  { name: 'Stock & Inventory', screen: 'StockStack', permission: PERMISSIONS.STOCK_VIEW, icon: { type: Icons.MaterialCommunityIcons, name: 'warehouse' } },
  { name: 'Employees', screen: 'EmployeeStack', permission: PERMISSIONS.EMPLOYEE_VIEW, icon: { type: Icons.Ionicons, name: 'people' } },
  { name: 'Finance', screen: 'FinanceStack', permission: PERMISSIONS.FINANCE_VIEW, icon: { type: Icons.MaterialCommunityIcons, name: 'cash-multiple' } }
]

function Drawer(props: any) {
  const dispatch = useDispatch()
  const user = useSelector((state: RootState) => state.user.user)
  const navigation = useNavigation()
  const { can } = usePermissions()
  const [handleLoading, setHandleLoading] = useState(false)

  // Only render modules the user is permitted to view. Home is always shown.
  const visibleModules = MODULES.filter(
    m => m.permission === PERMISSIONS.DASHBOARD_VIEW || can(m.permission)
  )

  const handleLogout = async () => {
    try {
      setHandleLoading(true)
      dispatch(resetAuthState())
      dispatch(resetUserState())
      Toast.show({ text1: 'Success', text2: 'Logged out', type: 'success' })
    } finally {
      setHandleLoading(false)
    }
  }

  const renderItem = ({ item, index }: { item: DrawerModule; index: number }) => (
    <TouchableOpacity
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: RF(14),
        paddingLeft: RF(10),
        borderColor: COLORS.primaryLight,
        borderBottomWidth: visibleModules.length - 1 === index ? 0 : 1
      }}
      key={index}
      onPress={() => navigation?.navigate(item.screen as never)}
    >
      <AnyIcon
        disabled
        type={item.icon.type}
        name={item.icon.name}
        size={RF(20)}
        color={COLORS.primaryMain}
        style={{ marginRight: RF(14) }}
      />
      <AppText fontSize="h6" semiBold color="primaryDark">
        {item.name}
      </AppText>
    </TouchableOpacity>
  )

  return (
    <View style={styles.container}>
      <View style={{ alignItems: 'center', marginBottom: RF(10) }}>
        <FastImage
          source={ICONS.USER}
          style={{ width: RF(60), height: RF(60), marginBottom: RF(10) }}
          resizeMode={FastImage.resizeMode.contain}
        />
        <AppText fontSize="h6" semiBold style={{ marginBottom: RF(10) }}>
          {capitalizeFirstWord(user?.firstname)}{' '}
          {capitalizeFirstWord(user?.lastname)}
        </AppText>
        <RoleCard role={user?.roleName || user?.role?.name} />
      </View>

      <FlatList
        data={visibleModules}
        renderItem={renderItem}
        keyExtractor={(item) => item.screen}
        showsVerticalScrollIndicator={false}
      />

      <PrimaryButton
        title="Logout"
        loading={handleLoading}
        loaderColor={COLORS.white}
        buttonStyle={styles.buttonStyle}
        textStyle={{ color: COLORS.primaryDark }}
        onPress={handleLogout}
      />

      <View style={{ alignItems: 'center' }}>
        <View style={styles.filtersContainer}>
          <FastImage
            source={ICONS.MAIN_LOGO_ROUND}
            style={{ width: RF(40), height: RF(40), marginRight: RF(10) }}
            resizeMode={FastImage.resizeMode.contain}
          />
          <AppText bold fontSize="h6" color="primaryMain">
            Cattle Care
          </AppText>
        </View>
        <AppText color="primaryDark" medium>
          Version: 0.1
        </AppText>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: RF(10),
    paddingTop: RF(20)
  },
  buttonStyle: {
    height: RF(40),
    borderColor: COLORS.primaryDark,
    borderWidth: 2,
    marginVertical: RF(10)
  },
  filtersContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  }
})

export default Drawer
