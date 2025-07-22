import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Ionicons from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import { getToken } from '../../utils/tokenStorage';

const BASE_URL = 'https://mrvwhr8v-5000.inc1.devtunnels.ms'; // Replace with your actual base_url

const DoctorAdminChat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [proposedFee, setProposedFee] = useState('');
  const [currency, setCurrency] = useState('PKR');
  const [loading, setLoading] = useState(false);

  // Polling: fetch messages every 3 seconds
  useEffect(() => {
    let intervalId;
    const fetchMessages = async () => {
      setLoading(true);
      try {
        const token = await getToken();
        const res = await axios.get(
          `${BASE_URL}/api/doctor/earning-negotiation`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        // Use earningNegotiationHistory from res.data.data
        const history = res?.data?.data?.earningNegotiationHistory || [];
        // Map to message format for display
        const mappedMessages = history.map(msg => ({
          id: msg._id,
          sender: msg.sender,
          text: msg.message,
          timestamp: msg.timestamp,
          proposedFee: msg.proposedFee,
          currency: msg.currency,
        }));
        setMessages(mappedMessages);
      } catch (e) {
        setMessages([]);
      } finally {
        setLoading(false);
      }
    };
    fetchMessages(); // initial fetch
    intervalId = setInterval(fetchMessages, 3000); // poll every 3 seconds
    return () => {
      clearInterval(intervalId);
    };
  }, []);

  // Send message to admin
  const sendMessage = async () => {
    if (input.trim() && proposedFee && currency) {
      try {
        const token = await getToken();
        const payload = {
          message: input,
          proposedFee: Number(proposedFee),
          currency,
        };
        await axios.post(
          `${BASE_URL}/api/doctor/earning-negotiation/message`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        // Optimistically add to chat
        setMessages([
          ...messages,
          { id: String(messages.length + 1), sender: 'doctor', text: input, proposedFee, currency },
        ]);
        setInput('');
        setProposedFee('');
        setCurrency('PKR');
      } catch (e) {
        // handle error
      }
    }
  };

  const renderItem = ({item}) => (
    <View
      style={[
        styles.message,
        item.sender === 'doctor' ? styles.doctor : styles.admin,
      ]}>
      <Text style={styles.text}>{item.text}</Text>
      {item.proposedFee && (
        <Text style={{fontSize: 13, color: '#555'}}>Fee: {item.proposedFee} {item.currency}</Text>
      )}
    </View>
  );
  return (
    <View style={[styles.container, {paddingBottom: 32}]}> 
      <Text style={styles.header}>Chat with Admin</Text>
      <FlatList
        data={messages}
        renderItem={renderItem}
        keyExtractor={item => item.id || String(Math.random())}
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'flex-end',
          padding: 16,
        }}
        refreshing={loading}
      />
      <View style={styles.inputRowColumn}>
        <TextInput
          style={[styles.input, {width: '100%', marginBottom: 10, minHeight: 48, height: 48}]}
          placeholder="Type your message..."
          value={input}
          onChangeText={setInput}
          placeholderTextColor="#444"
        />
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <TextInput
            style={[styles.input, {width: 100, marginRight: 8}]}
            placeholder="Fee"
            value={proposedFee}
            onChangeText={setProposedFee}
            keyboardType="numeric"
            placeholderTextColor="#888"
          />
          <View style={{width: 100, backgroundColor: '#f7f7f7', borderRadius: 25, justifyContent: 'center', marginRight: 8}}>
            <Picker
              selectedValue={currency}
              onValueChange={setCurrency}
              style={{color: '#222', height: 40}}
              dropdownIconColor="#0e61f3"
            >
              <Picker.Item label="PKR" value="PKR" />
              <Picker.Item label="USD" value="USD" />
            </Picker>
          </View>
          <TouchableOpacity onPress={sendMessage} style={styles.sendBtn}>
            <Ionicons name="send" size={22} color="#fff" />
          </TouchableOpacity>
        </View>
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
  inputRowColumn: {
    flexDirection: 'column',
    padding: 12,
    borderTopWidth: 1,
    borderColor: '#eee',
    paddingBottom: 24, // Extra padding for bottom nav bar
  },
  input: {
    flex: 1,
    backgroundColor: '#f7f7f7',
    borderRadius: 25,
    paddingHorizontal: 16,
    fontSize: 15,
    color: '#222', // Ensure text is visible
    minHeight: 40,
  },
  sendBtn: {
    marginLeft: 8,
    backgroundColor: '#0e61f3',
    borderRadius: 25,
    padding: 10,
  },
});

export default DoctorAdminChat;
