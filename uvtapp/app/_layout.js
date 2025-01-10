import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import VisitorAccessScreen from './VisitorAccessScreen';
import DeviceEnrollmentScreen from './DeviceEnrollmentScreen';
import VisitorsScreen from './VisitorsScreen';

const Stack = createStackNavigator();

const Layout = ({ isEnrolled }) => {
  return (
    <Stack.Navigator initialRouteName={isEnrolled ? "VisitorsScreen" : "DeviceEnrollmentScreen"}>
      <Stack.Screen
        name="DeviceEnrollmentScreen"
        component={DeviceEnrollmentScreen}
        options={{ headerShown: false }} 
      />
      <Stack.Screen
        name="VisitorAccessScreen"
        component={VisitorAccessScreen}
        options={{ headerShown: false }} 
      />
      <Stack.Screen
        name="VisitorsScreen"
        component={VisitorsScreen}
        options={{ headerShown: false }} 
      />
    </Stack.Navigator>
  );
};

export default Layout;