import React from 'react'
import { FlatList, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import AppHeader from 'shared/components/AppHeader'
import { breedingEvents } from 'shared/utils/constants/constants'
import { GenericNavigation } from 'shared/utils/models/types'
import {
  BreedingEventItem,
  BreedingEventType
} from '../components/BreedingEventItem'
import styles from './style'

interface Props extends GenericNavigation {}
const BreedingEvents = (props: Props) => {
  const { t } = useTranslation()
  const renderItem = ({ item }: { item: BreedingEventType }) => (
    <BreedingEventItem item={item} />
  )

  return (
    <>
      <View style={styles.container}>
        <AppHeader showBack title={t('breeding.mainScreen.headerTitle')} />

        <FlatList
          data={breedingEvents}
          renderItem={renderItem}
          keyExtractor={item => item.id.toString()}
          numColumns={2}
          contentContainerStyle={{ paddingHorizontal: 10 }}
        />
      </View>
    </>
  )
}

export default BreedingEvents
