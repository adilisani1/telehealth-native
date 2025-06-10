import React, { } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AuthStack from './AuthStack';
import MainStack from './MainStack';
import { useSelector } from 'react-redux';
import { navigationRef } from '../utils/navigationRef';
import { StatusBar } from 'react-native';
import { Colors } from '../Constants/themeColors';

const Router = () => {
    const { userId } = useSelector((state) => state.auth);
      const { isDarkMode } = useSelector(store => store.theme);
    
    return (
        <NavigationContainer ref={navigationRef}>
            {/* <StatusBar
                    backgroundColor={isDarkMode ? Colors.darkTheme.secondryColor : Colors.lightTheme.secondryColor}
                    barStyle={isDarkMode? 'light-content': 'dark-content'}
                  /> */}

            {userId ? <MainStack /> : <AuthStack />}

        </NavigationContainer>
    );
};


export default Router;
