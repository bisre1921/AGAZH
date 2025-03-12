import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Card, Button, ActivityIndicator, Divider } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getHiringStatus, updateHiringStatus, getHousekeeper } from '../../api/api';

interface Housekeeper {
  id: string;
  name: string;
  email: string;
  location: string;
  experience: number;
  category: string;
  employment_type: string;
  skills?: string[];
  photo_url?: string;
  rating?: number;
  age: number;
  certifications?: string[];
  phone_number: string;
  reviews?: string[];
  is_available: boolean;
}

interface Hiring {
  id: string;
  status: string;
  start_date: string;
  salary_offer: number;
  delivery_type: string;
  requirements: string;
  created_at: string;
  housekeeper_id: string;
}

const HiringStatusScreen = ({ route, navigation }: { route: any; navigation: any }) => {
  const { hiringId } = route.params;
  const [hiring, setHiring] = useState<Hiring | null>(null);
  const [housekeeper, setHousekeeper] = useState<Housekeeper | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHiringDetails = async () => {
      try {
        const hiringResponse = await getHiringStatus(hiringId);
        setHiring(hiringResponse.data);
        
        const housekeeperResponse = await getHousekeeper(hiringResponse.data.housekeeper_id);
        setHousekeeper(housekeeperResponse.data);
      } catch (error) {
        console.error('Error fetching hiring details:', error);
        Alert.alert('Error', 'Failed to load hiring details');
      } finally {
        setLoading(false);
      }
    };

    fetchHiringDetails();
  }, [hiringId]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return '#FFC107';
      case 'APPROVED':
        return '#4CAF50';
      case 'REJECTED':
        return '#F44336';
      case 'COMPLETED':
        return '#2196F3';
      default:
        return '#9E9E9E';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'time-outline';
      case 'APPROVED':
        return 'checkmark-circle-outline';
      case 'REJECTED':
        return 'close-circle-outline';
      case 'COMPLETED':
        return 'checkmark-done-outline';
      default:
        return 'help-circle-outline';
    }
  };

  const handleWriteReview = () => {
    if (hiring && housekeeper) {
      navigation.navigate('WriteReview', {
        housekeeperId: hiring.housekeeper_id,
        housekeeperName: housekeeper.name,
      });
    }
  };

  const handleUpdateStatus = async (newStatus: string) => {
    if (!hiring) return;

    try {
      await updateHiringStatus(hiring.id, { status: newStatus });
      setHiring((prevHiring) => (prevHiring ? { ...prevHiring, status: newStatus } : null));
      Alert.alert('Success', `Hiring status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating hiring status:', error);
      Alert.alert('Error', 'Failed to update hiring status');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4A6572" />
        <Text style={styles.loadingText}>Loading hiring details...</Text>
      </View>
    );
  }

  if (!hiring || !housekeeper) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Unable to load the hiring or housekeeper details.</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.statusContainer}>
              <Ionicons
                name={getStatusIcon(hiring.status)}
                size={32}
                color={getStatusColor(hiring.status)}
              />
              <View style={styles.statusTextContainer}>
                <Text style={styles.statusTitle}>Status</Text>
                <Text
                  style={[styles.statusValue, { color: getStatusColor(hiring.status) }]}
                >
                  {hiring.status}
                </Text>
              </View>
            </View>

            <Divider style={styles.divider} />

            <Text style={styles.sectionTitle}>Housekeeper</Text>
            {housekeeper && (
              <View style={styles.housekeeperContainer}>
                <Text style={styles.housekeeperName}>{housekeeper.name}</Text>
                <Text style={styles.housekeeperDetail}>
                  Category: {housekeeper.category.replace('_', ' ')}
                </Text>
                <Text style={styles.housekeeperDetail}>
                  Type: {housekeeper.employment_type}
                </Text>
              </View>
            )}

            <Divider style={styles.divider} />

            <Text style={styles.sectionTitle}>Hiring Details</Text>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Start Date:</Text>
              <Text style={styles.detailValue}>
                {new Date(hiring.start_date).toLocaleDateString()}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Salary Offer:</Text>
              <Text style={styles.detailValue}>${hiring.salary_offer.toFixed(2)}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Delivery Type:</Text>
              <Text style={styles.detailValue}>{hiring.delivery_type}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Requirements:</Text>
              <Text style={styles.detailValue}>{hiring.requirements}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Requested On:</Text>
              <Text style={styles.detailValue}>
                {new Date(hiring.created_at).toLocaleDateString()}
              </Text>
            </View>

            <Divider style={styles.divider} />

            <Text style={styles.infoText}>
              The AGAZH team will contact you soon regarding your hiring request.
              For any questions, please contact our support team.
            </Text>

            {hiring.status === 'COMPLETED' && (
              <Button
                mode="contained"
                onPress={handleWriteReview}
                style={styles.reviewButton}
              >
                Write a Review
              </Button>
            )}

            {hiring.status !== 'COMPLETED' && (
              <Button
                mode="contained"
                onPress={() => handleUpdateStatus('COMPLETED')}
                style={styles.updateButton}
              >
                Mark as Completed
              </Button>
            )}

            {hiring.status === 'PENDING' && (
              <>
                <Button
                  mode="contained"
                  onPress={() => handleUpdateStatus('APPROVED')}
                  style={styles.updateButton}
                >
                  Approve Hiring
                </Button>
                <Button
                  mode="contained"
                  onPress={() => handleUpdateStatus('REJECTED')}
                  style={styles.updateButton}
                >
                  Reject Hiring
                </Button>
              </>
            )}
          </Card.Content>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F0F0',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  card: {
    margin: 10,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusTextContainer: {
    marginLeft: 10,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  statusValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 15,
  },
  housekeeperContainer: {
    marginTop: 10,
  },
  housekeeperName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  housekeeperDetail: {
    fontSize: 14,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  detailValue: {
    fontSize: 14,
  },
  infoText: {
    fontSize: 14,
    marginTop: 10,
    color: '#616161',
  },
  updateButton: {
    marginTop: 10,
  },
  reviewButton: {
    marginTop: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 18,
  },
  divider: {
    marginVertical: 10,
  },
});

export default HiringStatusScreen;
