import { SafeAreaView, StatusBar, StyleSheet, View , useColorScheme} from 'react-native';
import React, { useEffect } from 'react';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { AlertProvider } from './src/Providers/AlertContext';
import DynamicAlert from './src/components/DynamicAlert';
import Router from './src/navigations/router';
import { persistor, Store } from './src/redux/Store/Store';


import { Colors } from './src/Constants/themeColors';
import { setDarkMode } from './src/redux/Slices/Theme';

const MainRoot = () => {
  const { isDarkMode } = useSelector(store => store.theme);
  const colorScheme = useColorScheme();
// console.log(colorScheme);

const dispatch = useDispatch()


  useEffect(()=> {
    if (colorScheme === 'dark') {
      dispatch(setDarkMode(true))
    }else{
      dispatch(setDarkMode(false))
    }
  },[colorScheme])

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: isDarkMode ? Colors.darkTheme.background : Colors.lightTheme.secondryColor },
      ]}
    >
      <StatusBar
        backgroundColor={isDarkMode ? Colors.darkTheme.secondryColor : Colors.lightTheme.secondryColor}
        barStyle={isDarkMode? 'light-content': 'dark-content'}
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
        <AlertProvider>
          <MainRoot />
        </AlertProvider>
      </PersistGate>
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
