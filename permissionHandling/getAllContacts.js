import {Alert, BackHandler, PermissionsAndroid} from 'react-native';

export async function requestGetAllContactsPermission() {
  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.READ_CONTACTS,
      {
        title: 'Read Contacts Permission',
        message: 'App requires permission to display all contacts',
        buttonNegative: 'Cancel',
        buttonPositive: 'OK',
      },
    );
    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      console.log('You read contacts');
      return true;
    } else {
      console.log('Read contacts denied');
      Alert.alert(
        'Required read contact permission',
        'APP need read contact permission to send sms',
        [
          {
            text: 'Exit app',
            onPress: () => BackHandler.exitApp(),
          },
          {
            text: 'Request again',
            onPress: () => requestGetAllContactsPermission(),
          },
        ],
      );
    }
  } catch (err) {
    console.warn(err);
  }
}
