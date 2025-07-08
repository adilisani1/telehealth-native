import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const dummyMessages = [
  {id: '1', sender: 'doctor', text: 'Hello Admin, I have a question.'},
  {id: '2', sender: 'admin', text: 'Hi Doctor, how can I help you?'},
];

const DoctorAdminChat = () => {
  const [messages, setMessages] = useState(dummyMessages);
  const [input, setInput] = useState('');

  const sendMessage = () => {
    if (input.trim()) {
      setMessages([
        ...messages,
        {id: String(messages.length + 1), sender: 'doctor', text: input},
      ]);
      setInput('');
    }
  };

  const renderItem = ({item}) => (
    <View
      style={[
        styles.message,
        item.sender === 'doctor' ? styles.doctor : styles.admin,
      ]}>
      <Text style={styles.text}>{item.text}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Chat with Admin</Text>
      <FlatList
        data={messages}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'flex-end',
          padding: 16,
        }}
      />
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Type your message..."
          value={input}
          onChangeText={setInput}
        />
        <TouchableOpacity onPress={sendMessage} style={styles.sendBtn}>
          <Ionicons name="send" size={22} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#fff'},
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    paddingVertical: 12,
  },
  message: {marginVertical: 6, maxWidth: '70%', padding: 10, borderRadius: 12},
  doctor: {alignSelf: 'flex-end', backgroundColor: '#0e61f3'},
  admin: {alignSelf: 'flex-start', backgroundColor: '#f0f0f0'},
  text: {color: '#222', fontSize: 15},
  inputRow: {
    flexDirection: 'row',
    padding: 12,
    borderTopWidth: 1,
    borderColor: '#eee',
  },
  input: {
    flex: 1,
    backgroundColor: '#f7f7f7',
    borderRadius: 25,
    paddingHorizontal: 16,
    fontSize: 15,
  },
  sendBtn: {
    marginLeft: 8,
    backgroundColor: '#0e61f3',
    borderRadius: 25,
    padding: 10,
  },
});

export default DoctorAdminChat;
