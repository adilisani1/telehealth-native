// import React from 'react';
// import { SCREENS } from '../Constants/Screens';

// import { useSelector } from 'react-redux';
// import Login from '../Screens/auth/Login';
// import ForgetPassword from '../Screens/auth/ForgetPassword';
// import VerifyCode from '../Screens/auth/VerifyCode';
// import ResetPassword from '../Screens/auth/ResetPassword';
// import TermsAndCondition from '../Screens/auth/TermsAndCondition';
// import Onboarding from '../Screens/auth/Onboarding';
// import { createNativeStackNavigator } from '@react-navigation/native-stack';
// import Welcome from '../Screens/auth/Welcome';
// import Signup from '../Screens/auth/SignUp/Signup';
// import MainStack from './MainStack';
// import ProgressScreen from '../Screens/auth/ProgressScreen';
// import OtpScreen from '../Screens/auth/OtpScreen';

// const Stack = createNativeStackNavigator();

// const AuthStack = () => {
//   return (
//     <Stack.Navigator
//       screenOptions={{headerShown: false}}
//       // initialRouteName={SCREENS.DASHBOARD}
//     >
//       <Stack.Screen name={SCREENS.ONBOARDING} component={Onboarding} />
//       <Stack.Screen name={SCREENS.LOGIN} component={Login} />
//       <Stack.Screen name={SCREENS.OTPSCREEN} component={OtpScreen} />
//       <Stack.Screen name={SCREENS.WELCOME} component={Welcome} />
//       <Stack.Screen name={SCREENS.FORGET} component={ForgetPassword} />
//       <Stack.Screen name={SCREENS.VERIFYCODE} component={VerifyCode} />
//       <Stack.Screen name={SCREENS.RESETPASSWORD} component={ResetPassword} />
//       <Stack.Screen name={SCREENS.SIGNUP} component={Signup} />
//       <Stack.Screen
//         name={SCREENS.TERMSANDCONDITION}
//         component={TermsAndCondition}
//       />
//       <Stack.Screen name={SCREENS.PROGRESS} component={ProgressScreen} />
//       <Stack.Screen name={SCREENS.DASHBOARD} component={MainStack} />
//     </Stack.Navigator>
//   );
// };

// export default AuthStack;
import {SCREENS} from '../Constants/Screens';
import Login from '../Screens/auth/Login';
import ForgetPassword from '../Screens/auth/ForgetPassword';
import VerifyCode from '../Screens/auth/VerifyCode';
import ResetPassword from '../Screens/auth/ResetPassword';
import TermsAndCondition from '../Screens/auth/TermsAndCondition';
import Onboarding from '../Screens/auth/Onboarding';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import Welcome from '../Screens/auth/Welcome';
import Signup from '../Screens/auth/SignUp/Signup';
import MainStack from './MainStack';
import ProgressScreen from '../Screens/auth/ProgressScreen';
import OtpScreen from '../Screens/auth/OtpScreen';
// Import DoctorStack
import DoctorStack from './DoctorStack';

const Stack = createNativeStackNavigator();

const AuthStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{headerShown: false}}
      // initialRouteName={SCREENS.DASHBOARD}
    >
      <Stack.Screen name={SCREENS.ONBOARDING} component={Onboarding} />
      <Stack.Screen name={SCREENS.LOGIN} component={Login} />
      <Stack.Screen name={SCREENS.OTPSCREEN} component={OtpScreen} />
      <Stack.Screen name={SCREENS.WELCOME} component={Welcome} />
      <Stack.Screen name={SCREENS.FORGET} component={ForgetPassword} />
      <Stack.Screen name={SCREENS.VERIFYCODE} component={VerifyCode} />
      <Stack.Screen name={SCREENS.RESETPASSWORD} component={ResetPassword} />
      <Stack.Screen name={SCREENS.SIGNUP} component={Signup} />
      <Stack.Screen
        name={SCREENS.TERMSANDCONDITION}
        component={TermsAndCondition}
      />
      <Stack.Screen name={SCREENS.PROGRESS} component={ProgressScreen} />

      {/* Main App Stacks */}
      <Stack.Screen name={SCREENS.DASHBOARD} component={MainStack} />
      <Stack.Screen name={SCREENS.DOCTOR_DASHBOARD} component={DoctorStack} />
    </Stack.Navigator>
  );
};

export default AuthStack;
