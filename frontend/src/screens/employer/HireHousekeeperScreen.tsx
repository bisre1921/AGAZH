import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, TextInput, Button, Chip, RadioButton } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { Calendar, DateData } from 'react-native-calendars';
import { createHiring } from '../../api/api';
import { useAuth } from '../../contexts/AuthContext';
import { RootStackParamList } from '@/src/navigation/type';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';

const HireSchema = Yup.object().shape({
  requirements: Yup.string().required('Requirements are required'),
  salaryOffer: Yup.number()
    .typeError('Salary must be a number')
    .min(1, 'Salary must be greater than 0')
    .required('Salary offer is required'),
});



const HireHousekeeperScreen = ({ route, navigation }: { route: any; navigation: any }) => {
  const { housekeeper } = route.params;
  const { userInfo } = useAuth();
  const [selectedDate, setSelectedDate] = useState('');
  const [deliveryType, setDeliveryType] = useState('DELIVERY');
  const [loading, setLoading] = useState(false);

  // type NavigationProp = StackNavigationProp<RootStackParamList, 'HiringStataus', 'Browse'>;
  type NavigationProp = StackNavigationProp<RootStackParamList>;

  navigation = useNavigation<NavigationProp>();

  const handleHire = async (values: any) => {
    if (!selectedDate) {
      Alert.alert('Error', 'Please select a start date');
      return;
    }

    try {
      setLoading(true);
      
      const hiringData = {
        employer_id: userInfo.user_id,
        housekeeper_id: housekeeper.id,
        requirements: values.requirements,
        salary_offer: parseFloat(values.salaryOffer),
        start_date: new Date(selectedDate).toISOString(),
        delivery_type: deliveryType,
      };
      
      const response = await createHiring(hiringData);
      if (!response || !response.data || !response.data.id) {
        throw new Error('Invalid response from server');
      }
      
      navigation.navigate('HiringStatus', { hiringId: response.data.id });
      Alert.alert(
        'Hiring Request Sent',
        'Your hiring request has been sent successfully. The AGAZH team will contact you soon.',
        [
          {
            text: 'View Status',
            onPress: () => navigation.navigate('HiringStatus', { hiringId: response.data.id }),
          },
          {
            text: 'OK',
            onPress: () => navigation.navigate('Browse'),
          },
        ]
      );
    } catch (error: any) {
      console.error('Hiring error:', error);
      Alert.alert(
        'Hiring Failed',
        error.response?.data?.error || 'Failed to send hiring request. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Hire Housekeeper</Text>
        
        <View style={styles.housekeeperInfo}>
          <Text style={styles.infoLabel}>Housekeeper:</Text>
          <Text style={styles.infoValue}>{housekeeper.name}</Text>
        </View>
        
        <View style={styles.housekeeperInfo}>
          <Text style={styles.infoLabel}>Category:</Text>
          <Chip style={styles.categoryChip}>
          {housekeeper?.category?.replace('_', ' ') || 'Unknown'}

          </Chip>
        </View>
        
        <View style={styles.housekeeperInfo}>
          <Text style={styles.infoLabel}>Employment Type:</Text>
          <Chip style={styles.typeChip}>{housekeeper.employment_type}</Chip>
        </View>

        <Formik
          initialValues={{
            requirements: '',
            salaryOffer: 0,
          }}
          validationSchema={HireSchema}
          onSubmit={handleHire}
        >
          {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
            <View style={styles.form}>
              <Text style={styles.sectionTitle}>Start Date</Text>
              <Calendar
                onDayPress={(day: DateData) => setSelectedDate(day.dateString)}
                markedDates={{
                  [selectedDate]: { selected: true, selectedColor: '#F9AA33' },
                }}
                minDate={new Date().toISOString().split('T')[0]}
                theme={{
                  todayTextColor: '#4A6572',
                  selectedDayBackgroundColor: '#F9AA33',
                  arrowColor: '#4A6572',
                }}
                style={styles.calendar}
              />
              {selectedDate ? (
                <Text style={styles.selectedDate}>
                  Selected: {new Date(selectedDate).toLocaleDateString()}
                </Text>
              ) : (
                <Text style={styles.errorText}>Please select a start date</Text>
              )}

              <Text style={styles.sectionTitle}>Delivery Options</Text>
              <RadioButton.Group
                onValueChange={(value) => setDeliveryType(value)}
                value={deliveryType}
              >
                <View style={styles.radioOption}>
                  <RadioButton value="DELIVERY" />
                  <Text style={styles.radioLabel}>
                    Delivery (We'll bring the housekeeper to your home)
                  </Text>
                </View>
                <View style={styles.radioOption}>
                  <RadioButton value="PICKUP" />
                  <Text style={styles.radioLabel}>
                    Pickup (You'll pick up the housekeeper from our office)
                  </Text>
                </View>
              </RadioButton.Group>

              <Text style={styles.sectionTitle}>Requirements</Text>
              <TextInput
                label="Specific Requirements"
                value={values.requirements}
                onChangeText={handleChange('requirements')}
                onBlur={handleBlur('requirements')}
                style={styles.input}
                multiline
                numberOfLines={4}
                error={touched.requirements && !!errors.requirements}
              />
              {touched.requirements && errors.requirements && (
                <Text style={styles.errorText}>{errors.requirements}</Text>
              )}

              <Text style={styles.sectionTitle}>Salary Offer (USD)</Text>
              <TextInput
                label="Monthly Salary"
                value={values.salaryOffer.toString()}
                onChangeText={handleChange('salaryOffer')}
                onBlur={handleBlur('salaryOffer')}
                style={styles.input}
                keyboardType="numeric"
                error={touched.salaryOffer && !!errors.salaryOffer}
              />
              {touched.salaryOffer && errors.salaryOffer && (
                <Text style={styles.errorText}>{errors.salaryOffer}</Text>
              )}

              <Text style={styles.commissionNote}>
                Note: AGAZH charges a 10% commission fee on the first month's salary.
              </Text>

              <Button
                mode="contained"
                onPress={() => handleSubmit()}
                style={styles.submitButton}
                loading={loading}
                disabled={loading}
              >
                Submit Hiring Request
              </Button>
            </View>
          )}
        </Formik>
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
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#344955',
    marginBottom: 16,
  },
  housekeeperInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4A6572',
    width: 120,
  },
  infoValue: {
    fontSize: 16,
    color: '#344955',
  },
  categoryChip: {
    backgroundColor: '#E0E0E0',
  },
  typeChip: {
    backgroundColor: '#E0E0E0',
  },
  form: {
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#344955',
    marginTop: 24,
    marginBottom: 12,
  },
  calendar: {
    borderRadius: 8,
    elevation: 2,
    marginBottom: 16,
  },
  selectedDate: {
    color: '#4A6572',
    marginBottom: 8,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  radioLabel: {
    fontSize: 16,
    color: '#4A6572',
  },
  input: {
    backgroundColor: '#FFFFFF',
    marginBottom: 8,
  },
  errorText: {
    color: '#B00020',
    fontSize: 12,
    marginBottom: 8,
  },
  commissionNote: {
    color: '#4A6572',
    fontStyle: 'italic',
    marginTop: 8,
    marginBottom: 24,
  },
  submitButton: {
    backgroundColor: '#F9AA33',
    marginBottom: 24,
  },
});

export default HireHousekeeperScreen;