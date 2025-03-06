import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from '@/src/contexts/AuthContext'; 
import RootNavigator from '@/src/navigation/RootNavigator'; 
import { DefaultTheme, Provider as PaperProvider } from 'react-native-paper';

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#4A6572',
    accent: '#F9AA33',
    background: '#F5F5F5',
    text: '#344955',
    error: '#B00020',
  },
};

export default function App() {
  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <AuthProvider>
          {/* <NavigationContainer> */}
            <StatusBar style="auto" />
            <RootNavigator />
          {/* </NavigationContainer> */}
        </AuthProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
}