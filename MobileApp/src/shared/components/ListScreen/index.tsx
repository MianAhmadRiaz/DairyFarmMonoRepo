import { useNavigation } from '@react-navigation/native'
import React, { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native'
import AppContainer from 'shared/components/AppContainer'
import AppHeader from 'shared/components/AppHeader'
import AppText from 'shared/components/AppText/AppText'
import AnyIcon, { Icons } from 'shared/components/AnyIcon'
import { COLORS } from 'shared/theme'
import { RF } from 'shared/theme/responsive'

interface Props<T> {
  title: string
  data: T[]
  renderItem: ({ item, index }: { item: T; index: number }) => JSX.Element
  keyExtractor?: (item: T, index: number) => string
  loading?: boolean
  refreshing?: boolean
  onRefresh?: () => void
  emptyText?: string
  headerRight?: ReactNode
  // Floating action button (already permission-gated by the caller).
  onPressAdd?: () => void
  addIcon?: string
  ListHeaderComponent?: ReactNode
}

function ListScreen<T>({
  title,
  data,
  renderItem,
  keyExtractor,
  loading,
  refreshing,
  onRefresh,
  emptyText,
  headerRight,
  onPressAdd,
  addIcon = 'add',
  ListHeaderComponent
}: Props<T>) {
  const navigation = useNavigation<any>()
  const { t } = useTranslation()

  return (
    <AppContainer>
      <AppHeader
        title={title}
        showHam
        onPressHam={() => navigation?.openDrawer?.()}
        showBack={!navigation?.openDrawer}
        rightElement={headerRight}
      />

      {loading && !refreshing ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primaryMain} />
        </View>
      ) : (
        <FlatList
          data={data}
          renderItem={renderItem}
          keyExtractor={keyExtractor || ((_, i) => String(i))}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={ListHeaderComponent as any}
          refreshControl={
            onRefresh ? (
              <RefreshControl
                refreshing={Boolean(refreshing)}
                onRefresh={onRefresh}
                colors={[COLORS.primaryMain]}
                tintColor={COLORS.primaryMain}
              />
            ) : undefined
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <AnyIcon
                disabled
                type={Icons.MaterialCommunityIcons}
                name="clipboard-text-outline"
                size={RF(48)}
                color={COLORS.lightSilver}
              />
              <AppText color="descriptionColor" style={{ marginTop: RF(10) }}>
                {emptyText || t('shared.listScreen.empty')}
              </AppText>
            </View>
          }
        />
      )}

      {onPressAdd ? (
        <TouchableOpacity style={styles.fab} onPress={onPressAdd} activeOpacity={0.85}>
          <AnyIcon disabled type={Icons.Ionicons} name={addIcon} size={RF(26)} color={COLORS.white} />
        </TouchableOpacity>
      ) : null}
    </AppContainer>
  )
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  listContent: { padding: RF(16), paddingBottom: RF(100) },
  empty: { alignItems: 'center', justifyContent: 'center', paddingTop: RF(80) },
  fab: {
    position: 'absolute',
    bottom: RF(28),
    right: RF(20),
    width: RF(56),
    height: RF(56),
    borderRadius: RF(28),
    backgroundColor: COLORS.primaryMain,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6
  }
})

export default ListScreen
