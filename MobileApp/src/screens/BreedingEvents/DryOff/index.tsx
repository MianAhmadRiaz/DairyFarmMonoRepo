import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { TouchableOpacity, View } from 'react-native'
import AnyIcon, { Icons } from 'shared/components/AnyIcon';
import AppText from 'shared/components/AppText/AppText';
import { GenericNavigation } from 'shared/utils/models/types';
import styles from './style';
import PrimaryButton from 'shared/components/PrimaryButton';
import { GestureHandlerRootView, ScrollView } from 'react-native-gesture-handler';
import DropDown from 'shared/components/Dropdown';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import AppInput from 'shared/components/AppInput';

interface Props extends GenericNavigation {}
const DryOff = (props: Props) => {
    const { t } = useTranslation()
    return(
        <>
  <GestureHandlerRootView style={{ flex: 1 }}>        
     <View style={styles.container}>
            <View style={styles.top}>
              <TouchableOpacity>
                <AnyIcon
                    name="arrow-left" 
                    type={Icons.FontAwesome}
                    size={16} 
                    color="black" 
               />
               </TouchableOpacity>

             <AppText
                  fontSize="h6"
                  bold
                  color={'erieBlack'}
                >
                  {t('breeding.dryOff.headerTitle')}
             </AppText>

             <TouchableOpacity style={styles.languageButton}>
                <AppText
                    fontSize="subtitle"
                    regular
                    color={'darkestGrey'}>
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
            <ScrollView 
                contentContainerStyle={{ flexGrow: 1 }} 
                keyboardShouldPersistTaps="always" 
                style={styles.boxContainer}
                showsVerticalScrollIndicator={false}>

                 <DropDown
                    label={t('breeding.dryOff.company')}
                    labelStyle={styles.label}
                    placeholder={t('breeding.common.select')}
                    placeholderStyle={styles.placeholder}
                    style={styles.customContainer}
                    options={[]} value={''} onChange={function (value: string): void {
                        throw new Error('Function not implemented.');
                    } }                 
                    />

                 <View style={styles.midContainer}>
                      <AppText
                        fontSize="subtitle"
                        extraBold
                        color={Colors.darkestGrey}
                        style={styles.text}
                        >
                        {t('breeding.dryOff.add')}
                      </AppText>
                       <AppInput
                        label={t('breeding.common.shed')}
                        textInputStyle={styles.placeholder}
                        labelStyle={styles.label}
                        placeholder={t('breeding.common.select')}
                        style={styles.customContainer}
                        error={undefined}
                     />
                    <AppInput
                        label={t('breeding.common.tagId')}
                        textInputStyle={styles.placeholder}
                        labelStyle={styles.label}
                        placeholder={t('breeding.common.select')}
                        style={styles.customContainer}
                        error={undefined}
                    />
                    <AppInput
                        label={t('breeding.common.breedType')}
                        textInputStyle={styles.placeholder}
                        labelStyle={styles.label}
                        placeholder={t('breeding.common.select')}
                        style={styles.customContainer}
                        error={undefined}
                    />
                    <AppInput
                        label={t('breeding.common.sex')}
                        textInputStyle={styles.placeholder}
                        labelStyle={styles.label}
                        placeholder={t('breeding.common.select')}
                        style={styles.customContainer}
                        error={undefined}
                    />
                 </View>
                
                 <View style={styles.buttonContainer}>
                <PrimaryButton
                    title={t('breeding.dryOff.cancel')}
                    buttonStyle={styles.button2}
                    textStyle={styles.buttonText2}
                />
                <PrimaryButton
                    title={t('breeding.common.addNew')}
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

export default DryOff;