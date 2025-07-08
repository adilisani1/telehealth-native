import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';

const callHistoryData = [
  {
    id: '1',
    name: '+1 737 736 728',
    type: 'incoming',
    time: '1:24',
    date: '11/12/23',
  },
  {
    id: '2',
    name: 'Jacob Jones',
    type: 'outgoing',
    time: '1:24',
    date: '11/12/23',
  },
  {
    id: '3',
    name: 'Jerome Bell',
    type: 'missed',
    time: '1:24',
    date: '11/12/23',
  },
  {
    id: '4',
    name: '+1 737 736 728',
    type: 'incoming',
    time: '1:24',
    date: '11/12/23',
  },
  {
    id: '5',
    name: 'Devon Lane',
    type: 'incoming',
    time: '1:24',
    date: '11/12/23',
  },
  {
    id: '6',
    name: '+1 737 736 728',
    type: 'outgoing',
    time: '1:24',
    date: '11/12/23',
  },
];

const getCallIcon = type => {
  if (type === 'incoming')
    return <Feather name="phone-incoming" size={20} color="#41C857" />;
  if (type === 'outgoing')
    return <Feather name="phone-outgoing" size={20} color="#2196F3" />;
  if (type === 'missed')
    return <Feather name="phone-missed" size={20} color="#FF4B4B" />;
  return null;
};

const CallHistoryScreen = () => {
  const [search, setSearch] = useState('');
  const filtered = callHistoryData.filter(i =>
    i.name.toLowerCase().includes(search.toLowerCase()),
  );

  const renderItem = ({item}) => (
    <View style={styles.itemRow}>
      <View style={styles.iconWrap}>{getCallIcon(item.type)}</View>
      <View style={styles.infoWrap}>
        <Text style={styles.name}>{item.name}</Text>
        <View style={styles.subInfoRow}>
          <Text style={styles.subInfo}>{item.date}</Text>
          <Text style={styles.dot}>·</Text>
          <Text style={styles.subInfo}>{item.time}</Text>
        </View>
      </View>
      <View style={styles.timeWrap}>
        <Text style={styles.time}>{item.time}</Text>
        <Ionicons
          name="checkmark-done-circle-outline"
          size={22}
          color="#4C9AFF"
          style={{marginTop: 2}}
        />
      </View>
    </View>
  );

  return (
    <View style={styles.root}>
      <View style={styles.card}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>History</Text>
          <TouchableOpacity>
            <Feather name="settings" size={22} color="#1C274C" />
          </TouchableOpacity>
        </View>
        <TextInput
          style={styles.search}
          placeholder="Search"
          value={search}
          onChangeText={setSearch}
          placeholderTextColor="#AAA"
        />
        <FlatList
          data={filtered}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          contentContainerStyle={{paddingBottom: 10}}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#f5f7fa',
    alignItems: 'center',
  },
  card: {
    width: '95%',
    marginTop: 15,
    borderRadius: 22,
    padding: 12,
    // backgroundColor: '#fff',
    // shadowColor: '#000',
    // shadowOffset: {width: 0, height: 2},
    // shadowOpacity: 0.06,
    // shadowRadius: 10,
    // elevation: 3,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#222',
  },
  search: {
    backgroundColor: '#f2f3f8',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 8,
    fontSize: 15,
    marginBottom: 12,
    color: '#222',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  iconWrap: {width: 34, alignItems: 'center'},
  infoWrap: {flex: 1, marginLeft: 6},
  name: {fontSize: 16, fontWeight: '600', color: '#1C274C'},
  subInfoRow: {flexDirection: 'row', alignItems: 'center', marginTop: 2},
  subInfo: {color: '#9298A5', fontSize: 13},
  dot: {
    color: '#9298A5',
    marginHorizontal: 4,
    fontSize: 14,
    fontWeight: 'bold',
  },
  timeWrap: {alignItems: 'flex-end', minWidth: 50},
  time: {fontSize: 13, color: '#9298A5', marginBottom: 2, textAlign: 'right'},
  separator: {height: 1, backgroundColor: '#f2f3f8', marginLeft: 38},
});

export default CallHistoryScreen;
