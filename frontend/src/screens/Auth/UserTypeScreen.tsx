import React from 'react'
import { Image, StyleSheet } from 'react-native';
import { View } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context'

const UserTypeScreen = ({navigation}) => {
  return (
    <SafeAreaView style={styles.container}>
        <View style={styles.logoContainer}>
            <Image 
                source={{ uri: 'https://via.placeholder.com/200x200?text=AGAZH' }}
                style={styles.logo}
            />
            <Text style={styles.title}>AGAZH</Text>
            <Text style={styles.subtitle}>Connecting Housekeepers and Employers</Text>
        </View>

        <View style={styles.buttonContainer}>
        <Text style={styles.question}>How would you like to use AGAZH?</Text>
        
        <Button
          mode="contained"
          style={styles.button}
          contentStyle={styles.buttonContent}
          onPress={() => navigation.navigate('RegisterEmployer')}
        >
          I'm looking to hire a housekeeper
        </Button>
        
        <Button
          mode="contained"
          style={[styles.button, styles.secondaryButton]}
          contentStyle={styles.buttonContent}
          onPress={() => navigation.navigate('RegisterHousekeeper')}
        >
          I'm a housekeeper looking for work
        </Button>
        
        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>Already have an account?</Text>
          <Button
            mode="text"
            onPress={() => navigation.navigate('Login')}
            style={styles.loginButton}
          >
            Login
          </Button>
        </View>

      </View>

    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#F5F5F5',
    },
    logoContainer: {
      alignItems: 'center',
      marginTop: 60,
      marginBottom: 40,
    },
    logo: {
      width: 120,
      height: 120,
      borderRadius: 60,
    },
    title: {
      fontSize: 32,
      fontWeight: 'bold',
      marginTop: 16,
      color: '#344955',
    },
    subtitle: {
      fontSize: 16,
      color: '#4A6572',
      marginTop: 8,
      textAlign: 'center',
      paddingHorizontal: 20,
    },
    buttonContainer: {
      paddingHorizontal: 24,
    },
    question: {
      fontSize: 18,
      fontWeight: '500',
      marginBottom: 24,
      textAlign: 'center',
      color: '#344955',
    },
    button: {
      marginBottom: 16,
      borderRadius: 8,
      backgroundColor: '#4A6572',
    },
    buttonContent: {
      height: 56,
    },
    secondaryButton: {
      backgroundColor: '#F9AA33',
    },
    loginContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 24,
    },
    loginText: {
      color: '#4A6572',
    },
    loginButton: {
      marginLeft: 4,
    },
  });

export default UserTypeScreen