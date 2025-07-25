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
import React, { useEffect } from 'react';
import {NavigationContainer} from '@react-navigation/native';
import AuthStack from './AuthStack';
import MainStack from './MainStack';
import DoctorStack from './DoctorStack';
import {useSelector, useDispatch} from 'react-redux';
import {navigationRef} from '../utils/navigationRef';
import {StatusBar} from 'react-native';
import {Colors} from '../Constants/themeColors';

const Router = () => {
  const {userId, userType, User} = useSelector(state => state.auth);
  const dispatch = useDispatch();
  
  // Add more detailed logging
  console.log('🔄 Router.js Redux state:', { 
    userId: userId ? 'EXISTS' : 'NULL', 
    userType, 
    hasUserObject: User && Object.keys(User).length > 0,
    userKeys: User ? Object.keys(User) : []
  });
  
  const {isDarkMode} = useSelector(store => store.theme);

  // Verify auth state on app start (with delay to allow token storage)
  useEffect(() => {
    const verifyAuthOnStart = async () => {
      if (userId && User && Object.keys(User).length > 0) {
        console.log('🔐 Starting auth verification for user:', userId);
        try {
          // Add a small delay to ensure token storage is complete
          setTimeout(async () => {
            console.log('🔍 Running auth state verification...');
            const { verifyAuthState } = await import('../utils/authRefresh');
            const isValid = await verifyAuthState(dispatch, User);
            
            if (!isValid) {
              console.log('❌ Auth state verification failed - user will be logged out');
            } else {
              console.log('✅ Auth state verification successful');
            }
          }, 1000); // 1 second delay
        } catch (error) {
          console.error('❌ Auth verification error:', error);
        }
      } else {
        console.log('⏸️ Skipping auth verification - no user data');
      }
    };

    verifyAuthOnStart();
  }, [userId, dispatch]);

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
