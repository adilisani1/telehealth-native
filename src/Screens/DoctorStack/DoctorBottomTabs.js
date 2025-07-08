import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import DoctorDashboard from './DoctorDashboard';
import DoctorAppointments from './DoctorAppointments';
import DoctorProfile from './DoctorProfile';
import DoctorAdminChat from './DoctorAdminChat'; // create this next!
import Ionicons from 'react-native-vector-icons/Ionicons';

const Tab = createBottomTabNavigator();

const DoctorBottomTabs = () => (
  <Tab.Navigator
    screenOptions={({route}) => ({
      headerShown: false,
      tabBarShowLabel: false,
      tabBarIcon: ({focused, color, size}) => {
        let iconName;
        if (route.name === 'DoctorHome')
          iconName = focused ? 'home' : 'home-outline';
        else if (route.name === 'DoctorChat')
          iconName = focused ? 'chatbubble' : 'chatbubble-outline';
        else if (route.name === 'DoctorCalendar')
          iconName = focused ? 'calendar' : 'calendar-outline';
        else if (route.name === 'DoctorProfile')
          iconName = focused ? 'person' : 'person-outline';
        return <Ionicons name={iconName} size={24} color={color} />;
      },
      tabBarActiveTintColor: '#0e61f3',
      tabBarInactiveTintColor: 'gray',
    })}>
    <Tab.Screen name="DoctorHome" component={DoctorDashboard} />
    <Tab.Screen name="DoctorChat" component={DoctorAdminChat} />
    <Tab.Screen name="DoctorCalendar" component={DoctorAppointments} />
    <Tab.Screen name="DoctorProfile" component={DoctorProfile} />
  </Tab.Navigator>
);

export default DoctorBottomTabs;
