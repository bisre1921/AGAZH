import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Card, Switch, Button, ActivityIndicator } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import api, { getHousekeeper, updateHousekeeper } from '../../api/api';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '@/src/navigation/type';

interface Profile {
    category: string;
    employment_type: string;
    experience: number;
    location: string;
    is_available: boolean;
    rating: number;
}

const HousekeeperDashboardScreen = () => {
  const { userInfo } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAvailable, setIsAvailable] = useState(true);
  const [stats, setStats] = useState({
    totalHirings: 0,
    pendingHirings: 0,
    completedHirings: 0,
    averageRating: 0,
  });

  type NavigationProp = StackNavigationProp<RootStackParamList, 'HousekeeperDashboardScreen'>;

  const navigation = useNavigation<NavigationProp>();

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await getHousekeeper(userInfo.user_id);
      setProfile(response.data);
      setIsAvailable(response.data.is_available);
      
    } catch (error) {
      console.error('Error fetching profile:', error);
      Alert.alert('Error', 'Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [userInfo.user_id]);

  const toggleAvailability = async () => {
    if (!profile) return;
  
    try {
      const updatedProfile = {
        ...profile,  // Ensure all required fields are included
        is_available: !isAvailable, // Toggle availability
      };
  
      await updateHousekeeper(userInfo.user_id, updatedProfile);
      setIsAvailable(!isAvailable);
      console.log("Availability status updated");
      Alert.alert(
        "Status Updated",
        `You are now ${!isAvailable ? "available" : "unavailable"} for new hirings`
      );
    } catch (error) {
      console.error("Error updating availability:", error);
      Alert.alert("Error", "Failed to update availability status");
    }
  };
  

  if (loading && !profile) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4A6572" />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Card style={styles.availabilityCard}>
          <Card.Content>
            <View style={styles.availabilityHeader}>
              <Text style={styles.availabilityTitle}>Availability Status</Text>
              <Switch
                value={isAvailable}
                onValueChange={toggleAvailability}
                color="#4CAF50"
              />
            </View>
            <Text style={styles.availabilityStatus}>
              You are currently{' '}
              <Text
                style={{
                  fontWeight: 'bold',
                  color: isAvailable ? '#4CAF50' : '#F44336',
                }}
              >
                {isAvailable ? 'AVAILABLE' : 'UNAVAILABLE'}
              </Text>{' '}
              for new hirings
            </Text>
          </Card.Content>
        </Card>

        <View style={styles.statsContainer}>
          <Card style={styles.statsCard}>
            <Card.Content>
              <Ionicons name="star" size={32} color="#F9AA33" style={styles.statsIcon} />
              <Text style={styles.statsValue}>{profile?.rating}</Text>
              <Text style={styles.statsLabel}>Average Rating</Text>
            </Card.Content>
          </Card>

        </View>


        <Card style={styles.profileSummaryCard}>
          <Card.Content>
            <Text style={styles.cardTitle}>Profile Summary</Text>
            
            <View style={styles.profileItem}>
              <Text style={styles.profileLabel}>Category:</Text>
              <Text style={styles.profileValue}>
                {profile?.category.replace('_', ' ')}
              </Text>
            </View>
            
            <View style={styles.profileItem}>
              <Text style={styles.profileLabel}>Employment Type:</Text>
              <Text style={styles.profileValue}>{profile?.employment_type}</Text>
            </View>
            
            <View style={styles.profileItem}>
              <Text style={styles.profileLabel}>Experience:</Text>
              <Text style={styles.profileValue}>{profile?.experience} years</Text>
            </View>
            
            <View style={styles.profileItem}>
              <Text style={styles.profileLabel}>Location:</Text>
              <Text style={styles.profileValue}>{profile?.location}</Text>
            </View>
            
            <Button
              mode="outlined"
              onPress={() => navigation.navigate("Profile")}
              style={styles.viewProfileButton}
              icon="account"
            >
              View Full Profile
            </Button>
          </Card.Content>
        </Card>

        <Card style={styles.tipsCard}>
          <Card.Content>
            <Text style={styles.cardTitle}>Tips to Get Hired</Text>
            
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
              <Text style={styles.tipText}>
                Keep your profile complete and up-to-date
              </Text>
            </View>
            
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
              <Text style={styles.tipText}>
                Add all your skills and certifications
              </Text>
            </View>
            
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
              <Text style={styles.tipText}>
                Maintain a high rating by providing excellent service
              </Text>
            </View>
            
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
              <Text style={styles.tipText}>
                Respond promptly to hiring requests
              </Text>
            </View>
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
  availabilityCard: {
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  availabilityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  availabilityTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#344955',
  },
  availabilityStatus: {
    fontSize: 14,
    color: '#4A6572',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statsCard: {
    flex: 1,
    marginHorizontal: 4,
    backgroundColor: '#FFFFFF',
  },
  statsIcon: {
    alignSelf: 'center',
    marginBottom: 8,
  },
  statsValue: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#344955',
  },
  statsLabel: {
    fontSize: 12,
    textAlign: 'center',
    color: '#4A6572',
  },
  profileSummaryCard: {
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#344955',
    marginBottom: 16,
  },
  profileItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  profileLabel: {
    width: 120,
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4A6572',
  },
  profileValue: {
    flex: 1,
    fontSize: 14,
    color: '#344955',
  },
  viewProfileButton: {
    marginTop: 8,
  },
  tipsCard: {
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  tipText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#4A6572',
  },
});

export default HousekeeperDashboardScreen;