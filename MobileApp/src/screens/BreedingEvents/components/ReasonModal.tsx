import React from 'react'
import { useTranslation } from 'react-i18next'
import { Modal, StyleSheet, View } from 'react-native'
import AppText from 'shared/components/AppText/AppText'

import AppInput from 'shared/components/AppInput'
import PrimaryButton from 'shared/components/PrimaryButton'
import { COLORS, THEME } from 'shared/theme'
import { RF } from 'shared/theme/responsive'

interface Props {
  isVisible: boolean
  reason: string
  setReason: (val: string) => void
  setModalVisible: (val: boolean) => void
  onAdd: () => void
}

export const ReasonModal = ({
  isVisible,
  reason,
  setReason,
  setModalVisible,
  onAdd
}: Props) => {
  const { t } = useTranslation()
  return (
    <Modal visible={isVisible} transparent animationType="slide">
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={{ alignItems: 'center' }}>
            <AppText fontSize="h6" bold color={'darkestGrey'}>
              {t('breeding.reasonModal.title')}
            </AppText>
          </View>

          <AppInput
            label={t('breeding.reasonModal.reasonLabel')}
            labelStyle={styles.label}
            textInputStyle={styles.placeholder}
            placeholder={t('breeding.reasonModal.reasonPlaceholder')}
            style={styles.customContainerModal}
            error={undefined}
            value={reason}
            onChangeText={setReason}
          />

          <View style={styles.buttonContainer}>
            <PrimaryButton
              title={t('breeding.reasonModal.cancel')}
              buttonStyle={styles.button2}
              textStyle={styles.buttonText2}
              onPress={() => setModalVisible(false)}
            />
            <PrimaryButton
              title={t('breeding.reasonModal.add')}
              buttonStyle={styles.button1}
              textStyle={styles.buttonText1}
              onPress={onAdd}
            />
          </View>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  label: {
    color: COLORS.labelColor,
    fontSize: THEME.FONTS.SIZE.caption
  },
  placeholder: {
    color: COLORS.descriptionColor,
    fontSize: THEME.FONTS.SIZE[11],
    textAlignVertical: 'top'
  },
  buttonContainer: {
    flexDirection: 'row',
    marginTop: THEME.MARGIN.NORMAL
  },
  customContainerModal: {
    borderColor: COLORS.lightSilver,
    borderRadius: THEME.RADIUS.SMALLBOX,
    height: RF(78),
    marginVertical: THEME.MARGIN.VERYLOW
  },
  button1: {
    backgroundColor: COLORS.primaryMain,
    borderRadius: THEME.RADIUS.BOX,
    flex: 1,
    height: RF(42),
    marginRight: THEME.MARGIN.NORMAL,
    alignItems: 'center',
    marginHorizontal: THEME.MARGIN.VERYLOW
  },
  button2: {
    backgroundColor: COLORS.mediumGrey,
    borderRadius: THEME.RADIUS.BOX,
    flex: 1,
    height: RF(42),
    marginLeft: THEME.MARGIN.NORMAL,
    alignItems: 'center',
    marginHorizontal: THEME.MARGIN.VERYLOW
  },
  buttonText1: {
    color: 'white',
    fontSize: 14
  },
  buttonText2: {
    color: COLORS.darkGrey,
    fontSize: 14
  },

  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)'
  },
  modalContent: {
    width: '90%',
    backgroundColor: 'white',
    padding: THEME.PADDING.LOW,
    borderRadius: THEME.RADIUS.BOX,
    elevation: 2
  }
})
