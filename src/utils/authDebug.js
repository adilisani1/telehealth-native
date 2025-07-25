import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Debug utility to diagnose authentication issues
 */
export const debugAuthState = async () => {
  try {
    console.log('=== AUTH DEBUG START ===');
    
    // Check AsyncStorage
    const authToken = await AsyncStorage.getItem('authToken');
    const persistRoot = await AsyncStorage.getItem('persist:root');
    const allKeys = await AsyncStorage.getAllKeys();
    
    console.log('Auth Token:', authToken ? 'EXISTS' : 'NULL');
    console.log('Persist Root:', persistRoot ? 'EXISTS' : 'NULL');
    console.log('All AsyncStorage Keys:', allKeys);
    
    // Check Redux state
    try {
      const { Store } = await import('../redux/Store/Store');
      const state = Store.getState();
      console.log('Redux Auth State:', {
        userId: state.auth?.userId,
        userType: state.auth?.userType,
        isAuthenticated: state.auth?.isAuthenticated,
        hasUser: !!state.auth?.User && Object.keys(state.auth.User).length > 0
      });
    } catch (e) {
      console.log('Redux state check failed:', e);
    }
    
    console.log('=== AUTH DEBUG END ===');
  } catch (error) {
    console.error('Debug auth state failed:', error);
  }
};

/**
 * Force clean all auth data - use when auth state is corrupted
 */
export const emergencyAuthClean = async () => {
  try {
    console.log('🚨 EMERGENCY AUTH CLEAN START');
    
    // Clear all AsyncStorage
    await AsyncStorage.clear();
    
    // Purge persistor
    try {
      const { persistor } = await import('../redux/Store/Store');
      await persistor.purge();
      await persistor.flush();
    } catch (e) {
      console.log('Persistor emergency clean failed:', e);
    }
    
    // Dispatch logout
    try {
      const { Store } = await import('../redux/Store/Store');
      const { logoutUser } = await import('../redux/Slices/authSlice');
      Store.dispatch(logoutUser());
    } catch (e) {
      console.log('Redux emergency logout failed:', e);
    }
    
    console.log('🚨 EMERGENCY AUTH CLEAN COMPLETE');
  } catch (error) {
    console.error('Emergency auth clean failed:', error);
  }
};

export default {
  debugAuthState,
  emergencyAuthClean,
};
