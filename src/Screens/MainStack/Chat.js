import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { RFPercentage } from 'react-native-responsive-fontsize';
import ChatHeader from '../../components/Header/ChatHeader';
import { useSelector } from 'react-redux';
import { Colors } from '../../Constants/themeColors';
import Ionicons from 'react-native-vector-icons/Ionicons';
import TxtInput from '../../components/TextInput/Txtinput';
import { Fonts } from '../../Constants/Fonts';


const Chat = () => {
    const { isDarkMode } = useSelector(store => store.theme);
  const [messages, setMessages] = useState([
    { id: '1', text: 'hello, doctor, i need help i believe am falling sick as i am experiencing mild symptoms, what do i do?', time: '10:13', sender: 'user' },
    { id: '2', text: 'I’m here for you, don’t worry. What symptoms are you experiencing?', time: '10:14', sender: 'doctor' },
    { id: '3', text: 'fever dry cough tiredness sore throat', time: '10:14', sender: 'user' },
    { id: '4', text: 'fever\ndry cough\ntiredness\nsore throat', time: '10:14', sender: 'doctor' },
    { id: '5', text: 'oh so sorry about that. do you have any underlying diseases?', time: '10:15', sender: 'doctor' },
    { id: '6', text: 'oh no', time: '10:16', sender: 'user' },
  ]);

  const [inputMessage, setInputMessage] = useState('');

  const handleSendMessage = () => {
    if (inputMessage.trim()) {
      const newMessage = {
        id: Math.random().toString(),
        text: inputMessage,
        time: new Date().toLocaleTimeString().slice(0, 5),
        sender: 'user',
      };
      setMessages([newMessage, ...messages]);
      setInputMessage('');
    }
  };

  const renderItem = ({ item }) => (
    <View
      style={[
        styles.messageContainer,
        item.sender === 'user'
          ? styles.userMessageContainer
          : styles.doctorMessageContainer,
      ]}
    >
      <Text
        style={[
          styles.messageText,
          item.sender === 'user'
            ? styles.userMessageText
            : styles.doctorMessageText,
        ]}
      >
        {item.text}
      </Text>
      <Text style={[styles.messageTime, item.sender === 'user'
            ? styles.userMessageText
            : styles.doctorMessageText,]}>{item.time}</Text>
    </View>
  );

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDarkMode? Colors.darkTheme.backgroundColor: Colors.lightTheme.backgroundColor,
    },
    chatList: {
      padding: wp('5%'),
    },
    messageContainer: {
      marginBottom: hp('1.5%'),
      maxWidth: '80%',
    //   minWidth: '30%',
      borderRadius: wp('2%'),
      padding: wp('4%'),
    },
    userMessageContainer: {
      alignSelf: 'flex-end',
      backgroundColor: isDarkMode? Colors.darkTheme.primaryColor: Colors.lightTheme.primaryColor,
    },
    doctorMessageContainer: {
      alignSelf: 'flex-start',
      backgroundColor: isDarkMode? Colors.darkTheme.secondryColor: '#EEEFF1FF',
    },
    messageText: {
      fontSize: RFPercentage(2),
      fontFamily: Fonts.Regular,
     

    },
    userMessageText: {
        color: isDarkMode? Colors.darkTheme.secondryTextColor: Colors.lightTheme.primaryBtn.TextColor
    },
    doctorMessageText: {
        color: isDarkMode? Colors.darkTheme.primaryTextColor: Colors.lightTheme.secondryTextColor
    },
    messageTime: {
      fontSize: RFPercentage(1.5),
      fontFamily: Fonts.Regular,
      color: isDarkMode? Colors.darkTheme.secondryTextColor: Colors.lightTheme.secondryTextColor,
      marginTop: hp('0.5%'),
      textAlign: 'right',
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: wp('5%'),
      paddingVertical: hp('1.5%'),
      backgroundColor: isDarkMode? Colors.darkTheme.secondryColor: Colors.lightTheme.secondryColor,
      borderTopWidth: 1,
      borderTopColor: isDarkMode? Colors.darkTheme.BorderGrayColor: Colors.lightTheme.BorderGrayColor,
    },
    textInput: {
      flex: 1,
      height: hp('6%'),
      borderWidth: 1,
      borderColor: '#ccc',
      borderRadius: wp('2%'),
      paddingHorizontal: wp('4%'),
      fontSize: RFPercentage(2),
      fontFamily: Fonts.Regular,
      color: '#333',
      backgroundColor: '#fff',
    },
    sendButton: {
      marginLeft: wp('3%'),
      backgroundColor: isDarkMode? Colors.darkTheme.primaryColor: Colors.lightTheme.primaryColor,
      borderRadius: wp('2%'),
      paddingHorizontal: wp('4%'),
      paddingVertical: hp('1.2%'),
      justifyContent: 'center',
      alignItems: 'center',
    },
    
  });


  return (
    <View style={styles.container}>
        <ChatHeader title={'Dr Kenny Smith'} />
      <FlatList
        data={messages}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        inverted
        contentContainerStyle={styles.chatList}
      />
      <View style={styles.inputContainer}>
      <TxtInput placeholder={'Message...'} style={{ flex:1,  }} value={inputMessage} onChangeText={setInputMessage} containerStyle={{ paddingHorizontal: wp(3), borderColor: isDarkMode ? Colors.darkTheme.BorderGrayColor: Colors.lightTheme.BorderGrayColor  }} />
        <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage}>
         <Ionicons name='navigate' size={wp(6)} color={Colors.white} />
        </TouchableOpacity>
      </View>
    </View>
  );
};



export default Chat;