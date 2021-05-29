import React, {Component} from 'react';
import {
  Dimensions,
  Linking,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  Avatar,
  Button,
  Chip,
  List,
  Searchbar,
  TextInput,
  Title,
} from 'react-native-paper';
import SmsAndroid from 'react-native-get-sms-android';
import {requestSendSMSPermission} from './permissionHandling/SendSms';
import {Appbar} from 'react-native-paper';
import Contacts from 'react-native-contacts';
import {requestGetAllContatcsPermission} from './permissionHandling/getAllContacts';

const UNIQUE_KEY = '7098d2b2be5711eb85290242ac130003';
const APP_LINK = 'smsserver://';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      message: '',
      senders: '',
      contacts: [],
      searchQuery: '',
      sendersArr: [],
    };
  }

  getContactsByString = stringQuery => {
    Contacts.getContactsMatchingString(stringQuery).then(contacts => {
      console.log(contacts[30]);
      this.setState({
        contacts: contacts,
      });
    });
  };

  handleOnChangeSearchQuery = query => {
    this.getContactsByString(query);
    this.setState({
      searchQuery: query,
    });
  };

  async componentDidMount() {
    const canSendSMS = await requestSendSMSPermission();
    const canGetAllContacts = await requestGetAllContatcsPermission();

    if (canGetAllContacts) {
      this.getContactsByString(this.state.searchQuery);
    }

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
    if (senders.length < 1 || message === '') {
      return;
    }
    this.state.sendersArray.forEach(sender => {
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

  handleOnPressContact = newContact => {
    if (newContact === '') {
      return;
    }
    let arr = this.state.sendersArr;
    arr.push(newContact);
    arr = [...new Set(arr)];
    this.setState({
      sendersArray: arr,
    });
  };

  handleRemoveContact = removeContact => {
    let arr = this.state.sendersArr;
    const indexOfRemovingItem = arr.indexOf(removeContact);
    if (indexOfRemovingItem !== -1) {
      arr.splice(indexOfRemovingItem, 1);
    }
    this.setState({
      sendersArr: arr,
    });
  };

  render() {
    return (
      <>
        <Appbar.Header>
          <Appbar.Content title="To" />
          <Searchbar
            style={{
              width: (2 * Dimensions.get('window').width) / 3.2,
              borderTopRightRadius: 0,
            }}
            placeholder="Search"
            onChangeText={this.handleOnChangeSearchQuery}
            value={this.state.searchQuery}
          />

          <Appbar.Action
            icon="plus"
            onPress={() => this.handleOnPressContact(this.state.searchQuery)}
          />
        </Appbar.Header>
        <View
          style={{
            flex: 1,
          }}>
          <View style={{alignItems: 'center', padding: 2}}>
            <ScrollView horizontal={true}>
              {this.state.sendersArr.map((senderInArr, key) => (
                <Chip
                  style={{margin: 2}}
                  onClose={() => this.handleRemoveContact(senderInArr)}
                  onPress={() => console.log('Pressed')}>
                  {senderInArr}
                </Chip>
              ))}
            </ScrollView>
          </View>
          {/* <TextInput
            label="Senders"
            value={this.state.senders}
            onChangeText={this.onChangeSenders}
          /> */}
          <ScrollView style={{height: '100%'}}>
            {this.state.contacts.map((contact, key) => (
              <List.Item
                onPress={() => this.handleOnPressContact(contact.displayName)}
                key={key}
                title={contact.displayName}
                description={contact.phoneNumbers[0].number}
                left={props => (
                  <List.Icon {...props} icon="card-account-phone" />
                )}
              />
            ))}
          </ScrollView>
          <View style={{flexGrow: 1}}></View>

          <View style={{flexDirection: 'row'}}>
            <TextInput
              style={{
                width: (5 * Dimensions.get('window').width) / 6,
                borderTopLeftRadius: 0,
              }}
              multiline
              label="Type your message"
              value={this.state.message}
              onChangeText={this.onChangeMessage}
            />
            <TouchableOpacity
              style={{
                width: Dimensions.get('window').width / 6,
                justifyContent: 'center',
                alignItems: 'center',
              }}
              onPress={() =>
                this.sendSMS(this.state.message, this.state.sendersArr)
              }>
              <Avatar.Icon size={50} icon="send" />
            </TouchableOpacity>
          </View>
        </View>
      </>
    );
  }
}

export default App;
