import notifee, {EventType} from '@notifee/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import messaging from '@react-native-firebase/messaging';
import {useEffect} from 'react';
import {PermissionsAndroid, Platform, Alert} from 'react-native';
import {store} from 'shared/store/configureStore';
import {setFcmToken} from 'shared/store/reducers/authReducer';

export const requestFCMUserPermission = async () => {
  try {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      await messaging().registerDeviceForRemoteMessages();
      const token = await messaging().getToken();
      console.log('FCM Token:', token);
      store.dispatch(setFcmToken(token));
      await AsyncStorage.setItem('fcmToken', token);
      return token;
    } else {
      console.log('FCM permission not granted.');
      Alert.alert(
        'Permission Required',
        'Notifications are disabled. Please enable them in your settings for a better experience.',
      );
      return null;
    }
  } catch (error) {
    console.error('Error requesting FCM permission:', error);
    Alert.alert(
      'Error',
      'An error occurred while requesting notification permission.',
    );
    return null;
  }
};

export const getFCMToken = async () => {
  try {
    return await messaging().getToken();
  } catch (error) {
    console.error('Error fetching FCM token:', error);
    return null;
  }
};

export const NotificationHandler = () => {
  useEffect(() => {
    const setupNotifications = async () => {
      try {
        if (Platform.OS === 'android' && Platform.Version >= 33) {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
          );
          if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
            console.log('Notification permission denied');
            Alert.alert(
              'Permission Denied',
              'Post Notification permission is required to display notifications.',
            );
          }
        }

        messaging().onMessage(async remoteMessage => {
          console.log('Foreground message received:', remoteMessage);
          LocalNotification(remoteMessage);
        });

        messaging().setBackgroundMessageHandler(async remoteMessage => {
          console.log('Background message received:', remoteMessage);
          if (remoteMessage.data) {
            console.log('Data:', remoteMessage.data);
          }
        });

        notifee.onBackgroundEvent(async ({type}) => {
          if (type === EventType.PRESS) {
            console.log('Notification pressed in background');
          }
        });

        notifee.onForegroundEvent(async ({type}) => {
          if (type === EventType.PRESS) {
            console.log('Notification pressed in foreground');
          }
        });

        const initialNotification = await messaging().getInitialNotification();
        if (initialNotification) {
          console.log('App opened from a quit state:', initialNotification);
        }
      } catch (error) {
        console.error('Error setting up notification handlers:', error);
      }
    };

    setupNotifications();
  }, []);

  return null;
};

export const LocalNotification = async (data: any) => {
  console.log('data', data);

  try {
    await notifee.requestPermission();

    const channelId = await notifee.createChannel({
      id: 'default',
      name: 'Default Channel',
      sound: 'hollow', // Replace with a valid sound file in android/app/src/main/res/raw
    });

    await notifee.displayNotification({
      title: data?.notification?.title || 'Notification',
      body: data?.notification?.body || 'You have a new message.',
      data: data?.data || {},
      android: {
        channelId,
        smallIcon: 'ic_launcher', // Ensure this icon is available in your project
        pressAction: {
          id: 'default',
        },
      },
    });
  } catch (error) {
    console.error('Error displaying notification:', error);
  }
};
