import React, { useState } from 'react';
import { View, Alert, ScrollView, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Button, Text, TextInput } from 'react-native-paper';
import * as Yup from 'yup';
import { Formik } from 'formik';
import * as ImagePicker from 'expo-image-picker';
import { registerHousekeeper } from '@/src/api/api';

const validationSchema = Yup.object().shape({
    name: Yup.string().required('Name is required'),
    email: Yup.string().email('Invalid email').required('Email is required'),
    password: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
    confirmPassword: Yup.string()
        .oneOf([Yup.ref('password')], 'Passwords must match')
        .required('Confirm Password is required'),
    phoneNumber: Yup.string().required('Phone number is required'),
    experience: Yup.number().required('Experience is required'),
    certifications: Yup.array().of(Yup.string()).default([]),
    photo_url: Yup.mixed().nullable(),
    age: Yup.number().required('Age is required').min(18, 'Age must be at least 18'),
    category: Yup.string().oneOf(['NORMAL', 'CHILD_CARE', 'CLEANING']).required('Category is required'), // Updated validation
    employmentType: Yup.string().oneOf(['LIVE_OUT', 'LIVE_IN']).required('Employment Type is required'), // Updated validation
    location: Yup.string().required('Location is required'),
    religion: Yup.string().required('Religion is required'),
    placeOfBirth: Yup.string().required('Place of Birth is required'),
});

const RegisterHouseKeeperScreen = ({ navigation }: { navigation: any }) => {
    const [certifications, setCertifications] = useState<string[]>([]);
    const [currentCertification, setCurrentCertification] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const addCertification = (setFieldValue: any) => {
        if (currentCertification.trim() && !certifications.includes(currentCertification.trim())) {
            const updatedCertifications = [...certifications, currentCertification.trim()];
            setCertifications(updatedCertifications);
            setFieldValue('certifications', updatedCertifications); // Update Formik state
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
            setFieldValue('photo_url', result.assets[0].uri); // Update Formik state directly
        }
    };

    const handleRegister = async (values: any) => {
        try {
            setIsLoading(true);
            const { confirmPassword, phoneNumber, employmentType, ...userData } = values;
            userData.phone_number = phoneNumber;
            userData.employment_type = employmentType;
            userData.age = parseInt(userData.age, 10);
            userData.experience = parseInt(userData.experience, 10);

            console.log(userData);

            await registerHousekeeper(userData);
            Alert.alert(
                'Housekeeper registered successfully',
                'you can now login with your email and password',
                [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
            );
        } catch (error: any) {
            Alert.alert('Registration Failed', error.response?.data?.error || error.message || 'Try again.');
        } finally {
            setIsLoading(false);
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
                    experience: 0,
                    certifications: [],
                    photo_url: null,
                    age: 0,
                    category: 'NORMAL', // Default value
                    employmentType: 'LIVE_OUT', // Default value
                    location: '',
                    religion: '',
                    placeOfBirth: '',
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
                            label="Age"
                            value={values.age.toString()}
                            onChangeText={handleChange('age')}
                            onBlur={handleBlur('age')}
                            style={styles.input}
                            keyboardType="numeric"
                            error={touched.age && !!errors.age}
                        />
                        {touched.age && errors.age && <Text style={styles.errorText}>{errors.age}</Text>}

                        {/* Replace TextInput with Picker for better UX */}
                        <TextInput
                            label="Category (NORMAL, CHILD_CARE, CLEANING)"
                            value={values.category}
                            onChangeText={handleChange('category')}
                            onBlur={handleBlur('category')}
                            style={styles.input}
                            error={touched.category && !!errors.category}
                        />
                        {touched.category && errors.category && <Text style={styles.errorText}>{errors.category}</Text>}

                        {/* Replace TextInput with Picker for better UX */}
                        <TextInput
                            label="Employment Type (LIVE_OUT, LIVE_IN)"
                            value={values.employmentType}
                            onChangeText={handleChange('employmentType')}
                            onBlur={handleBlur('employmentType')}
                            style={styles.input}
                            error={touched.employmentType && !!errors.employmentType}
                        />
                        {touched.employmentType && errors.employmentType && <Text style={styles.errorText}>{errors.employmentType}</Text>}

                        <TextInput
                            label="Location"
                            value={values.location}
                            onChangeText={handleChange('location')}
                            onBlur={handleBlur('location')}
                            style={styles.input}
                            error={touched.location && !!errors.location}
                        />
                        {touched.location && errors.location && <Text style={styles.errorText}>{errors.location}</Text>}

                        <TextInput
                            label="Religion"
                            value={values.religion}
                            onChangeText={handleChange('religion')}
                            onBlur={handleBlur('religion')}
                            style={styles.input}
                            error={touched.religion && !!errors.religion}
                        />
                        {touched.religion && errors.religion && <Text style={styles.errorText}>{errors.religion}</Text>}

                        <TextInput
                            label="Place of Birth"
                            value={values.placeOfBirth}
                            onChangeText={handleChange('placeOfBirth')}
                            onBlur={handleBlur('placeOfBirth')}
                            style={styles.input}
                            error={touched.placeOfBirth && !!errors.placeOfBirth}
                        />
                        {touched.placeOfBirth && errors.placeOfBirth && <Text style={styles.errorText}>{errors.placeOfBirth}</Text>}


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
                            value={values.experience.toString()}
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
                        <Button onPress={() => addCertification(setFieldValue)}>Add Certification</Button>
                        {certifications.map((cert, index) => (
                            <Text key={index}>{cert}</Text>
                        ))}

                        <TouchableOpacity onPress={() => pickImage(setFieldValue)}>
                            <Text>Pick an Image</Text>
                        </TouchableOpacity>
                        {values.photo_url && <Image source={{ uri: values.photo_url }} style={{ width: 100, height: 100 }} />}

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
