import {PermissionsAndroid, Alert, BackHandler} from 'react-native';

export async function requestSendSMSPermission() {
  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.SEND_SMS,
      {
        title: 'Send SMS Permission',
        message: 'SMS server need sms permission to send sms',
        buttonNegative: 'Cancel',
        buttonPositive: 'OK',
      },
    );
    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      console.log('You can Send SMS');
      return true;
    } else {
      console.log('Send SMS denied');
      Alert.alert(
        'Required SMS permission',
        'APP need SMS permission to send sms',
        [
          {
            text: 'Exit app',
            onPress: () => BackHandler.exitApp(),
          },
          {
            text: 'Request again',
            onPress: () => requestSendSMSPermission(),
          },
        ],
      );
    }
  } catch (err) {
    console.warn(err);
  }
}
