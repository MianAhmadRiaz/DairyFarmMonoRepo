import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { TouchableOpacity, View } from 'react-native'
import AnyIcon, { Icons } from 'shared/components/AnyIcon'
import AppText from 'shared/components/AppText/AppText'
import { GenericNavigation } from 'shared/utils/models/types'
import styles from './style'
import PrimaryButton from 'shared/components/PrimaryButton'
import {
  GestureHandlerRootView,
  ScrollView
} from 'react-native-gesture-handler'

interface Props extends GenericNavigation {}
const TagIdHeatDetection = (props: Props) => {
  const { t } = useTranslation()
  return (
    <>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <View style={styles.container}>
          <View style={styles.top}>
            <TouchableOpacity>
              <AnyIcon
                name="bars"
                type={Icons.FontAwesome}
                size={24}
                color="black"
              />
            </TouchableOpacity>

            <AppText fontSize="h6" bold color={'erieBlack'}>
              Tag ID 2028
            </AppText>

            <TouchableOpacity style={styles.languageButton}>
              <AppText fontSize="subtitle" regular color={'darkestGrey'}>
                En
              </AppText>

              <AnyIcon
                name="chevron-down"
                type={Icons.FontAwesome}
                size={10}
                color="#6C737F"
              />
            </TouchableOpacity>
          </View>

          <View style={styles.card}>
            <View style={styles.textStyle}>
              <AppText fontSize="h7" semiBold color={'labelColor'}>
                {t('breeding.tagIdHeatDetection.aiDate')}
              </AppText>

              <AppText fontSize="h6" regular color={'grey'}>
                12-Dec-2024
              </AppText>
            </View>
            <View style={styles.textStyle}>
              <AppText fontSize="h7" semiBold color={'labelColor'}>
                {t('breeding.tagIdHeatDetection.sireName')}
              </AppText>

              <AppText fontSize="h6" regular color={'grey'}>
                1 Pythagoras (Conv (0200HO11895, Semex)
              </AppText>
            </View>

            <View style={styles.textStyle}>
              <AppText fontSize="h7" semiBold color={'labelColor'}>
                {t('breeding.tagIdHeatDetection.straw')}
              </AppText>

              <AppText fontSize="h6" regular color={'grey'}>
                1
              </AppText>
            </View>

            <View style={styles.textStyle}>
              <AppText fontSize="h7" semiBold color={'labelColor'}>
                {t('breeding.tagIdHeatDetection.price')}
              </AppText>

              <AppText fontSize="h6" regular color={'grey'}>
                12.5
              </AppText>
            </View>

            <View style={styles.textStyle}>
              <AppText fontSize="h7" semiBold color={'labelColor'}>
                {t('breeding.tagIdHeatDetection.comments')}
              </AppText>

              <AppText fontSize="h6" regular color={'grey'}>
                14.5mm left overy
              </AppText>
            </View>
          </View>

          <View style={styles.buttonContainer}>
            <PrimaryButton
              title={t('breeding.tagIdHeatDetection.delete')}
              buttonStyle={styles.button2}
              textStyle={styles.buttonText2}
            />
            <PrimaryButton
              title={t('breeding.tagIdHeatDetection.edit')}
              buttonStyle={styles.button1}
              textStyle={styles.buttonText1}
            />
          </View>
        </View>
      </GestureHandlerRootView>
    </>
  )
}

export default TagIdHeatDetection
