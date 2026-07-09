import { DrawerActions, useNavigation } from '@react-navigation/native'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { View } from 'react-native'
import { useSelector } from 'react-redux'
import AnyIcon, { Icons } from 'shared/components/AnyIcon'
import AppText from 'shared/components/AppText/AppText'
import RoleCard from 'shared/components/RoleCard/RoleCard'
import { capitalizeFirstWord } from 'shared/services/helper.services'
import { RootState } from 'shared/store/configureStore'
import { COLORS, THEME } from 'shared/theme'

import { RF, WP } from 'shared/theme/responsive'
import { GenericNavigation } from 'shared/utils/models/types'
interface Props {
  showUser: boolean
}
const HomeHeader = ({ showUser }: Props) => {
  const { t } = useTranslation()
  const user = useSelector((state: RootState) => state.user.user)
  const navigation = useNavigation()

  return (
    <View
      style={{
        backgroundColor: COLORS.background,
        paddingHorizontal: WP(6),
        paddingBottom: RF(10)
      }}
    >
      <View
        style={{
          flexDirection: 'row'
        }}
      >
        <AnyIcon
          onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}
          type={Icons.Entypo}
          name="menu"
          color="black"
          size={25}
        />
        <View style={{ marginLeft: RF(5) }}>
          <AppText bold fontSize="h7" style={{ marginVertical: RF(2) }}>
            {capitalizeFirstWord(user?.farm?.name)}
          </AppText>
          {showUser && (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center'
              }}
            >
              <AppText
                fontSize="subtitle"
                semiBold
                style={{ marginRight: RF(3) }}
              >
                {t('main.homeHeader.userLabel')}
              </AppText>
              <AppText
                fontSize="subtitle"
                medium
                style={{ marginRight: RF(3) }}
              >
                {capitalizeFirstWord(user?.firstname)}{' '}
                {capitalizeFirstWord(user?.lastname)}
              </AppText>
              <RoleCard role={user?.role?.name} />
            </View>
          )}
        </View>
      </View>
    </View>
  )
}

export default HomeHeader
