import React, { useEffect, useState, useCallback } from 'react'
import {
  View,
  TouchableOpacity,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator
} from 'react-native'
import { COLORS, THEME } from 'shared/theme'
import { RF, WP } from 'shared/theme/responsive'
import AnyIcon, { Icons } from '../AnyIcon'
import AppText from '../AppText/AppText'
import Modal from 'react-native-modal'
import { getAnimals } from 'shared/services/breedingEvents.services'
import SearchInput from '../SearchInput'
import ListEmptyComponent from '../ListEmptyComponent'

export interface Tag {
  uuid: string
  name: string
}

export interface Animal {
  uuid: string
  tag: Tag | null
}

interface TagsDropDownProps {
  value: Tag | null
  onChange: (value: Tag, animalUuid: string) => void // Updated onChange to also return animalUuid
  error?: any
  style: StyleProp<ViewStyle>
}

const TagsDropDown: React.FC<TagsDropDownProps> = ({
  value,
  onChange,
  error,
  style
}) => {
  const [visible, setVisible] = useState(false)
  const [loading, setLoading] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [tagList, setTagList] = useState<Animal[]>([])

  const fetchAnimals = useCallback(async () => {
    try {
      setLoading(true)
      const response = await getAnimals()
      const animals = response?.data?.data?.animals

      // Set tags along with the animal uuid
      const animalsWithTags = animals?.map((i: any) => ({
        uuid: i.uuid,
        tag: i.tag
      }))
      setTagList(animalsWithTags || [])
    } catch (error) {
      console.log('Failed to fetch animals', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAnimals()
  }, [fetchAnimals])

  // Filter tags based on search text
  const filteredOptions = tagList.filter(item =>
    item?.tag?.name?.toLowerCase().includes(searchText.toLowerCase())
  )

  return (
    <>
      <TouchableOpacity activeOpacity={1} onPress={() => setVisible(true)}>
        <AppText style={[styles.label]}>Choose Tag Id</AppText>
        <View style={[styles.container, style]}>
          <Text
            style={[
              styles.text,
              { color: value ? COLORS.darkestGrey : COLORS.placeholder }
            ]}
          >
            {value?.name || 'Select Tag'}
          </Text>
          <AnyIcon
            disabled
            name="chevron-down"
            type={Icons.Feather}
            size={15}
            color={COLORS.descriptionColor}
          />
        </View>
      </TouchableOpacity>

      {error && <AppText style={styles.errorText}>{error}</AppText>}

      <Modal isVisible={visible} onBackdropPress={() => setVisible(false)}>
        <View style={styles.modal}>
          {loading ? (
            <ActivityIndicator size="large" color={COLORS.primaryMain} />
          ) : (
            <>
              <SearchInput value={searchText} onChangeText={setSearchText} />

              <FlatList
                data={filteredOptions}
                keyExtractor={(item: Animal) => item.uuid}
                ListEmptyComponent={<ListEmptyComponent />}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.option}
                    onPress={() => {
                      // Pass the tag and animal uuid to the onChange handler
                      onChange(item.tag, item.uuid)
                      setVisible(false)
                      setSearchText('')
                    }}
                  >
                    <Text style={styles.optionText}>{item?.tag?.name}</Text>
                  </TouchableOpacity>
                )}
              />
            </>
          )}
        </View>
      </Modal>
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '90%',
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: RF(50),
    borderColor: COLORS.primaryMain,
    borderWidth: 1,
    borderRadius: THEME.RADIUS.OVALBOX,
    marginVertical: THEME.MARGIN.LOW,
    paddingHorizontal: THEME.MARGIN.MID_LOW,
    backgroundColor: COLORS.white
  },
  label: {
    fontSize: THEME.FONTS.SIZE.subtitle,
    marginTop: RF(5),
    marginLeft: RF(20),
    color: COLORS.primaryMain,
    fontFamily: THEME.FONTS.TYPE.SEMIBOLD
  },
  text: {
    color: COLORS.darkestGrey,
    fontFamily: THEME.FONTS.TYPE.MEDIUM,
    fontSize: THEME.FONTS.SIZE.subtitle
  },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
  modal: {
    position: 'absolute',
    bottom: -20,
    width: WP(100),
    height: '50%',
    alignSelf: 'center',
    backgroundColor: COLORS.white,
    borderRadius: RF(10),
    padding: RF(10)
  },
  option: {
    padding: RF(12),
    borderBottomWidth: 1,
    borderColor: COLORS.cardGrey
  },
  optionText: { fontSize: RF(14), color: COLORS.darkestGrey },
  errorText: {
    color: COLORS.error,
    fontSize: RF(12),
    marginTop: RF(2)
  }
})

export default TagsDropDown
