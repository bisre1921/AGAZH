import { useState } from "react";
import { useAuth } from "@/src/contexts/AuthContext"; 
import { SafeAreaView } from "react-native-safe-area-context";
import { Alert, ScrollView, StyleSheet, View } from "react-native";
import { Button, RadioButton, Text, TextInput } from "react-native-paper";
import { Formik } from "formik";
import * as Yup from "yup";

const LoginSchema = Yup.object().shape({
    email: Yup.string().email('Invalid email').required('Email is required'),
    password: Yup.string().required('Password is required'),
});

const LoginScreen = ({navigation}: {navigation: any}) => {
    const {login} = useAuth();
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (values: any) => {
        if (values.user_type !== "housekeeper" && values.user_type !== "employer") {
            Alert.alert("Invalid User Type", "Please select a valid user type.");
            return;
        }
      
        try {
            setIsLoading(true);
            console.log(values);
            await login(values.email, values.password, values.user_type);
        } catch (error: any) {
            console.error("login error", error);
            Alert.alert(
                'Login Failed',
                error?.response?.data?.error || error?.message || 'Invalid credentials. Please try again.'
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Text style={styles.title}>Welcome Back</Text>
                <Text style={styles.subtitle}>Sign in to continue</Text>

                <Formik
                    initialValues={{ email: '', password: '', user_type: "employer" }}
                    validationSchema={LoginSchema}
                    onSubmit={handleLogin}
                >
                    {({ handleChange, handleBlur, handleSubmit, values, errors, touched, setFieldValue }) => (
                        <View style={styles.form}>
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

                            <View style={styles.radioContainer}>
                                <Text style={styles.radioLabel}>I am a:</Text>
                                <RadioButton.Group
                                    onValueChange={(value) => setFieldValue('user_type', value)}
                                    value={values.user_type}
                                >
                                    <View style={styles.radioButton}>
                                        <RadioButton value="employer" />
                                        <Text>Employer</Text>
                                    </View>
                                    <View style={styles.radioButton}>
                                        <RadioButton value="housekeeper" />
                                        <Text>Housekeeper</Text>
                                    </View>
                                </RadioButton.Group>
                            </View>

                            <Button
                                mode="contained"
                                onPress={() => handleSubmit()}
                                style={styles.button}
                                loading={isLoading}
                                disabled={isLoading}
                            >
                                Login
                            </Button>
                        </View>
                    )}
                </Formik>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>Don't have an account?</Text>
                    <Button
                        mode="text"
                        onPress={() => navigation.navigate('UserType')}
                        style={styles.footerButton}
                    >
                        Sign Up
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
      marginBottom: 32,
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
    radioContainer: {
      marginBottom: 24,
    },
    radioLabel: {
      fontSize: 16,
      marginBottom: 8,
      color: '#344955',
    },
    radioButton: {
      flexDirection: 'row',
      alignItems: 'center',
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

export default LoginScreen