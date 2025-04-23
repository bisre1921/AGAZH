import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../contexts/AuthContext';

// Auth Screens
import LoginScreen from '../screens/Auth/LoginScreen';
import RegisterEmployerScreen from '../screens/Auth/RegisterEmployerScreen';
import RegisterHousekeeperScreen from '../screens/Auth/RegisterHouseKeeperScreen';
import UserTypeScreen from '../screens/Auth/UserTypeScreen';

// Employer Screens
import EmployerTabNavigator from './EmployerTabNavigator';
import HousekeeperDetailScreen from '../screens/employer/HousekeeperDetailScreen';
import HireHousekeeperScreen from '../screens/employer/HireHousekeeperScreen';
import HiringStatusScreen from '../screens/employer/HiringStatusScreen';
import WriteReviewScreen from '../screens/employer/WriteReviewScreen';

// Housekeeper Screens
import HousekeeperTabNavigator from './HousekeeperTabNavigator';

// Loading Screen
import LoadingScreen from '../screens/common/LoadingScreen';

const Stack = createNativeStackNavigator();

const RootNavigator = () => {
  const { isLoading, isAuthenticated, userType } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#4A6572',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      {!isAuthenticated ? (
        // Auth screens
        <Stack.Group>
          <Stack.Screen
            name="UserType"
            component={UserTypeScreen}
            options={{ title: 'Welcome to AGAZH' }}
          />
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ title: 'Login' }}
          />
          <Stack.Screen
            name="RegisterEmployer"
            component={RegisterEmployerScreen}
            options={{ title: 'Register as Employer' }}
          />
          <Stack.Screen
            name="RegisterHousekeeper"
            component={RegisterHousekeeperScreen}
            options={{ title: 'Register as Housekeeper' }}
          />
        </Stack.Group>
      ) : userType === 'employer' ? (
        // Employer screens
        <Stack.Group>
          <Stack.Screen
            name="EmployerHome"
            component={EmployerTabNavigator}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="HousekeeperDetail"
            component={HousekeeperDetailScreen}
            options={{ title: 'Housekeeper Details' }}
          />
          <Stack.Screen
            name="HireHousekeeper"
            component={HireHousekeeperScreen}
            options={{ title: 'Hire Housekeeper' }}
          />
          <Stack.Screen
            name="HiringStatus"
            component={HiringStatusScreen}
            options={{ title: 'Hiring Status' }}
          />
          <Stack.Screen
            name="WriteReview"
            component={WriteReviewScreen}
            options={{ title: 'Write a Review' }}
          />
        </Stack.Group>
      ) : userType === 'housekeeper' ? ( // Corrected condition
        // Housekeeper screens
        <Stack.Group>
          <Stack.Screen
            name="HousekeeperHome"
            component={HousekeeperTabNavigator}
            options={{ headerShown: false }}
          />
        </Stack.Group>
      ) : (
        //Added a fallback, so if for some reason userType is neither, we go to login
        <Stack.Group>
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ title: 'Login' }}
          />
        </Stack.Group>
      )}
    </Stack.Navigator>
  );
};

export default RootNavigator;
