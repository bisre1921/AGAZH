import React, { useState } from 'react';
import { registerEmployer } from '../api/api';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Text, TextInput } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Formik } from 'formik';
import * as Yup from 'yup';

const RegisterEmployerSchema = Yup.object().shape({
  name: Yup.string().required('Name is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords must match')
    .required('Confirm password is required'),
  address: Yup.string().required('Address is required'),
  phoneNumber: Yup.string().required('Phone number is required'),
  familySize: Yup.number()
    .typeError('Family size must be a number')
    .min(1, 'Family size must be at least 1')
    .required('Family size is required'),
});

const RegisterEmployerScreen = ({ navigation }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (values: any) => {
    try {
      setIsLoading(true);

      const { confirmPassword, ...userData } = values;

      await registerEmployer(userData);

      Alert.alert(
        'Employer registered successfully',
        'you can now login with your email and password',
        [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
      );
    } catch (error: any) {
      console.error('Error registering employer', error);
      Alert.alert(
        'Registration Failed',
        error.response?.data?.error || 'Failed to register. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Create Employer Account</Text>
        <Text style={styles.subtitle}>Find the perfect housekeeper for your home</Text>

        <Formik
          initialValues={{
            name: '',
            email: '',
            password: '',
            confirmPassword: '',
            address: '',
            phoneNumber: '',
            familySize: '',
          }}
          validationSchema={RegisterEmployerSchema}
          onSubmit={handleRegister}
        >
          {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
            <View style={styles.form}>
              <TextInput
                label="Full Name"
                value={values.name}
                onChangeText={handleChange('name')}
                onBlur={handleBlur('name')}
                style={styles.input}
                error={touched.name && !!errors.name}
              />
              {touched.name && errors.name && (
                <Text style={styles.errorText}>{errors.name}</Text>
              )}

              <TextInput
                label="Email"
                value={values.email}
                onChangeText={handleChange('email')}
                onBlur={handleBlur('email')}
                style={styles.input}
                keyboardType="email-address"
                autoCapitalize="none"
                error={touched.email && !!errors.email}
              />
              {touched.email && errors.email && (
                <Text style={styles.errorText}>{errors.email}</Text>
              )}

              <TextInput
                label="Password"
                value={values.password}
                onChangeText={handleChange('password')}
                onBlur={handleBlur('password')}
                style={styles.input}
                secureTextEntry
                error={touched.password && !!errors.password}
              />
              {touched.password && errors.password && (
                <Text style={styles.errorText}>{errors.password}</Text>
              )}

              <TextInput
                label="Confirm Password"
                value={values.confirmPassword}
                onChangeText={handleChange('confirmPassword')}
                onBlur={handleBlur('confirmPassword')}
                style={styles.input}
                secureTextEntry
                error={touched.confirmPassword && !!errors.confirmPassword}
              />
              {touched.confirmPassword && errors.confirmPassword && (
                <Text style={styles.errorText}>{errors.confirmPassword}</Text>
              )}

              <TextInput
                label="Address"
                value={values.address}
                onChangeText={handleChange('address')}
                onBlur={handleBlur('address')}
                style={styles.input}
                error={touched.address && !!errors.address}
              />
              {touched.address && errors.address && (
                <Text style={styles.errorText}>{errors.address}</Text>
              )}

              <TextInput
                label="Phone Number"
                value={values.phoneNumber}
                onChangeText={handleChange('phoneNumber')}
                onBlur={handleBlur('phoneNumber')}
                style={styles.input}
                keyboardType="phone-pad"
                error={touched.phoneNumber && !!errors.phoneNumber}
              />
              {touched.phoneNumber && errors.phoneNumber && (
                <Text style={styles.errorText}>{errors.phoneNumber}</Text>
              )}

              <TextInput
                label="Family Size"
                value={values.familySize}
                onChangeText={handleChange('familySize')}
                onBlur={handleBlur('familySize')}
                style={styles.input}
                keyboardType="numeric"
                error={touched.familySize && !!errors.familySize}
              />
              {touched.familySize && errors.familySize && (
                <Text style={styles.errorText}>{errors.familySize}</Text>
              )}

              <Button
                mode="contained"
                onPress={() => handleSubmit()}
                style={styles.button}
                loading={isLoading}
                disabled={isLoading}
              >
                Register
              </Button>
            </View>
          )}
        </Formik>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account?</Text>
          <Button
            mode="text"
            onPress={() => navigation.navigate('Login')}
            style={styles.footerButton}
          >
            Login
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#344955',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#4A6572',
    marginBottom: 24,
  },
  form: {
    marginBottom: 24,
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  errorText: {
    color: '#B00020',
    fontSize: 12,
    marginTop: -12,
    marginBottom: 12,
    marginLeft: 8,
  },
  button: {
    marginTop: 8,
    borderRadius: 8,
    backgroundColor: '#4A6572',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  footerText: {
    color: '#4A6572',
  },
  footerButton: {
    marginLeft: 4,
  },
});

export default RegisterEmployerScreen;
