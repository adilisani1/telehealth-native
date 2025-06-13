import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';

const CallHistoryScreen = ({navigation}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Call History</Text>
      <Text style={styles.text}>
        All previous doctor/patient calls will show here.
      </Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.goBack()}>
        <Text style={styles.buttonText}>Back to Call</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  heading: {fontSize: 26, fontWeight: 'bold', marginBottom: 20},
  text: {fontSize: 18, marginBottom: 40},
  button: {
    backgroundColor: '#00d4a7',
    padding: 16,
    borderRadius: 8,
    marginVertical: 10,
  },
  buttonText: {color: '#fff', fontWeight: 'bold', fontSize: 16},
});

export default CallHistoryScreen;
