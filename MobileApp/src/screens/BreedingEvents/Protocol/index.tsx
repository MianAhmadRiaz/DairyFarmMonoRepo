import React, { useState } from 'react'
import { FlatList, Text, TouchableOpacity, View } from 'react-native'
import AnyIcon, { Icons } from 'shared/components/AnyIcon'
import AppText from 'shared/components/AppText/AppText'
import { GenericNavigation } from 'shared/utils/models/types'
import styles from './style'
import DatePicker from 'shared/components/Datepicker'
import AppInput from 'shared/components/AppInput'
import DropDown from 'shared/components/Dropdown'
import PrimaryButton from 'shared/components/PrimaryButton'
import { COLORS, THEME } from 'shared/theme'
import {
  GestureHandlerRootView,
  ScrollView
} from 'react-native-gesture-handler'
import TimePicker from 'shared/components/TimePicker'
import { protocolData } from 'shared/utils/constants/constants'
import AppHeader from 'shared/components/AppHeader'

interface Props extends GenericNavigation {}
const Protocol = (props: Props) => {
  const [selectedDate, setSelectedDate] = useState<string | undefined>(
    undefined
  )
  const [error, setError] = useState<string | undefined>(undefined)

  const handleDateChange = (date: string) => {
    setSelectedDate(date)
    setError(undefined)
  }

  return (
    <>
      <View style={styles.container}>
        <AppHeader showBack title="Protocols" />
        {/* <View style={styles.top}>
          <TouchableOpacity>
            <AnyIcon
              name="bars"
              type={Icons.FontAwesome}
              size={24}
              color="black"
            />
          </TouchableOpacity>

          <AppText fontSize="h6" bold color={'erieBlack'}>
            Protocol
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
        </View> */}
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="always"
        >
          <View>
            <DatePicker
              label="Protocol Date"
              labelStyle={styles.label}
              placeholder="Select"
              placeholderStyle={styles.placeholder}
              style={styles.customContainer}
              value={selectedDate}
              onChange={handleDateChange}
              error={error}
            />
            <AppInput
              label="Tag ID"
              textInputStyle={styles.placeholder}
              labelStyle={styles.label}
              placeholder="Tag ID"
              style={styles.customContainer}
              error={undefined}
            />
            <DropDown
              label="Protocols"
              labelStyle={styles.label}
              placeholder="Select"
              placeholderStyle={styles.placeholder}
              style={styles.customContainer}
              options={[]}
              value={''}
              onChange={function (value: string): void {
                throw new Error('Function not implemented.')
              }}
            />

            <TimePicker
              label="Start Time"
              labelStyle={styles.label}
              style={styles.customContainer}
              placeholder="Select"
              placeholderStyle={styles.placeholder}
              onChange={function (date: string): void {
                throw new Error('Function not implemented.')
              }}
            />

            <View
              style={{ flexDirection: 'row', justifyContent: 'space-between' }}
            >
              <PrimaryButton
                title="Add Protocol"
                buttonStyle={styles.button1}
                textStyle={styles.buttonText1}
              />
              <PrimaryButton
                title="Cancel"
                buttonStyle={styles.button2}
                textStyle={styles.buttonText2}
              />
            </View>
          </View>

          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <AppText
                fontSize="10"
                bold
                color={'darkestGrey'}
                style={styles.particularHeaderText}
              >
                PARTICULARS
              </AppText>
              <AppText
                fontSize="10"
                bold
                color={'darkestGrey'}
                style={styles.tableHeaderText}
              >
                HOURS
              </AppText>
              <AppText
                fontSize="10"
                bold
                color={'darkestGrey'}
                style={styles.tableHeaderText}
              >
                DATE
              </AppText>
              <AppText
                fontSize="10"
                bold
                color={'darkestGrey'}
                style={styles.tableHeaderText}
              >
                TIME
              </AppText>
            </View>

            <FlatList
              data={protocolData}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <View style={styles.tableRow}>
                  <AppText style={styles.particularTableCell}>
                    {item.particular}
                  </AppText>
                  <AppText style={styles.tableCell}>{item.hours}</AppText>
                  <AppText style={styles.tableCell}>{item.date}</AppText>
                  <AppText style={styles.tableCell}>{item.time}</AppText>
                </View>
              )}
            />
          </View>
        </ScrollView>
      </View>
    </>
  )
}

export default Protocol
