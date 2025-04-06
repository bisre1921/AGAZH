import React, { useEffect, useRef } from 'react'
import { Animated, Image, StyleSheet, View } from 'react-native'
import { Button, Text } from 'react-native-paper'
import { SafeAreaView } from 'react-native-safe-area-context'

const UserTypeScreen = ({ navigation }: { navigation: any }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(30)).current

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 700,
        useNativeDriver: true,
      }),
    ]).start()
  }, [])

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={[styles.header, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <Image
          source={require('../../../assets/images/AGAZH LOGO.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title}>AGAZH</Text>
        <Text style={styles.subtitle}>Connecting Housekeepers and Employers</Text>
      </Animated.View>

      <View style={styles.body}>
        <Text style={styles.question}>How would you like to use AGAZH?</Text>

        <Button
          mode="contained"
          style={[styles.button, styles.employerButton]}
          contentStyle={styles.buttonContent}
          labelStyle={styles.buttonLabel}
          onPress={() => navigation.navigate('RegisterEmployer')}
        >
          I’m looking to hire a housekeeper
        </Button>

        <Button
          mode="contained"
          style={[styles.button, styles.housekeeperButton]}
          contentStyle={styles.buttonContent}
          labelStyle={styles.buttonLabel}
          onPress={() => navigation.navigate('RegisterHousekeeper')}
        >
          I’m a housekeeper looking for work
        </Button>

        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>Already have an account?</Text>
          <Button
            mode="text"
            onPress={() => navigation.navigate('Login')}
            labelStyle={styles.loginButton}
          >
            Login
          </Button>
        </View>

        <View style={styles.quoteBox}>
          <Text style={styles.quoteText}>
            “Empowering connections. Enabling futures.”
          </Text>
        </View>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F6FA',
  },
  header: {
    alignItems: 'center',
    paddingTop: 80, 
    paddingBottom: 50,
    paddingHorizontal: 20,
    backgroundColor: '#2E3A59',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 10,
    elevation: 10,
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 20,
    backgroundColor: '#FFF',
    marginBottom: 16,
  },
  title: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 15,
    color: '#DCE3F0',
    textAlign: 'center',
    marginTop: 6,
  },
  body: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 40,
  },
  question: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 24,
    color: '#2E3A59',
  },
  button: {
    borderRadius: 14,
    marginBottom: 18,
    elevation: 3,
  },
  employerButton: {
    backgroundColor: '#2E3A59',
  },
  housekeeperButton: {
    backgroundColor: '#FFA726',
  },
  buttonContent: {
    height: 54,
    justifyContent: 'center',
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center', 
    marginTop: 30,
  },
  loginText: {
    fontSize: 14,
    color: '#7B8A9C',
  },
  loginButton: {
    fontSize: 14,
    color: '#2E3A59',
    fontWeight: '700',
    marginLeft: 6,
    paddingVertical: 0, 
    textAlignVertical: 'center',
  },
  quoteBox: {
    marginTop: 40,
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    alignSelf: 'center',
  },
  quoteText: {
    fontSize: 14,
    color: '#3E4A59',
    fontStyle: 'italic',
    textAlign: 'center',
  },
})

export default UserTypeScreen
