import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Card, Button, TextInput, Divider, ActivityIndicator } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import api, { getEmployer } from '../../api/api';

interface EmployerProfile {
    name: string;
    email: string;
    address: string;
    phone_number: string;
    family_size: number;
    created_at: string;
}

const EmployerProfileScreen = () => {
  const { userInfo, logout } = useAuth();
  const [profile, setProfile] = useState<EmployerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phoneNumber: '',
    familySize: '',
  });

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await getEmployer(userInfo.user_id)
      setProfile(response.data);
      setFormData({
        name: response.data.name || '',
        address: response.data.address || '',
        phoneNumber: response.data.phone_number || '',
        familySize: response.data.family_size ? response.data.family_size.toString() : '',
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      Alert.alert('Error', 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!userInfo?.user_id) return;
    fetchProfile();
  }, [userInfo?.user_id]);

  const handleUpdateProfile = async () => {
    try {
      setLoading(true);
      await api.put(`/employers/${userInfo.user_id}`, {
        name: formData.name,
        address: formData.address,
        phone_number: formData.phoneNumber,
        family_size: parseInt(formData.familySize) || 0,
      });
      setEditing(false);
      fetchProfile();
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !profile) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4A6572" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.headerContainer}>
                <View style={styles.avatarContainer}>
                    <Text style={styles.avatarText}>
                    {profile?.name?.charAt(0) || 'U'}
                    </Text>
                </View>
                <View style={styles.headerTextContainer}>
                    <Text style={styles.name}>{profile?.name}</Text>
                    <Text style={styles.email}>{profile?.email}</Text>
                </View>
            </View>
            <Divider style={styles.divider} />
            {editing ? (
              <View style={styles.form}>
                <TextInput
                  label="Full Name"
                  value={formData.name}
                  onChangeText={(text) => setFormData({ ...formData, name: text })}
                  style={styles.input}
                />
                
                <TextInput
                  label="Address"
                  value={formData.address}
                  onChangeText={(text) => setFormData({ ...formData, address: text })}
                  style={styles.input}
                />
                
                <TextInput
                  label="Phone Number"
                  value={formData.phoneNumber}
                  onChangeText={(text) => setFormData({ ...formData, phoneNumber: text })}
                  style={styles.input}
                  keyboardType="phone-pad"
                />
                
                <TextInput
                  label="Family Size"
                  value={formData.familySize}
                  onChangeText={(text) => setFormData({ ...formData, familySize: text })}
                  style={styles.input}
                  keyboardType="numeric"
                />
                <View style={styles.buttonContainer}>
                  <Button
                    mode="outlined"
                    onPress={() => setEditing(false)}
                    style={styles.cancelButton}
                  >
                    Cancel
                  </Button>
                  <Button
                    mode="contained"
                    onPress={handleUpdateProfile}
                    style={styles.saveButton}
                    loading={loading}
                  >
                    Save
                  </Button>

                </View>
              </View>
            ) : (
              <View>
                <View style={styles.infoRow}>
                    <Ionicons name="location-outline" size={20} color="#4A6572" />
                    <View style={styles.infoTextContainer}>
                      <Text style={styles.infoLabel}>Address</Text>
                      <Text style={styles.infoValue}>{profile?.address}</Text>
                    </View>
                </View>

                <View style={styles.infoRow}>
                    <Ionicons name="call-outline" size={20} color="#4A6572" />
                    <View style={styles.infoTextContainer}>
                      <Text style={styles.infoLabel}>Phone Number</Text>
                      <Text style={styles.infoValue}>{profile?.phone_number || 'N/A'}</Text>
                    </View>
                </View>

                <View style={styles.infoRow}>
                    <Ionicons name="people-outline" size={20} color="#4A6572" />
                    <View style={styles.infoTextContainer}>
                      <Text style={styles.infoLabel}>Family Size</Text>
                      <Text style={styles.infoValue}>{profile?.family_size || 'N/A'}</Text>
                    </View>
                </View>

                <View style={styles.infoRow}>
                    <Ionicons name="calendar-outline" size={20} color="#4A6572" />
                    <View style={styles.infoTextContainer}>
                      <Text style={styles.infoLabel}>Member Since</Text>
                      <Text style={styles.infoValue}>
                        {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'N/A'}
                      </Text>
                    </View>
                </View>

                <Button 
                    mode="contained" 
                    onPress={() => setEditing(true)}
                    style={styles.editButton}
                >
                    Edit Profile
                </Button>
              </View>
            )}
          </Card.Content>
        </Card>

        <Button 
            mode="outlined" 
            onPress={logout} 
            icon="logout"
        >
                Logout
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        backgroundColor: '#F5F5F5' 
    },
    scrollContent: { 
        padding: 16 
    },
    loadingContainer: { 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center' 
    },
    loadingText: { 
        marginTop: 16, 
        color: '#4A6572' 
    },
    card: { 
        marginBottom: 16, 
        backgroundColor: '#FFFFFF', 
        padding: 16, 
        borderRadius: 8 
    },
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16
    },
    avatarContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#4A6572',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12
    },
    avatarText: {
        color: '#FFFFFF',
        fontSize: 20,
        fontWeight: 'bold'
    },
    headerTextContainer: {
        flex: 1
    },
    name: { 
        fontSize: 22, 
        fontWeight: 'bold', 
        marginBottom: 4 
    },
    email: { 
        fontSize: 16, 
        color: '#4A6572', 
        marginBottom: 16 
    },
    divider: { 
        marginVertical: 12 
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12
    },
    infoTextContainer: {
        marginLeft: 8
    },
    infoLabel: {
        fontSize: 14,
        color: '#4A6572'
    },
    infoValue: {
        fontSize: 16,
        fontWeight: 'bold'
    },
    input: { 
        marginBottom: 12 
    },
    form: {
        marginTop: 12
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 12
    },
    cancelButton: {
        flex: 1,
        marginRight: 8
    },
    saveButton: {
        flex: 1
    },
    editButton: {
        marginTop: 16
    }
});


export default EmployerProfileScreen;
