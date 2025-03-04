import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import BrowseHousekeepersScreen from '../screens/employer/BrowseHousekeeperScreen';
import HiringHistoryScreen from '../screens/employer/HiringHistoryScreen';
import EmployerProfileScreen from '../screens/employer/EmployerProfileScreen';

const Tab = createBottomTabNavigator();

const EmployerTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'Browse') {
            iconName = focused ? 'search' : 'search-outline';
          } else if (route.name === 'History') {
            iconName = focused ? 'time' : 'time-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          } else {
            return null;
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#F9AA33',
        tabBarInactiveTintColor: '#4A6572',
        headerStyle: {
          backgroundColor: '#4A6572',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      })}
    >
      <Tab.Screen 
        name="Browse" 
        component={BrowseHousekeepersScreen} 
        options={{ title: 'Browse Housekeepers' }}
      />
      <Tab.Screen 
        name="History" 
        component={HiringHistoryScreen} 
        options={{ title: 'Hiring History' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={EmployerProfileScreen} 
        options={{ title: 'My Profile' }}
      />
    </Tab.Navigator>
  );
};

export default EmployerTabNavigator;
