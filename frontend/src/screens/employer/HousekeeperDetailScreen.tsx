import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { Text, Button, Card, Chip, Divider, Avatar } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getHousekeeperReviews } from '../../api/api';
import { Rating } from 'react-native-ratings';

interface Review {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
}

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

const HousekeeperDetailScreen = ({ route, navigation }: { route: any; navigation: any }) => {
  const { housekeeper }: { housekeeper: Housekeeper } = route.params;
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await getHousekeeperReviews(housekeeper.id);
        setReviews(response?.data || []);
      } catch (error) {
        console.error('Error fetching reviews:', error);
        Alert.alert('Error', 'Failed to load reviews');
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [housekeeper.id]);

  const handleHire = () => {
    navigation.navigate('HireHousekeeper', { housekeeper });
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Card style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <Avatar.Image
              size={100}
              source={{ uri: housekeeper.photo_url || 'https://via.placeholder.com/150' }}
            />
            <View style={styles.profileInfo}>
              <Text style={styles.name}>{housekeeper.name}</Text>
              <View style={styles.ratingContainer}>
                <Rating readonly startingValue={housekeeper.rating ?? 0} imageSize={20} />
                <Text style={styles.ratingText}>
                  {housekeeper.rating?.toFixed(1) || '0.0'} ({reviews.length} reviews)
                </Text>
              </View>
              <View style={styles.tagsContainer}>
                <Chip style={styles.categoryChip}>{housekeeper.category.replace('_', ' ')}</Chip>
                <Chip style={styles.typeChip}>{housekeeper.employment_type}</Chip>
              </View>
            </View>
          </View>

          <Divider style={styles.divider} />

          <View style={styles.detailsContainer}>
            <View style={styles.detailRow}>
              <Ionicons name="location-outline" size={20} color="#4A6572" />
              <Text style={styles.detailText}>{housekeeper.location}</Text>
            </View>
            <View style={styles.detailRow}>
              <Ionicons name="call-outline" size={20} color="#4A6572" />
              <Text style={styles.detailText}>{housekeeper.phone_number}</Text>
            </View>
            <View style={styles.detailRow}>
              <Ionicons name="briefcase-outline" size={20} color="#4A6572" />
              <Text style={styles.detailText}>{housekeeper.experience} years experience</Text>
            </View>
            <View style={styles.detailRow}>
              <Ionicons name="person-outline" size={20} color="#4A6572" />
              <Text style={styles.detailText}>{housekeeper.age} years old</Text>
            </View>
          </View>

          <Divider style={styles.divider} />

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Skills</Text>
            <View style={styles.skillsContainer}>
              {housekeeper.skills?.length ? (
                housekeeper.skills.map((skill, index) => (
                  <Chip key={index} style={styles.skillChip}>
                    {skill}
                  </Chip>
                ))
              ) : (
                <Text style={styles.noDataText}>No skills listed</Text>
              )}
            </View>
          </View>

          <Divider style={styles.divider} />

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Certifications</Text>
            <View style={styles.certificationsContainer}>
              {housekeeper.certifications?.length ? (
                housekeeper.certifications.map((cert, index) => (
                  <View key={index} style={styles.certificationItem}>
                    <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                    <Text style={styles.certificationText}>{cert}</Text>
                  </View>
                ))
              ) : (
                <Text style={styles.noDataText}>No certifications listed</Text>
              )}
            </View>
          </View>

          <Divider style={styles.divider} />

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Reviews</Text>
            {loading ? (
              <ActivityIndicator size="small" color="#4A6572" />
            ) : reviews.length > 0 ? (
              reviews.map((review) => (
                <View key={review.id} style={styles.reviewItem}>
                  <View style={styles.reviewHeader}>
                    <Rating readonly startingValue={review.rating} imageSize={16} />
                    <Text style={styles.reviewDate}>
                      {new Date(review.created_at).toLocaleDateString()}
                    </Text>
                  </View>
                  <Text style={styles.reviewComment}>{review.comment}</Text>
                  <Divider style={styles.reviewDivider} />
                </View>
              ))
            ) : (
              <Text style={styles.noDataText}>No reviews yet</Text>
            )}
          </View>
        </Card>

        <Button mode="contained" onPress={handleHire} style={styles.hireButton}>
          Hire This Housekeeper
        </Button>
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
  profileCard: {
    padding: 16,
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  profileHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  profileInfo: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'center',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#344955',
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  rating: {
    alignItems: 'flex-start',
  },
  ratingText: {
    marginLeft: 8,
    color: '#4A6572',
  },
  tagsContainer: {
    flexDirection: 'row',
  },
  categoryChip: {
    marginRight: 8,
    backgroundColor: '#E0E0E0',
  },
  typeChip: {
    backgroundColor: '#E0E0E0',
  },
  divider: {
    marginVertical: 16,
  },
  detailsContainer: {
    marginBottom: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#4A6572',
  },
  section: {
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#344955',
    marginBottom: 12,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  skillChip: {
    margin: 4,
    backgroundColor: '#F9AA33',
  },
  certificationsContainer: {
    marginTop: 8,
  },
  certificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  certificationText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#4A6572',
  },
  reviewItem: {
    marginBottom: 16,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reviewRating: {
    alignItems: 'flex-start',
  },
  reviewDate: {
    color: '#9E9E9E',
    fontSize: 12,
  },
  reviewComment: {
    color: '#4A6572',
    fontSize: 14,
    lineHeight: 20,
  },
  reviewDivider: {
    marginVertical: 12,
  },
  noDataText: {
    color: '#9E9E9E',
    fontStyle: 'italic',
  },
  hireButton: {
    backgroundColor: '#F9AA33',
    borderRadius: 8,
  },
  hireButtonContent: {
    height: 56,
  },
});

export default HousekeeperDetailScreen;