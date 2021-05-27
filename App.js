import React, {Component} from 'react';
import {Linking, View} from 'react-native';
import {Button, TextInput, Title} from 'react-native-paper';
import SmsAndroid from 'react-native-get-sms-android';
import {requestSendSMSPermission} from './permissionHandling/SendSms';

const UNIQUE_KEY = '7098d2b2be5711eb85290242ac130003';
const APP_LINK = 'smsserver://';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      message: '',
      senders: '',
    };
  }
  async componentDidMount() {
    await requestSendSMSPermission();
    Linking.getInitialURL()
      .then(url => {
        if (url) {
          this.sendMessage(url);
        }
      })
      .catch(err => {
        console.error('An error occurred', err);
      });
    Linking.addEventListener('url', e => this.sendMessage(e.url));
  }
  onChangeSenders = senders => {
    this.setState({senders: senders});
  };
  onChangeMessage = message => {
    this.setState({message: message});
  };

  sendMessage = async uri => {
    await this.sendSMS(this.filterMessage(uri), this.filterSenders(uri));
    await Linking.openURL(APP_LINK);
  };

  sendSMS = async (message, senders) => {
    const senderArray = senders.split(',');
    senderArray.forEach(sender => {
      SmsAndroid.autoSend(
        sender,
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

  filterMessage(url) {
    const filterWord = 'message' + UNIQUE_KEY;
    return url.match(filterWord + '(.*)' + filterWord)[1];
  }

  filterSenders(url) {
    const filterWord = 'senders' + UNIQUE_KEY;
    return url.match(filterWord + '(.*)' + filterWord)[1];
  }
  render() {
    return (
      <View
        style={{
          backgroundColor: '#212121',
          flex: 1,
          justifyContent: 'center',
        }}>
        <Title style={{color: 'white'}}>Send SMS</Title>

        <TextInput
          label="Senders"
          value={this.state.senders}
          onChangeText={this.onChangeSenders}
        />

        <TextInput
          multiline
          numberOfLines={6}
          label="Message"
          value={this.state.message}
          onChangeText={this.onChangeMessage}
        />
        <Button
          mode="contained"
          onPress={() => this.sendSMS(this.state.message, this.state.senders)}>
          Send
        </Button>
      </View>
    );
  }
}

export default App;
