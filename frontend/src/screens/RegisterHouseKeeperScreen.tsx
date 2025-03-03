import React, { useState } from 'react';
import { View, Alert, ScrollView, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Button, Text, TextInput } from 'react-native-paper';
import * as Yup from 'yup';
import { Formik } from 'formik';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';

const validationSchema = Yup.object().shape({
  name: Yup.string().required('Name is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  password: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords must match')
    .required('Confirm Password is required'),
  phoneNumber: Yup.string().required('Phone number is required'),
  experience: Yup.string().required('Experience is required'),
  certifications: Yup.array().of(Yup.string()).default([]),
  photo: Yup.mixed().nullable(),
});

interface FormValues {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phoneNumber: string;
  experience: string;
  certifications: string[];
  photo: string | null;
}

const RegisterHouseKeeperScreen = ({ navigation }) => {
  const [certifications, setCertifications] = useState<string[]>([]);
  const [currentCertification, setCurrentCertification] = useState('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);

  const addCertification = () => {
    if (currentCertification.trim() && !certifications.includes(currentCertification.trim())) {
      setCertifications([...certifications, currentCertification.trim()]);
      setCurrentCertification('');
    }
  };

  const pickImage = async (setFieldValue: any) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    if (!result.canceled && result.assets.length > 0) {
      setPhotoUri(result.assets[0].uri);
      setFieldValue('photo', result.assets[0].uri); // Update Formik field value
    }
  };

  const handleRegister = async (values: FormValues) => {
    try {
      const formData = new FormData();
      formData.append('name', values.name);
      formData.append('email', values.email);
      formData.append('password', values.password);
      formData.append('phoneNumber', values.phoneNumber);
      formData.append('experience', values.experience);
      values.certifications.forEach((cert, index) => {
        formData.append(`certifications[${index}]`, cert);
      });
      if (values.photo) {
        formData.append('photo', {
          uri: values.photo,
          name: 'photo.jpg',
          type: 'image/jpeg',
        } as any);
      }
      const response = await axios.post('YOUR_API_ENDPOINT', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      Alert.alert('Registration Successful', response.data.message);
    } catch (error: any) {
      Alert.alert('Registration Failed', error.response?.data?.error || error.message || 'Try again.');
    }
  };

  return (
    <ScrollView style={{ padding: 20 }}>
      <Text style={styles.title}>Create HouseKeeper Account</Text>
      <Text style={styles.subtitle}>Find the perfect Employer</Text>

      <Formik
        initialValues={{
          name: '',
          email: '',
          password: '',
          confirmPassword: '',
          phoneNumber: '',
          experience: '',
          certifications: [],
          photo: null,
        }}
        validationSchema={validationSchema}
        onSubmit={handleRegister}
      >
        {({ handleChange, handleBlur, handleSubmit, values, errors, touched, setFieldValue }) => (
          <View>
            <TextInput
              label="Full Name"
              value={values.name}
              onChangeText={handleChange('name')}
              onBlur={handleBlur('name')}
              style={styles.input}
              error={touched.name && !!errors.name}
            />
            {touched.name && errors.name && <Text style={styles.errorText}>{errors.name}</Text>}

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
            {touched.email && errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

            <TextInput
              label="Password"
              value={values.password}
              onChangeText={handleChange('password')}
              onBlur={handleBlur('password')}
              style={styles.input}
              secureTextEntry
              error={touched.password && !!errors.password}
            />
            {touched.password && errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

            <TextInput
              label="Confirm Password"
              value={values.confirmPassword}
              onChangeText={handleChange('confirmPassword')}
              onBlur={handleBlur('confirmPassword')}
              style={styles.input}
              secureTextEntry
              error={touched.confirmPassword && !!errors.confirmPassword}
            />
            {touched.confirmPassword && errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}

            <TextInput
              label="Phone Number"
              value={values.phoneNumber}
              onChangeText={handleChange('phoneNumber')}
              onBlur={handleBlur('phoneNumber')}
              style={styles.input}
              keyboardType="phone-pad"
              error={touched.phoneNumber && !!errors.phoneNumber}
            />
            {touched.phoneNumber && errors.phoneNumber && <Text style={styles.errorText}>{errors.phoneNumber}</Text>}

            <TextInput
              label="Experience"
              value={values.experience}
              onChangeText={handleChange('experience')}
              onBlur={handleBlur('experience')}
              style={styles.input}
              error={touched.experience && !!errors.experience}
            />
            {touched.experience && errors.experience && <Text style={styles.errorText}>{errors.experience}</Text>}

            <TextInput
              label="Add Certification"
              value={currentCertification}
              onChangeText={setCurrentCertification}
            />
            <Button onPress={addCertification}>Add Certification</Button>
            {certifications.map((cert, index) => (
              <Text key={index}>{cert}</Text>
            ))}

            <TouchableOpacity onPress={() => pickImage(setFieldValue)}>
              <Text>Pick an Image</Text>
            </TouchableOpacity>
            {photoUri && <Image source={{ uri: photoUri }} style={{ width: 100, height: 100 }} />}

            <Button onPress={() => handleSubmit()}>Register</Button>
          </View>
        )}
      </Formik>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Already have an account?</Text>
        <Button mode="text" onPress={() => navigation.navigate('Login')} style={styles.footerButton}>
          Login
        </Button>
      </View>
    </ScrollView>
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
    dropdownContainer: {
      marginBottom: 16,
    },
    dropdownLabel: {
      fontSize: 16,
      marginBottom: 8,
      color: '#344955',
    },
    dropdown: {
      backgroundColor: '#FFFFFF',
      borderColor: '#E0E0E0',
    },
    dropdownList: {
      backgroundColor: '#FFFFFF',
      borderColor: '#E0E0E0',
    },
    skillsContainer: {
      marginBottom: 16,
    },
    sectionTitle: {
      fontSize: 16,
      marginBottom: 8,
      color: '#344955',
    },
    skillInputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    skillInput: {
      flex: 1,
      backgroundColor: '#FFFFFF',
      marginRight: 8,
    },
    addButton: {
      backgroundColor: '#F9AA33',
    },
    chipContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
    },
    chip: {
      margin: 4,
      backgroundColor: '#E0E0E0',
    },
    photoContainer: {
      marginBottom: 16,
    },
    photoButton: {
      marginBottom: 8,
    },
    photoSelected: {
      color: '#4A6572',
      marginBottom: 8,
    },
    button: {
      marginTop: 16,
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

export default RegisterHouseKeeperScreen;
