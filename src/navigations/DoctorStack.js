import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {SCREENS} from '../Constants/Screens';

import DoctorDashboard from '../Screens/DoctorStack/DoctorDashboard';
import DoctorProfile from '../Screens/DoctorStack/DoctorProfile';
import DoctorPatients from '../Screens/DoctorStack/DoctorPatients';
import PatientProfile from '../Screens/DoctorStack/PatientProfile';
import ConsultationNotes from '../Screens/DoctorStack/ConsultationNotes';
import ManageAvailability from '../Screens/DoctorStack/ManageAvailability';
import DoctorEarnings from '../Screens/DoctorStack/DoctorEarnings';
import DoctorAppointments from '../Screens/DoctorStack/DoctorAppointments';
import DoctorReviews from '../Screens/DoctorStack/DoctorReviews';

import CallScreen from '../Screens/MainStack/Call/CallScreen';
import CallHistoryScreen from '../Screens/MainStack/Call/CallHistoryScreen';
import Chat from '../Screens/MainStack/Chat';
import Notifications from '../Screens/MainStack/Notifications';
import HelpCenter from '../Screens/MainStack/HelpCenter';
import ThemeSetting from '../Screens/MainStack/ThemeSetting';
import PasswordManager from '../Screens/MainStack/PasswordManager';
import NotificationSettings from '../Screens/MainStack/AppPrefrences';
import DoctorBottomTabs from '../Screens/DoctorStack/DoctorBottomTabs';
import DoctorPaymentOptions from '../Screens/DoctorStack/DoctorPaymentOptions';
import UpdateProfile from '../Screens/MainStack/UpdateProfile';

const Stack = createNativeStackNavigator();

const DoctorStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
      initialRouteName={SCREENS.DOCTOR_BOTTOM_TABS}>
      <Stack.Screen
        name={SCREENS.DOCTOR_BOTTOM_TABS}
        component={DoctorBottomTabs}
      />
      <Stack.Screen
        name={SCREENS.DOCTOR_DASHBOARD}
        component={DoctorDashboard}
      />
      <Stack.Screen name={SCREENS.DOCTOR_PROFILE} component={DoctorProfile} />
      <Stack.Screen name={SCREENS.DOCTOR_PATIENTS} component={DoctorPatients} />
      <Stack.Screen name={SCREENS.PATIENT_PROFILE} component={PatientProfile} />
      <Stack.Screen
        name={SCREENS.CONSULTATION_NOTES}
        component={ConsultationNotes}
      />
      <Stack.Screen
        name={SCREENS.MANAGE_AVAILABILITY}
        component={ManageAvailability}
      />
      <Stack.Screen name={SCREENS.DOCTOR_EARNINGS} component={DoctorEarnings} />
      <Stack.Screen
        name={SCREENS.DOCTOR_APPOINTMENTS}
        component={DoctorAppointments}
      />
      <Stack.Screen name={SCREENS.DOCTOR_REVIEWS} component={DoctorReviews} />

      {/* Shared Screens */}
      <Stack.Screen name={SCREENS.CALL} component={CallScreen} />
      <Stack.Screen name={SCREENS.CALL_HISTORY} component={CallHistoryScreen} />
      <Stack.Screen name={SCREENS.CHAT} component={Chat} />
      <Stack.Screen name={SCREENS.NOTIFICATONS} component={Notifications} />
      <Stack.Screen name={SCREENS.HELPCENTER} component={HelpCenter} />
      <Stack.Screen name={SCREENS.THEMESETTINGS} component={ThemeSetting} />
      <Stack.Screen
        name={SCREENS.PASSWORDMANAGER}
        component={PasswordManager}
      />
      <Stack.Screen
        name={SCREENS.NOTIFICATIONSETTINGS}
        component={NotificationSettings}
      />
      <Stack.Screen name={SCREENS.UPDATEPROFILE} component={UpdateProfile} />

      <Stack.Screen
        name={SCREENS.DOCTOR_PAYMENT_OPTIONS}
        component={DoctorPaymentOptions}
      />
    </Stack.Navigator>
  );
};

export default DoctorStack;
