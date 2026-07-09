import { useNavigation } from '@react-navigation/native'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Image, StyleSheet, View } from 'react-native'
import NavRoutes from 'routes/NavRoutes'
import AppText from 'shared/components/AppText/AppText'
import PrimaryButton from 'shared/components/PrimaryButton'
import { COLORS } from 'shared/theme'
import { breedingEvents } from 'shared/utils/constants/constants'

export type BreedingEventType = (typeof breedingEvents)[number]

export const BreedingEventItem = ({ item }: { item: BreedingEventType }) => {
  const navigation = useNavigation()
  const { t } = useTranslation()
  return (
    <View style={styles.card}>
      <Image source={item.image} style={styles.image} />
      <AppText fontSize="subtitle" isInter bold color={'primaryDark'}>
        {t(`breeding.mainScreen.events.${item.id}.title`, item.title)}
      </AppText>

      <AppText
        fontSize="11"
        isInter
        regular
        color={'grey'}
        style={styles.description}
      >
        {t(
          `breeding.mainScreen.events.${item.id}.description`,
          item.description
        )}
      </AppText>

      <PrimaryButton
        title={t('breeding.mainScreen.viewDetails')}
        small
        buttonStyle={styles.button}
        textStyle={styles.buttonText}
        onPress={() => navigation.navigate(item.screen)}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  languageButton: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  card: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 8.17,
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 7.5
  },
  image: {
    width: '100%',
    height: 100,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8
  },
  description: {
    textAlign: 'center',
    marginBottom: 5
  },
  button: {
    backgroundColor: COLORS.primaryMain,
    paddingVertical: 5,
    paddingHorizontal: 15,
    borderRadius: 6,
    width: '80%',
    height: 25,
    alignSelf: 'center'
  },
  buttonText: {
    color: 'white',
    fontSize: 11
  }
})
