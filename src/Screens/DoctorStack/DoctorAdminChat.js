import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Alert,
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
  const [doctorData, setDoctorData] = useState(null);
  const [isEditingFee, setIsEditingFee] = useState(false);

  // Fetch doctor data to pre-populate fields
  useEffect(() => {
    const fetchDoctorData = async () => {
      try {
        const token = await getToken();
        const res = await axios.get(
          `${BASE_URL}/api/doctor/earning-negotiation`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const data = res?.data?.data;
        if (data) {
          setDoctorData(data);
          // Only pre-populate currency, NOT the fee
          // Let the doctor enter their own proposed fee
          if (data.currency && !currency) {
            setCurrency(data.currency);
          }
        }
      } catch (e) {
        console.log('Error fetching doctor data:', e);
      }
    };
    fetchDoctorData();
  }, []);

  // Polling: fetch messages every 3 seconds and update doctor data
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
        const data = res?.data?.data;
        
        if (data) {
          // Update doctor data state
          setDoctorData(data);
          
          // DON'T override the doctor's proposed fee input
          // Only update currency if user is not editing and it changed server-side
          if (!isEditingFee && data.currency && data.currency !== currency) {
            setCurrency(data.currency);
          }
          
          // Use earningNegotiationHistory from res.data.data
          const history = data.earningNegotiationHistory || [];
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
        }
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
  }, [currency, isEditingFee]); // Removed proposedFee dependency to prevent override

  // Send message to admin
  const sendMessage = async () => {
    if (!input.trim()) {
      Alert.alert('Error', 'Please enter a message');
      return;
    }
    if (!proposedFee || isNaN(Number(proposedFee)) || Number(proposedFee) <= 0) {
      Alert.alert('Error', 'Please enter a valid fee amount');
      return;
    }
    
    // Check if proposed fee matches current agreed fee
    const isFeeSameAsAgreed = doctorData?.agreedFee && Number(proposedFee) === doctorData.agreedFee;
    
    try {
      const token = await getToken();
      const payload = {
        message: input.trim(),
        proposedFee: Number(proposedFee),
        currency,
      };
      const response = await axios.post(
        `${BASE_URL}/api/doctor/earning-negotiation/message`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Optimistically add to chat
      setMessages([
        ...messages,
        { 
          id: String(messages.length + 1), 
          sender: 'doctor', 
          text: input.trim(), 
          proposedFee: Number(proposedFee), 
          currency,
          timestamp: new Date().toISOString()
        },
      ]);
      setInput('');
      
      // Show helpful feedback based on fee change
      if (isFeeSameAsAgreed) {
        Alert.alert('Message Sent', 'Your message was sent. Since your proposed fee matches the current agreed fee, the negotiation status remains unchanged.');
      }
      
      // Don't clear fee fields as they should persist for negotiation
    } catch (e) {
      console.error('Error sending message:', e);
      Alert.alert('Error', 'Failed to send message. Please try again.');
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
      
      {/* Status Display */}
      {doctorData && (
        <View style={styles.statusContainer}>
          <Text style={styles.statusLabel}>Negotiation Status:</Text>
          <Text style={[
            styles.statusText,
            doctorData.earningNegotiationStatus === 'agreed' ? styles.statusAgreed : 
            doctorData.earningNegotiationStatus === 'negotiating' ? styles.statusNegotiating : 
            styles.statusPending
          ]}>
            {doctorData.earningNegotiationStatus?.toUpperCase() || 'PENDING'}
          </Text>
          
          {/* Current Agreed Fee (what admin has approved) */}
          {doctorData.agreedFee && (
            <Text style={styles.agreedFeeText}>
              Current Agreed Fee: {doctorData.agreedFee} {doctorData.currency}
            </Text>
          )}
          
          {/* Last Proposed Fee (what doctor previously proposed) */}
          {doctorData.proposedFee && (
            <Text style={styles.proposedFeeText}>
              Last Proposed Fee: {doctorData.proposedFee} {doctorData.currency}
            </Text>
          )}
          
          {/* New Proposal (what doctor is currently typing) */}
          {proposedFee && proposedFee !== (doctorData.proposedFee || '').toString() && (
            <Text style={[
              styles.newProposalText,
              doctorData.agreedFee && Number(proposedFee) === doctorData.agreedFee ? styles.sameAsAgreedText : null
            ]}>
              {doctorData.agreedFee && Number(proposedFee) === doctorData.agreedFee 
                ? `Same as Agreed: ${proposedFee} ${currency} (No status change)`
                : `New Proposal: ${proposedFee} ${currency}`
              }
            </Text>
          )}
        </View>
      )}
      
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
            onFocus={() => setIsEditingFee(true)}
            onBlur={() => setIsEditingFee(false)}
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
  statusContainer: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#0e61f3',
  },
  statusLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  statusText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statusAgreed: {
    color: '#28a745',
  },
  statusNegotiating: {
    color: '#ffc107',
  },
  statusPending: {
    color: '#6c757d',
  },
  agreedFeeText: {
    fontSize: 14,
    color: '#28a745',
    fontWeight: '600',
  },
  proposedFeeText: {
    fontSize: 14,
    color: '#0e61f3',
    fontWeight: '600',
    marginTop: 2,
  },
  newProposalText: {
    fontSize: 14,
    color: '#ff6b35',
    fontWeight: '700',
    marginTop: 2,
    backgroundColor: '#fff3e0',
    padding: 4,
    borderRadius: 4,
  },
  sameAsAgreedText: {
    color: '#28A745', // Green for same as agreed
    backgroundColor: '#e8f5e8',
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
