import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Card, Button, ActivityIndicator, Divider } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getHiringStatus, getHousekeeper } from '../../api/api';

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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4A6572" />
        <Text style={styles.loadingText}>Loading hiring details...</Text>
      </View>
    );
  }

  // Added a check to ensure hiring is not null before trying to access its properties.
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
          </Card.Content>
        </Card>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    color: '#4A6572',
  },
  card: {
    backgroundColor: '#FFFFFF',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusTextContainer: {
    marginLeft: 16,
  },
  statusTitle: {
    fontSize: 14,
    color: '#4A6572',
  },
  statusValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  divider: {
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#344955',
    marginBottom: 12,
  },
  housekeeperContainer: {
    marginBottom: 8,
  },
  housekeeperName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#344955',
    marginBottom: 4,
  },
  housekeeperDetail: {
    fontSize: 14,
    color: '#4A6572',
    marginBottom: 4,
  },
  detailRow: {
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4A6572',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    color: '#344955',
  },
  infoText: {
    fontSize: 14,
    color: '#4A6572',
    fontStyle: 'italic',
    marginBottom: 16,
  },
  reviewButton: {
    backgroundColor: '#F9AA33',
  },
});

export default HiringStatusScreen;
