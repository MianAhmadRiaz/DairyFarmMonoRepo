import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FlatList, Text, TouchableOpacity, View } from 'react-native'
import NavRoutes from 'routes/NavRoutes'
import AppHeader from 'shared/components/AppHeader'
import AppText from 'shared/components/AppText/AppText'
import ListEmptyComponent from 'shared/components/ListEmptyComponent'
import PrimaryButton from 'shared/components/PrimaryButton'
import { getHeatDetection } from 'shared/services/breedingEvents.services'
import { GenericNavigation } from 'shared/utils/models/types'
import styles from './style'

interface Props extends GenericNavigation {}
const HeatDetection = (props: Props) => {
  const { t } = useTranslation()
  const [detections, setDetections] = useState([])
  const data = new Array(10).fill({
    sr: '01',
    date: '2025-01-10',
    tagId: '2028',
    price: '12.5'
  })

  const navigateToAdd = () => {
    props?.navigation?.navigate(NavRoutes.ADD_HEAT_DETECTION)
  }

  const fetchHeatDetections = async () => {
    try {
      const response = await getHeatDetection()
      console.log('response', response.data?.data.heatEventHistory)
      setDetections(response.data?.data.heatEventHistory)
    } catch (e) {
      console.log('Error getting heat dtections', e)
    }
  }
  useEffect(() => {
    fetchHeatDetections()
  }, [])
  return (
    <>
      <View style={styles.container}>
        <AppHeader title={t('breeding.heatDetection.headerTitle')} showHam />

        <View style={styles.recentEntriesContainer}>
          <AppText fontSize="h6" bold color={'darkestGrey'}>
            {t('breeding.common.recentEntries')}
          </AppText>
          <View style={{ flexShrink: 1 }}>
            <PrimaryButton
              title={t('breeding.common.addNew')}
              buttonStyle={styles.button}
              textStyle={styles.buttonText}
              onPress={navigateToAdd}
            />
          </View>
        </View>

        <View style={styles.tableHeader}>
          <Text style={styles.headerText}>{t('breeding.common.cols.srNo')}</Text>
          <Text style={styles.headerText}>{t('breeding.common.cols.aiDate')}</Text>
          <Text style={styles.headerText}>{t('breeding.common.cols.tagId')}</Text>
          <Text style={styles.headerText}>{t('breeding.common.cols.price')}</Text>
        </View>

        <FlatList
          contentContainerStyle={{ flexGrow: 1 }}
          style={styles.tableContainer}
          data={detections}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item, index }: { item: any; index: number }) => (
            <View style={styles.row}>
              <Text style={styles.rowText}>{item.sr}</Text>
              <Text style={styles.rowText}>{item.date}</Text>
              <Text style={styles.rowText}>{item.tagId}</Text>
              <Text style={styles.rowText}>{item.price}</Text>
            </View>
          )}
          ListEmptyComponent={<ListEmptyComponent />}
          ListFooterComponent={
            detections?.length > 0 ? (
              <TouchableOpacity style={styles.loadMore}>
                <AppText fontSize="subtitle" bold color={'darkestGrey'}>
                  {t('breeding.common.loadMore')}
                </AppText>
              </TouchableOpacity>
            ) : null
          }
        />
      </View>
    </>
  )
}

export default HeatDetection
