import AsyncStorage from '@react-native-async-storage/async-storage';

const storeToken = async (token) => {
  try {
    await AsyncStorage.setItem('authToken', token);
  } catch (e) {
    console.error('Error storing token', e);
  }
};

const getToken = async () => {
  try {
    return await AsyncStorage.getItem('authToken');
  } catch (e) {
    console.error('Error getting token', e);
    return null;
  }
};

const removeToken = async () => {
  try {
    await AsyncStorage.removeItem('authToken');
  } catch (e) {
    console.error('Error removing token', e);
  }
};

export { storeToken, getToken, removeToken };
