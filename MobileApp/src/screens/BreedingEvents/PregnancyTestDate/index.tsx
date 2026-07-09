import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FlatList, Text, TextInput, TouchableOpacity, View } from 'react-native'
import AnyIcon, { Icons } from 'shared/components/AnyIcon';
import AppText from 'shared/components/AppText/AppText';
import { GenericNavigation } from 'shared/utils/models/types';
import styles from './style';
import PrimaryButton from 'shared/components/PrimaryButton';
import { GestureHandlerRootView, ScrollView } from 'react-native-gesture-handler';
import { COLORS } from 'shared/theme';

interface Props extends GenericNavigation {}
const PregnancyTestDate = (props: Props) => {
  const { t } = useTranslation()

  const tableData = new Array(10).fill({
    sr: '01',
    date: '2025-01-10',
    tagId: '2028',
    price: '12.5',
  });

    return(
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

             <AppText
                  fontSize="h6"
                  bold
                  color={'erieBlack'}
                >
                  {t('breeding.pregnancyTestDate.headerTitle')}
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

      <View style={styles.recentEntriesContainer}>
         <AppText
            fontSize="h6"
            bold
            color={'darkestGrey'}>
                {t('breeding.common.recentEntries')}
        </AppText>
        <View style={{ flexShrink: 1 }}>
          <PrimaryButton
            title={t('breeding.common.addNew')}
            buttonStyle={styles.button}
            textStyle={styles.buttonText}
            />
        </View>
        
      </View>

       <View style={styles.searchContainer}>
          <AnyIcon 
            name="search" 
            type={Icons.Feather} 
            size={18} 
            color={COLORS.placeholder} 
            style={styles.searchIcon} 
          />
          <TextInput
            style={styles.searchInput}
            placeholder={t('breeding.common.search')}
            placeholderTextColor={COLORS.darkestGrey}
          />
        </View>

      <View style={styles.tableHeader}>
        <Text style={styles.headerText}>{t('breeding.common.cols.srNo')}</Text>
        <Text style={styles.headerText}>{t('breeding.pregnancyTestDate.cols.pregnancyTestDate')}</Text>
        <Text style={styles.headerText}>{t('breeding.common.cols.tagId')}</Text>
        <Text style={styles.headerText}>{t('breeding.pregnancyTestDate.cols.status')}</Text>
      </View>

<ScrollView contentContainerStyle={{ flexGrow: 1 }} style={styles.tableContainer} showsVerticalScrollIndicator={false}>
      <FlatList
        data={tableData}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item, index }) => (
          <View style={styles.row}>
            <Text style={styles.rowText}>{item.sr}</Text>
            <Text style={styles.rowText}>{item.date}</Text>
            <Text style={styles.rowText}>{item.tagId}</Text>
            <Text style={styles.rowText}>{item.price}</Text>
          </View>
        )}
      />


      <TouchableOpacity style={styles.loadMore}>
          <AppText
            fontSize="subtitle"
            bold
            color={'darkestGrey'}>
                {t('breeding.common.loadMore')}
        </AppText>
      </TouchableOpacity>
    </ScrollView>
    
      </View>
   </GestureHandlerRootView>
        </>
    )
};

export default PregnancyTestDate;