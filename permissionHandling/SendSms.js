import {PermissionsAndroid} from 'react-native';

export async function requestSendSMSPermission() {
  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.SEND_SMS,
      {
        title: 'Send SMS Permission',
        message:
          'SMS server need permission of sending sms ' +
          'so you can automate the sms sending',
        buttonNeutral: 'Ask Me Later',
        buttonNegative: 'Cancel',
        buttonPositive: 'OK',
      },
    );
    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      console.log('You can Send SMS');
    } else {
      console.log('Send SMS denied');
    }
  } catch (err) {
    console.warn(err);
  }
}
