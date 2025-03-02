import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, ScrollView, TouchableOpacity, Image, StyleSheet } from 'react-native';
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

const RegisterHouseKeeperScreen = () => {
  const [certifications, setCertifications] = useState<string[]>([]);
  const [currentCertification, setCurrentCertification] = useState('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);

  const addCertification = () => {
    if (currentCertification.trim() && !certifications.includes(currentCertification.trim())) {
      setCertifications([...certifications, currentCertification.trim()]);
      setCurrentCertification('');
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    if (!result.canceled && result.assets.length > 0) {
      setPhotoUri(result.assets[0].uri);
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
        {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
          <View>
            <TextInput placeholder="Name" onChangeText={handleChange('name')} onBlur={handleBlur('name')} value={values.name} />
            {touched.name && errors.name && <Text>{errors.name}</Text>}

            <TextInput placeholder="Email" onChangeText={handleChange('email')} onBlur={handleBlur('email')} value={values.email} />
            {touched.email && errors.email && <Text>{errors.email}</Text>}

            <TextInput placeholder="Password" secureTextEntry onChangeText={handleChange('password')} onBlur={handleBlur('password')} value={values.password} />
            {touched.password && errors.password && <Text>{errors.password}</Text>}

            <TextInput placeholder="Confirm Password" secureTextEntry onChangeText={handleChange('confirmPassword')} onBlur={handleBlur('confirmPassword')} value={values.confirmPassword} />
            {touched.confirmPassword && errors.confirmPassword && <Text>{errors.confirmPassword}</Text>}

            <TextInput placeholder="Phone Number" onChangeText={handleChange('phoneNumber')} onBlur={handleBlur('phoneNumber')} value={values.phoneNumber} />
            {touched.phoneNumber && errors.phoneNumber && <Text>{errors.phoneNumber}</Text>}

            <TextInput placeholder="Experience" onChangeText={handleChange('experience')} onBlur={handleBlur('experience')} value={values.experience} />
            {touched.experience && errors.experience && <Text>{errors.experience}</Text>}

            <TextInput placeholder="Add Certification" value={currentCertification} onChangeText={setCurrentCertification} />
            <Button title="Add Certification" onPress={addCertification} />
            {certifications.map((cert, index) => (
              <Text key={index}>{cert}</Text>
            ))}

            <TouchableOpacity onPress={pickImage}>
              <Text>Pick an Image</Text>
            </TouchableOpacity>
            {photoUri && <Image source={{ uri: photoUri }} style={{ width: 100, height: 100 }} />}

            <Button title="Register" onPress={() => handleSubmit()} />
          </View>
        )}
      </Formik>
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
