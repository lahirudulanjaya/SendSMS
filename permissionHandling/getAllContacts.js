import {PermissionsAndroid} from 'react-native';

export async function requestGetAllContatcsPermission() {
  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.READ_CONTACTS,
      {
        title: 'Read Contacts Permission',
        message: 'App requires permission to dislay all contacts',
        buttonNeutral: 'Ask Me Later',
        buttonNegative: 'Cancel',
        buttonPositive: 'OK',
      },
    );
    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      console.log('You can Send SMS');
      return true;
    } else {
      console.log('Send SMS denied');
      return false;
    }
  } catch (err) {
    console.warn(err);
    return false;
  }
}
