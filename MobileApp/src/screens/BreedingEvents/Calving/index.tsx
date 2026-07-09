import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
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
import Dropdown from 'shared/components/Dropdown';

interface Props extends GenericNavigation {}
const Calving = (props: Props) => {
    const { t } = useTranslation()
    const [childList, setChildList] = useState([{ id: 1 }]);

  const addChild = () => {
    setChildList([...childList, { id: childList.length + 1 }]);
  };

  const removeChild = (id: number) => {
    setChildList(childList.filter(child => child.id !== id));
  };

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
                  {t('breeding.calving.headerTitle')}
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
                style={styles.tableContainer}
                showsVerticalScrollIndicator={false}>
               <AppInput
                    label={t('breeding.common.tagId')}
                    textInputStyle={styles.placeholder}
                    labelStyle={styles.label}
                    placeholder={t('breeding.common.tagIdPlaceholder')}
                    style={styles.customContainer}
                    error={undefined}
                 />
                 <DropDown
                    label={t('breeding.common.aiType')}
                    labelStyle={styles.label}
                    placeholder={t('breeding.common.select')}
                    placeholderStyle={styles.placeholder}
                    style={styles.customContainer}
                    options={[]} value={''} onChange={function (value: string): void {
                        throw new Error('Function not implemented.');
                    } }                 
                    />
                 <DatePicker
                    label={t('breeding.common.date')}
                    labelStyle={styles.label}
                    placeholder={t('breeding.common.select')}
                    placeholderStyle={styles.placeholder}
                    style={styles.customContainer} onChange={function (date: string): void {
                        throw new Error('Function not implemented.');
                    } }
                    />
                 <DropDown
                    label={t('breeding.common.semen')}
                    labelStyle={styles.label}
                    placeholder={t('breeding.common.select')}
                    placeholderStyle={styles.placeholder}
                    style={styles.customContainer}
                    options={[]} value={''} onChange={function (value: string): void {
                        throw new Error('Function not implemented.');
                    } }                 
                    />
                
                <View style={styles.midContainer}>
                 <View style={styles.childHeader}>
                    <AppText fontSize="subtitle" 
                        semiBold
                        color={'labelColor'}
                        style={styles.text}>
                        {t('breeding.calving.child')}
                        </AppText>
                        <TouchableOpacity onPress={addChild}>
                        <AppText
                        fontSize="subtitle"
                        regular
                        style={styles.underline}
                        color={'secondaryMain'}>
                            {t('breeding.calving.addNewChild')}
                        </AppText>
                        </TouchableOpacity>
                </View>
                <Dropdown
                        placeholder={t('breeding.calving.addChild')}
                        placeholderStyle={styles.placeholder}
                        style={styles.customContainer}
                        options={[]} value={''} onChange={function (value: string): void {
                            throw new Error('Function not implemented.');
                        } } label={''}                    />

                {childList.map((child, index) => (
                    <View key={child.id} style={styles.childContainer}>
                    <View style={styles.childHeader}>
                        <AppText 
                        fontSize="subtitle" 
                        bold 
                        color={'darkestGrey'}>
                            {t('breeding.calving.aliveChild')}
                        </AppText>
                        <TouchableOpacity onPress={() => removeChild(child.id)}>
                        <AppText
                        fontSize="subtitle"
                        style={styles.underline}
                        color={'error'}>
                            {t('breeding.calving.delete')}
                        </AppText>
                        </TouchableOpacity>
                    </View>
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
                ))}
                </View>

                 <AppInput
                    label={t('breeding.common.reason')}
                    textInputStyle={styles.reasonText}
                    labelStyle={styles.label}
                    placeholder={t('breeding.common.reason')}
                    style={styles.reasonContainer}
                    error={undefined}
                 />

                 <View style={styles.buttonContainer}>
                <PrimaryButton
                    title={t('breeding.calving.cancel')}
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

export default Calving;