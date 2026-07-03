import React, { useState } from 'react'
import { TouchableOpacity, View } from 'react-native'
import AnyIcon, { Icons } from 'shared/components/AnyIcon';
import AppText from 'shared/components/AppText/AppText';
import { GenericNavigation } from 'shared/utils/models/types';
import styles from './style';
import PrimaryButton from 'shared/components/PrimaryButton';
import { GestureHandlerRootView, ScrollView } from 'react-native-gesture-handler';
import AppInput from 'shared/components/AppInput';
import DropDown from 'shared/components/Dropdown';
import DatePicker from 'shared/components/Datepicker';
import TimePicker from 'shared/components/TimePicker';
import AppHeader from 'shared/components/AppHeader';

interface Props extends GenericNavigation {}
const Abortion = (props: Props) => {
    return(
        <>
  <GestureHandlerRootView style={{ flex: 1 }}>        
     <View style={styles.container}>
             <AppHeader title="Abortion" showBack/>
            <ScrollView 
                contentContainerStyle={{ flexGrow: 1 }} 
                keyboardShouldPersistTaps="always" 
                style={styles.boxContainer}
                showsVerticalScrollIndicator={false}>
               <AppInput
                    label="Tag ID"
                    textInputStyle={styles.placeholder}
                    labelStyle={styles.label}
                    placeholder='Tag ID' 
                    style={styles.customContainer}
                    error={undefined}                 
                 />
                 <DropDown
                    label="AI Type"
                    labelStyle={styles.label}
                    placeholder='Select' 
                    placeholderStyle={styles.placeholder}
                    style={styles.customContainer}
                    options={[]} value={''} onChange={function (value: string): void {
                        throw new Error('Function not implemented.');
                    } }                 
                    />
                 <DatePicker
                    label= "Date"
                    labelStyle={styles.label}
                    placeholder="Select"
                    placeholderStyle={styles.placeholder}
                    style={styles.customContainer} onChange={function (date: string): void {
                        throw new Error('Function not implemented.');
                    } }                 
                    />
                 <DropDown
                    label="Semen"
                    labelStyle={styles.label}
                    placeholder='Select' 
                    placeholderStyle={styles.placeholder}
                    style={styles.customContainer}
                    options={[]} value={''} onChange={function (value: string): void {
                        throw new Error('Function not implemented.');
                    } }                 
                    />
                <AppInput
                    label="Dose"
                    textInputStyle={styles.placeholder}
                    labelStyle={styles.label}
                    placeholder='Select' 
                    style={styles.customContainer}
                    error={undefined}                 
                 />
                 <AppInput
                    label="Cost"
                    textInputStyle={styles.placeholder}
                    labelStyle={styles.label}
                    placeholder='Select' 
                    style={styles.customContainer}
                    error={undefined}                 
                 />
                <TimePicker
                    label="Time"
                    labelStyle={styles.label}
                    style={styles.customContainer}
                    placeholder="Select" 
                    placeholderStyle={styles.placeholder}
                    onChange={function (date: string): void {
                        throw new Error('Function not implemented.');
                    } }     
                />
                 <AppInput
                    label="Weight"
                    textInputStyle={styles.placeholder}
                    labelStyle={styles.label}
                    placeholder='Select' 
                    style={styles.customContainer}
                    error={undefined}                 
                 />
                
                 <View style={styles.buttonContainer}>
                <PrimaryButton
                    title="Cancel"
                    buttonStyle={styles.button2}
                    textStyle={styles.buttonText2}
                />
                <PrimaryButton
                    title="Add New"
                    buttonStyle={styles.button1}
                    textStyle={styles.buttonText1}
                />
                </View>
            </ScrollView>
      </View>
   </GestureHandlerRootView>
        </>
    )
};

export default Abortion;