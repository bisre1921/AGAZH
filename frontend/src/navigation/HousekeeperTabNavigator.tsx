import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

// Screens
import HousekeeperDashboardScreen from '../screens/housekeeper/HousekeeperDashboardScreen';
import HousekeeperReviewsScreen from '../screens/housekeeper/HousekeeperReviewScreen'; 
import HousekeeperProfileScreen from '../screens/housekeeper/HousekeeperProfileScreen';

const Tab = createBottomTabNavigator();

const HousekeeperTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'Dashboard') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Reviews') {
            iconName = focused ? 'star' : 'star-outline';
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
        name="Dashboard" 
        component={HousekeeperDashboardScreen} 
        options={{ title: 'Dashboard' }}
      />
      <Tab.Screen 
        name="Reviews" 
        component={HousekeeperReviewsScreen} 
        options={{ title: 'My Reviews' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={HousekeeperProfileScreen} 
        options={{ title: 'My Profile' }}
      />
    </Tab.Navigator>
  );
};

export default HousekeeperTabNavigator;
