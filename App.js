import type {Node} from 'react';
import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  useColorScheme,
  View,
} from 'react-native';
import {Button, TextInput, Title} from 'react-native-paper';
import SmsAndroid from 'react-native-get-sms-android';

import {Colors} from 'react-native/Libraries/NewAppScreen';

const App: () => Node = () => {
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };
  const [senders, setSenders] = React.useState('');
  const [message, setMessage] = React.useState('');
  const onChangeSenders = text => setSenders(text);
  const onChangeMessage = text => setMessage(text);
  const sendSMS = () => {
    const sender = senders.split(',');
    sender.forEach(i => {
      SmsAndroid.autoSend(
        i,
        message,
        fail => {
          console.log('Failed with this error: ' + fail);
        },
        success => {
          console.log('SMS sent successfully');
        },
      );
    });
  };
  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={backgroundStyle}>
        <View>
          <Title>Send SMS</Title>

          <TextInput
            label="Senders"
            value={senders}
            onChangeText={onChangeSenders}
          />

          <TextInput
            label="Message"
            value={message}
            onChangeText={onChangeMessage}
          />
          <Button
            icon="camera"
            mode="contained"
            onPress={() => sendSMS()}>
            Send
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default App;
