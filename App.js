import React, {Component} from 'react';
import {
  Dimensions,
  Linking,
  ScrollView,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  Appbar,
  Avatar,
  Chip,
  DefaultTheme,
  List,
  Provider as PaperProvider,
  Searchbar,
  TextInput,
} from 'react-native-paper';
import SmsAndroid from 'react-native-get-sms-android';
import {requestSendSMSPermission} from './permissionHandling/sendSms';
import Contacts from 'react-native-contacts';
import {requestGetAllContactsPermission} from './permissionHandling/readContact';

const UNIQUE_KEY = '7098d2b2be5711eb85290242ac130003';
const APP_LINK = 'meghaduta://';

const theme = {
  ...DefaultTheme,
  roundness: 2,
  colors: {
    ...DefaultTheme.colors,
    primary: '#171717',
    accent: '#171717',
  },
};

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      message: '',
      senders: '',
      contacts: [],
      searchQuery: '',
      sendersArr: [],
      sendersArrNames: [],
      loading: true,
    };
  }

  getContactsByString = stringQuery => {
    Contacts.getContactsMatchingString(stringQuery)
      .then(contacts => {
        let tempContacts = contacts.filter(value => {
          if (value.phoneNumbers[0]) {
            return value;
          }
        });
        this.setState({
          contacts: tempContacts,
          loading: false,
        });
      })
      .catch(err => {
        console.log(err);
      });
  };

  handleOnChangeSearchQuery = query => {
    this.getContactsByString(query);
    this.setState({
      searchQuery: query,
    });
  };

  linkApp() {
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

  async componentDidMount() {
    await requestSendSMSPermission();
    await requestGetAllContactsPermission();
    this.getContactsByString(this.state.searchQuery);
    this.linkApp();
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
    senders.forEach(sender => {
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

  filterMessage = url => {
    const filterWord = 'message' + UNIQUE_KEY;
    const extractedMessage = url.match(
      filterWord + '((.|\n)*)' + filterWord,
    )[1];
    this.setState({
      message: extractedMessage,
    });
    return extractedMessage;
  };

  filterSenders(url) {
    const filterWord = 'senders' + UNIQUE_KEY;
    const extractedSenders = url.match(
      filterWord + '((.|\n)*)' + filterWord,
    )[1];
    return extractedSenders.split(',');
  }

  handleOnPressContact = (newContact, newContactName) => {
    if (newContact === '') {
      return;
    }
    let arr = this.state.sendersArr;
    let arrNames = this.state.sendersArrNames;
    arr.push(newContact);
    newContactName !== ''
      ? arrNames.push(newContactName)
      : newContact.toString();
    arr = [...new Set(arr)];
    arrNames = [...new Set(arrNames)];
    this.setState({
      sendersArray: arr,
      sendersArrNames: arrNames,
    });
  };

  handleRemoveContact = (removeContact, removeContactName) => {
    let arr = this.state.sendersArr;
    let arrNames = this.state.sendersArrNames;
    const indexOfRemovingItem = arr.indexOf(removeContact);
    const indexOfRemovingItemName = arrNames.indexOf(removeContactName);
    if (indexOfRemovingItem !== -1) {
      arr.splice(indexOfRemovingItem, 1);
    }
    if (indexOfRemovingItemName !== -1) {
      arrNames.splice(indexOfRemovingItemName, 1);
    }
    this.setState({
      sendersArr: arr,
      sendersArrNames: arrNames,
    });
  };

  render() {
    return (
      <PaperProvider theme={theme}>
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
            onPress={() =>
              this.handleOnPressContact(
                this.state.searchQuery,
                this.state.searchQuery,
              )
            }
          />
        </Appbar.Header>
        <View
          style={{
            flex: 1,
          }}>
          <View style={{alignItems: 'center', padding: 2}}>
            <ScrollView horizontal={true}>
              {this.state.sendersArrNames.map((senderInArr, key) => (
                <Chip
                  key={key}
                  style={{margin: 2}}
                  onClose={() =>
                    this.handleRemoveContact(
                      this.state.sendersArr[key],
                      this.state.sendersArrNames[key],
                    )
                  }
                  onPress={() => console.log('Pressed')}>
                  {senderInArr}
                </Chip>
              ))}
            </ScrollView>
          </View>
          <ScrollView style={{height: '100%'}}>
            {this.state.contacts.map((contact, key) => (
              <List.Item
                onPress={() =>
                  this.handleOnPressContact(
                    contact.phoneNumbers[0].number,
                    contact.displayName,
                  )
                }
                key={key}
                title={contact.displayName}
                description={contact.phoneNumbers[0].number}
                left={props => (
                  <List.Icon {...props} icon="card-account-phone" />
                )}
              />
            ))}
          </ScrollView>

          <View style={{flexGrow: 1}} />

          <View style={{flexDirection: 'row'}}>
            <TextInput
              style={{
                width: (5 * Dimensions.get('window').width) / 6,
                borderTopLeftRadius: 0,
                borderColor: '#171717',
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
      </PaperProvider>
    );
  }
}

export default App;
