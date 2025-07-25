import {useDispatch} from 'react-redux';
import {logoutUser} from '../redux/Slices/authSlice';
import {CommonActions} from '@react-navigation/native';
import {SCREENS} from '../Constants/Screens';
import {removeToken} from './tokenStorage';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useLogout = () => {
  const dispatch = useDispatch();

  const logout = async (navigation = null) => {
    try {
      // 1. Clear token from AsyncStorage
      await removeToken();
      
      // 2. Clear all persisted data from AsyncStorage (critical fix)
      await AsyncStorage.multiRemove([
        'authToken',
        'persist:root', // This is the key redux-persist uses
        'user_data',
        'profile_cache'
      ]);
      
      // 3. Clear Redux state
      dispatch(logoutUser());
      
      // 4. Force Redux persist to purge (if persistor is available)
      try {
        const {persistor} = await import('../redux/Store/Store');
        await persistor.purge();
        await persistor.flush();
      } catch (e) {
        console.log('Persistor not available for purge:', e);
      }
      
      // 5. Optional navigation reset
      if (navigation) {
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{name: SCREENS.WELCOME}],
          }),
        );
      }
      
      console.log('Complete logout successful');
    } catch (error) {
      console.error('Logout error:', error);
      // Still dispatch logout even if cleanup fails
      dispatch(logoutUser());
    }
  };

  return logout;
};

export const useLogoutWithCallback = () => {
  const dispatch = useDispatch();

  const logout = async (navigation = null, callback = null) => {
    try {
      // Complete cleanup
      await removeToken();
      await AsyncStorage.multiRemove([
        'authToken',
        'persist:root',
        'user_data',
        'profile_cache'
      ]);
      
      dispatch(logoutUser());
      
      // Purge persistor
      try {
        const {persistor} = await import('../redux/Store/Store');
        await persistor.purge();
        await persistor.flush();
      } catch (e) {
        console.log('Persistor purge failed:', e);
      }

      if (navigation) {
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{name: SCREENS.ONBOARDING}],
          }),
        );
      }

      if (callback) {
        setTimeout(callback, 100);
      }
    } catch (error) {
      console.error('Logout with callback error:', error);
      dispatch(logoutUser());
    }
  };

  return logout;
};

export const useSimpleLogout = () => {
  const dispatch = useDispatch();

  const logout = async () => {
    try {
      await removeToken();
      await AsyncStorage.multiRemove(['authToken', 'persist:root']);
      dispatch(logoutUser());
      
      // Purge persistor
      try {
        const {persistor} = await import('../redux/Store/Store');
        await persistor.purge();
      } catch (e) {
        console.log('Simple logout persistor purge failed:', e);
      }
    } catch (error) {
      console.error('Simple logout error:', error);
      dispatch(logoutUser());
    }
  };

  return logout;
};

export const useAuthNavigation = () => {
  const navigateToLogin = navigation => {
    if (navigation) {
      navigation.navigate(SCREENS.LOGIN);
    }
  };

  const navigateToWelcome = navigation => {
    if (navigation) {
      navigation.navigate(SCREENS.WELCOME);
    }
  };

  return {
    navigateToLogin,
    navigateToWelcome,
  };
};

export const useAuthBackHandler = () => {
  const handleBackPress = () => {
    return true;
  };

  return handleBackPress;
};

export const clearUserSession = async () => {
  try {
    await AsyncStorage.multiRemove([
      'authToken',
      'persist:root',
      'user_data',
      'profile_cache'
    ]);
    console.log('User session cleared completely');
  } catch (error) {
    console.error('Error clearing session:', error);
  }
};

// Force clear all authentication data - nuclear option
export const forceAuthReset = async () => {
  try {
    // Get all AsyncStorage keys
    const keys = await AsyncStorage.getAllKeys();
    
    // Filter keys that might contain auth/user data
    const authKeys = keys.filter(key => 
      key.includes('auth') || 
      key.includes('user') || 
      key.includes('token') || 
      key.includes('persist')
    );
    
    if (authKeys.length > 0) {
      await AsyncStorage.multiRemove(authKeys);
    }
    
    // Also try to purge persistor
    try {
      const {persistor} = await import('../redux/Store/Store');
      await persistor.purge();
      await persistor.flush();
    } catch (e) {
      console.log('Persistor force reset failed:', e);
    }

    console.log('Force auth reset completed');
  } catch (error) {
    console.error('Force auth reset error:', error);
  }
};
