import { SafeAreaView, StatusBar, StyleSheet, View , useColorScheme} from 'react-native';
import React, { useEffect } from 'react';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { StripeProvider } from '@stripe/stripe-react-native';
import { AlertProvider } from './src/Providers/AlertContext';
import DynamicAlert from './src/components/DynamicAlert';
import Router from './src/navigations/router';
import { persistor, Store } from './src/redux/Store/Store';
import AuthErrorBoundary from './src/components/AuthErrorBoundary';

import { Colors } from './src/Constants/themeColors';
import { setDarkMode } from './src/redux/Slices/Theme';
import {AuthProvider} from './src/Providers/AuthProvider';
import {VideoCallProvider} from './src/Providers/VideoCallProvider';
import {SocketProvider} from './src/Providers/SocketProvider';
import { STRIPE_PROVIDER_CONFIG } from './src/Constants/StripeConfig';

// Stripe Configuration
const STRIPE_PUBLISHABLE_KEY = STRIPE_PROVIDER_CONFIG.publishableKey;

const MainRoot = () => {
  const {isDarkMode} = useSelector(store => store.theme);
  const colorScheme = useColorScheme();
  // console.log(colorScheme);

  const dispatch = useDispatch();

  useEffect(() => {
    if (colorScheme === 'dark') {
      dispatch(setDarkMode(true));
    } else {
      dispatch(setDarkMode(false));
    }
  }, [colorScheme]);

  return (
    <SafeAreaView
      style={[
        styles.container,
        {
          backgroundColor: isDarkMode
            ? Colors.darkTheme.background
            : Colors.lightTheme.secondryColor,
        },
      ]}>
      <StatusBar
        backgroundColor={
          isDarkMode
            ? Colors.darkTheme.secondryColor
            : Colors.lightTheme.secondryColor
        }
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
      />
      <Router />
      <DynamicAlert />
    </SafeAreaView>
  );
};

export default function App() {
  return (
    <Provider store={Store}>
      <PersistGate loading={null} persistor={persistor}>
        <StripeProvider 
          publishableKey={STRIPE_PROVIDER_CONFIG.publishableKey}
          merchantIdentifier={STRIPE_PROVIDER_CONFIG.merchantIdentifier}
          urlScheme={STRIPE_PROVIDER_CONFIG.urlScheme}
          setUrlSchemeOnAndroid={STRIPE_PROVIDER_CONFIG.setUrlSchemeOnAndroid}
        >
          <AuthErrorBoundary onReset={() => {
            // Force app to reload after auth reset
            console.log('App restarting after auth reset...');
          }}>
            <AlertProvider>
              <SocketProvider>
                <VideoCallProvider>
                  <AuthProvider>
                    <MainRoot />
                  </AuthProvider>
                </VideoCallProvider>
              </SocketProvider>
            </AlertProvider>
          </AuthErrorBoundary>
        </StripeProvider>
      </PersistGate>
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
