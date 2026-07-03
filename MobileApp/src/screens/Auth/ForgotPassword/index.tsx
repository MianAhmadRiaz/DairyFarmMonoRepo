import React, {useState} from 'react';
import {Image, SafeAreaView, View} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import Toast from 'react-native-toast-message';
import NavRoutes from '../../../routes/NavRoutes';

import {COLORS, THEME} from 'shared/theme';
import styles from './styles';
import FastImage from 'react-native-fast-image';
import {RF} from 'shared/theme/responsive';
import {ICONS} from 'assets/icons';
import {GenericNavigation} from 'shared/utils/models/types';
import {forgotPassword} from 'shared/services/auth.services';
import {getNormalizedError} from 'shared/services/helper.services';
import AppText from 'shared/components/AppText/AppText';
import AppInput from 'shared/components/AppInput';
import PrimaryButton from 'shared/components/PrimaryButton';
interface Props extends GenericNavigation {}
const ForgotPassword = (props: Props) => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState(__DEV__ ? 'danyal.ahmer@yopmail.com' : '');

  const onPressSend = async () => {
    try {
      if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
        Toast.show({
          text1: 'Error',
          text2: 'Invalid Email',
          type: 'error',
        });
      }
      setLoading(true);
      await forgotPassword({email: email});
      Toast.show({
        text1: 'Success',
        text2: 'OTP Code Sent to Your Email',
        type: 'success',
      });
      props.navigation?.navigate(NavRoutes.OTP_SCREEN, {email});
      setLoading(false);
    } catch (e: any) {
      const error = getNormalizedError(e);
      Toast.show({
        text1: 'Error',
        text2: error ? error : 'Error Sending Code',
        type: 'error',
      });
      setLoading(false);
    }
  };
  return (
    <>
      <SafeAreaView style={styles.mainContainer}>
        <View style={styles.topContainer}>
          <Image
            source={ICONS.MAIN_LOGO}
            style={{width: RF(150), height: RF(150)}}
            resizeMode={FastImage.resizeMode.contain}
          />
          <AppText fontSize='h5' style={{ letterSpacing:0.5}} bold color={"primaryMain"}>Cattle's Care</AppText>
        </View>

        <KeyboardAwareScrollView
          keyboardShouldPersistTaps={'always'}
          style={styles.bottomContainer}>
          <AppText
          fontSize='h7'
semiBold
          style={styles.bottomHeader}>Forgot Password</AppText>
          <View style={styles.inputView}>
            <AppInput
              value={email}
              onChangeText={setEmail}
              
              label="Email"
              placeholder="Enter Email"
              icon="mail"
            />
          </View>
          <PrimaryButton
            title="Send"
            buttonStyle={styles.sendButton}
            textStyle={styles.buttonText}
            onPress={onPressSend}
            loading={loading}
            loaderColor={COLORS.white}
          />
          <PrimaryButton
            title="Back"
            buttonStyle={styles.backbuttonStyle}
            textStyle={[
              styles.buttonText,
              {color: COLORS.primaryDark},
            ]}
            onPress={() => props.navigation?.goBack()}
          />
        </KeyboardAwareScrollView>
      </SafeAreaView>
      <SafeAreaView
        style={{
          backgroundColor: COLORS.primaryLight,
        }}
      />
    </>
  );
};

export default ForgotPassword;
