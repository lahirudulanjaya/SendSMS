import React, {Component} from 'react';
import {Linking, View} from 'react-native';
import {Button, TextInput, Title} from 'react-native-paper';
import SmsAndroid from 'react-native-get-sms-android';
import BackgroundService from 'react-native-background-actions';
const veryIntensiveTask = async taskDataArguments => {
  // Example of an infinite loop task
  const {delay} = taskDataArguments;
  await new Promise(async resolve => {
    for (let i = 0; BackgroundService.isRunning(); i++) {
      console.log(i);
      await new Promise(r => setTimeout(r, 2000));
    }
  });
};
const options = {
  taskName: 'Example',
  taskTitle: 'ExampleTask title',
  taskDesc: 'ExampleTask description',
  taskIcon: {
    name: 'ic_launcher',
    type: 'mipmap',
  },
  color: '#ff00ff',
  linkingURI: 'yourSchemeHere://chat/jane', // See Deep Linking for more info
  parameters: {
    delay: 1000,
  },
};
class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      message: '',
      senders: '',
    };
  }
  componentDidMount() {
    Linking.addEventListener('url', this.sendMessage);
  }
  onChangeSenders = senders => {
    this.setState({senders: senders});
  };
  onChangeMessage = message => {
    this.setState({message: message});
  };

  sendMessage = async uri => {
    const route = uri.url.replace(/.*?:\/\//g, '');
    await this.setState({message: route.split('/')[0]});
    await this.setState({senders: route.split('/')[1]});
    await this.sendSMS(route.split('/')[0], route.split('/')[1]);
  };

  sendSMS = async (message,senders) => {
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

  backGroundRun = async () => {
    await BackgroundService.start(veryIntensiveTask, options).then(
      r => console.log(r),
      err => {
        console.log(err);
      },
    );
  };
  stop = () => {
    BackgroundService.stop();
  };
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
          onChangeText={() => this.onChangeSenders}
        />

        <TextInput
          multiline
          numberOfLines={6}
          label="Message"
          value={this.state.message}
          onChangeText={() => this.onChangeMessage}
        />
        <Button mode="contained" onPress={() => this.sendSMS(this.state.message,this.state.senders)}>
          Send
        </Button>
        <Button mode="contained" onPress={() => this.backGroundRun()}>
          Run In BackGround
        </Button>
        <Button mode="contained" onPress={() => this.stop()}>
          Stop
        </Button>
      </View>
    );
  }
}

export default App;
