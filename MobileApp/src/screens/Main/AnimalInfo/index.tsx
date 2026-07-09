import BottomSheet from '@gorhom/bottom-sheet'
import { useNavigation } from '@react-navigation/native'
import { ICONS } from 'assets/icons'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native'
import FastImage from 'react-native-fast-image'
import { useTranslation } from 'react-i18next'
import AnyIcon, { Icons } from 'shared/components/AnyIcon'
import AppContainer from 'shared/components/AppContainer'
import AppHeader from 'shared/components/AppHeader'
import AppInput from 'shared/components/AppInput'
import AppText from 'shared/components/AppText/AppText'
import StatusCard from 'shared/components/StatusCard/StatusCard'
import { getAnimals } from 'shared/services/cattle.services'
import { COLORS } from 'shared/theme'
import { RF } from 'shared/theme/responsive'
import { animals } from 'shared/utils/constants/constants'

const AnimalInfo = () => {
  const { t } = useTranslation()
  const navigation = useNavigation()
  const bottomSheetRef = useRef<BottomSheet>(null)

  // const [animals, setAnimals] = useState([])
  const [filteredAnimals, setFilteredAnimals] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState({
    type: '',
    gender: '',
    breed: '',
    status: ''
  })

  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)

  // Fetch Data from API
  const fetchAnimals = async (pageNum = 1) => {
    if (loading || !hasMore) return
    setLoading(true)

    try {
      const response = await getAnimals()
      console.log('Response animals', response?.data?.data?.animals)
      const result = response?.data?.data?.animals
      if (response.status == 200) {
        // setAnimals(prev => (pageNum === 1 ? result : [...prev, ...result]))
        setHasMore(result.length > 0)
      }
    } catch (error) {
      console.error('Error fetching animals:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAnimals()
  }, [])

  // Search Function
  useEffect(() => {
    if (searchQuery) {
      setFilteredAnimals(
        animals.filter(item => item.tag.name.includes(searchQuery))
      )
    } else {
      setFilteredAnimals(animals)
    }
  }, [searchQuery, animals])

  // Filter Function
  useEffect(() => {
    let filtered = animals

    if (filters.type) filtered = filtered.filter(a => a.type === filters.type)
    if (filters.gender)
      filtered = filtered.filter(a => a.gender === filters.gender)
    if (filters.breed)
      filtered = filtered.filter(a => a.breedType === filters.breed)
    if (filters.status)
      filtered = filtered.filter(a => a.healthStatus === filters.status)

    setFilteredAnimals(filtered)
  }, [filters])

  // Load More Items (Pagination)
  const loadMore = () => {
    if (!loading && hasMore) {
      setPage(prev => prev + 1)
    }
  }

  // Render Item
  const renderItem = useCallback(
    ({ item }: any) => (
      <TouchableOpacity
        onPress={() => navigation.navigate('AnimalDetail', { item })}
        style={styles.card}
      >
        <FastImage
          source={ICONS.COOL_COW}
          // source={item.picture ? { uri: item.picture } : ICONS.COOL_COW}
          style={styles.image}
        />
        <View style={styles.cardContent}>
          <Text style={styles.title}>{item.tag.name}</Text>
          <Text style={styles.subtitle}>
            {item.breedType} ({item.gender})
          </Text>
        </View>
        <StatusCard status="Active" />
      </TouchableOpacity>
    ),
    []
  )

  // Open BottomSheet for Filtering
  const snapPoints = useMemo(() => ['25%', '50%'], [])

  const openFilters = useCallback(
    () => bottomSheetRef.current?.snapToIndex(1),
    []
  )
  const navigateToAdd = () => {
    navigation?.navigate('AddAnimal')
  }

  const AddButton = () => {
    return (
      <TouchableOpacity
        activeOpacity={1}
        onPress={navigateToAdd}
        style={styles.rightButton}
      >
        <AppText
          extraBold
          fontSize="h7"
          color="primaryMain"
          style={{ marginRight: RF(2) }}
        >
          {t('common.add')}
        </AppText>
        <AnyIcon
          disabled
          type={Icons.FontAwesome}
          name="plus"
          color={COLORS.primaryMain}
          size={15}
        />
      </TouchableOpacity>
    )
  }
  return (
    <AppContainer>
      <AppHeader
        showHam
        title={t('main.animalInfo.headerTitle')}
        rightElement={<AddButton />}
      />
      <View style={styles.container}>
        {/* Search Input */}

        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <AppInput
            viewStyle={{ flex: 0.8 }}
            placeholder={t('main.animalInfo.searchPlaceholder')}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />

          {/* Filter Button */}
          <TouchableOpacity
            style={{
              alignItems: 'center',
              justifyContent: 'center',
              flex: 0.2
            }}
            onPress={openFilters}
          >
            <AnyIcon
              disabled
              type={Icons.FontAwesome}
              name={'filter'}
              size={30}
              viewStyle={{
                // backgroundColor: COLORS.white,
                padding: 10,
                alignItems: 'center',
                alignSelf: 'center',
                borderRadius: 10
              }}
              color={COLORS.primaryMain}
            />
          </TouchableOpacity>
        </View>

        {/* FlatList */}
        <FlatList
          data={filteredAnimals}
          renderItem={renderItem}
          keyExtractor={item => item.uuid}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            loading ? <ActivityIndicator size="small" color="#000" /> : null
          }
        />

        {/* BottomSheet Filter */}
        <BottomSheet
          index={1}
          ref={bottomSheetRef}
          snapPoints={snapPoints}
          enablePanDownToClose
        >
          <View style={styles.sheetContent}>
            <Text style={styles.sheetTitle}>
              {t('main.animalInfo.filterAnimals')}
            </Text>
            {['type', 'gender', 'breed', 'status'].map(filterKey => (
              <TextInput
                key={filterKey}
                style={styles.filterInput}
                placeholder={t(`main.animalInfo.filterBy.${filterKey}`)}
                value={filters[filterKey]}
                onChangeText={text =>
                  setFilters(prev => ({ ...prev, [filterKey]: text }))
                }
              />
            ))}
            <TouchableOpacity
              style={styles.applyButton}
              onPress={() => bottomSheetRef.current?.close()}
            >
              <Text style={styles.applyButtonText}>
                {t('main.animalInfo.applyFilters')}
              </Text>
            </TouchableOpacity>
          </View>
        </BottomSheet>
      </View>
    </AppContainer>
  )
}

export default AnimalInfo

// Styles
const styles = StyleSheet.create({
  container: { flex: 1, padding: 10 },

  filterButton: {
    alignItems: 'center',
    // justifyContent: 'center',
    borderWidth: 1,
    height: '100%',
    flex: 0.2
  },
  rightButton: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  filterButtonText: { color: '#fff', fontWeight: 'bold' },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 10,
    marginBottom: 10,
    borderRadius: 10,
    elevation: 3
  },
  image: { width: 50, height: 50, borderRadius: 10, marginRight: 10 },
  cardContent: { flex: 1 },
  title: { fontWeight: 'bold', fontSize: 16 },
  subtitle: { color: '#666', fontSize: 14 },
  status: { color: 'green', fontWeight: 'bold' },
  viewButton: { backgroundColor: '#007bff', padding: 5, borderRadius: 5 },
  viewButtonText: { color: '#fff', fontWeight: 'bold' },
  sheetContent: { flex: 1, padding: 20 },
  sheetTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  filterInput: {
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    paddingLeft: 10,
    marginBottom: 10
  },
  applyButton: {
    backgroundColor: '#28a745',
    padding: 10,
    alignItems: 'center',
    borderRadius: 5
  },
  applyButtonText: { color: '#fff', fontWeight: 'bold' }
})
