// import React, { } from 'react';
// import { NavigationContainer } from '@react-navigation/native';
// import AuthStack from './AuthStack';
// import MainStack from './MainStack';
// import { useSelector } from 'react-redux';
// import { navigationRef } from '../utils/navigationRef';
// import { StatusBar } from 'react-native';
// import { Colors } from '../Constants/themeColors';

// const Router = () => {
//     const { userId } = useSelector((state) => state.auth);
//       const { isDarkMode } = useSelector(store => store.theme);

//     return (
//         <NavigationContainer ref={navigationRef}>
//             {/* <StatusBar
//                     backgroundColor={isDarkMode ? Colors.darkTheme.secondryColor : Colors.lightTheme.secondryColor}
//                     barStyle={isDarkMode? 'light-content': 'dark-content'}
//                   /> */}

//             {userId ? <MainStack /> : <AuthStack />}

//         </NavigationContainer>
//     );
// };

// export default Router;
import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import AuthStack from './AuthStack';
import MainStack from './MainStack';
import DoctorStack from './DoctorStack';
import {useSelector} from 'react-redux';
import {navigationRef} from '../utils/navigationRef';
import {StatusBar} from 'react-native';
import {Colors} from '../Constants/themeColors';

const Router = () => {
  const {userId, userType} = useSelector(state => state.auth);
  console.log('Router.js Redux state:', { userId, userType });
  const {isDarkMode} = useSelector(store => store.theme);

  // Function to determine which stack to render
  const renderAppropriateStack = () => {
    // If no userId, show auth stack
    if (!userId) {
      return <AuthStack />;
    }

    // If user is authenticated, check user type
    if (userType === 'doctor') {
      return <DoctorStack />;
    }

    // Default to patient stack (MainStack)
    return <MainStack />;
  };

  return (
    <NavigationContainer ref={navigationRef}>
      <StatusBar
        backgroundColor={
          isDarkMode
            ? Colors.darkTheme.secondryColor
            : Colors.lightTheme.secondryColor
        }
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
      />
      {renderAppropriateStack()}
    </NavigationContainer>
  );
};

export default Router;
