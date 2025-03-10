import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, Image } from 'react-native';
import { Text, Card, Button, TextInput, Divider, Chip, ActivityIndicator } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import DropDownPicker from 'react-native-dropdown-picker';
import { useAuth } from '../../contexts/AuthContext';
import api, { getHousekeeper } from '../../api/api';

interface HousekeeperProfile {
    name: string;
    email: string;
    phone_number: string;
    category: string;
    employment_type: string;
    location: string;
    age: number;
    experience: number;
    skills: string[];
    certifications: string[];
    created_at: string;
}

const HousekeeperProfileScreen = () => {
  const { userInfo, logout } = useAuth();
  const [profile, setProfile] = useState<HousekeeperProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<{
    name: string;
    age: string;
    experience: string;
    location: string;
    phoneNumber: string;
    skills: string[];  
    certifications: string[]; 
    photoURL: string;
  }>({
    name: '',
    age: '',
    experience: '',
    location: '',
    phoneNumber: '',
    skills: [],  
    certifications: [], 
    photoURL: '',
  });
  
  // Dropdown state
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [categoryValue, setCategoryValue] = useState(null);
  const [categories] = useState([
    { label: 'Normal', value: 'NORMAL' },
    { label: 'Child Taker', value: 'CHILD_TAKER' },
    { label: 'Cleaner', value: 'CLEANER' },
  ]);

  const [typeOpen, setTypeOpen] = useState(false);
  const [typeValue, setTypeValue] = useState(null);
  const [types] = useState([
    { label: 'Temporary', value: 'TEMPORARY' },
    { label: 'Permanent', value: 'PERMANENT' },
  ]);

  // Skills and certifications management
  const [currentSkill, setCurrentSkill] = useState('');
  const [currentCertification, setCurrentCertification] = useState('');

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await getHousekeeper(userInfo.user_id);
      setProfile(response.data);
      
      setFormData({
        name: response.data.name,
        age: response.data.age.toString(),
        experience: response.data.experience.toString(),
        location: response.data.location,
        phoneNumber: response.data.phone_number,
        skills: response.data.skills || [],
        certifications: response.data.certifications || [],
        photoURL: response.data.photo_url,
      });
      
      setCategoryValue(response.data.category);
      setTypeValue(response.data.employment_type);
    } catch (error) {
      console.error('Error fetching profile:', error);
      Alert.alert('Error', 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [userInfo.user_id]);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'We need camera roll permission to upload images');
      return;
    }
    
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    
    if (!result.canceled) {
      // In a real app, you would upload this image to your server
      // and get back a URL to store in the profile
      setFormData({ ...formData, photoURL: result.assets[0].uri });
    }
  };

  const addSkill = () => {
    if (currentSkill.trim() && !formData.skills.includes(currentSkill.trim())) {
      setFormData({
        ...formData,
        skills: [...formData.skills, currentSkill.trim()],
      });
      setCurrentSkill('');
    }
  };

  const removeSkill = (skill: any) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter((s) => s !== skill),
    });
  };

  const addCertification = () => {
    if (
      currentCertification.trim() &&
      !formData.certifications.includes(currentCertification.trim())
    ) {
      setFormData({
        ...formData,
        certifications: [...formData.certifications, currentCertification.trim()],
      });
      setCurrentCertification('');
    }
  };

  const removeCertification = (cert: any) => {
    setFormData({
      ...formData,
      certifications: formData.certifications.filter((c) => c !== cert),
    });
  };

  const handleUpdateProfile = async () => {
    try {
      setLoading(true);
      
      await api.put(`/housekeepers/${userInfo.user_id}`, {
        name: formData.name,
        age: parseInt(formData.age),
        experience: parseInt(formData.experience),
        category: categoryValue,
        employment_type: typeValue,
        location: formData.location,
        phone_number: formData.phoneNumber,
        skills: formData.skills,
        certifications: formData.certifications,
        photo_url: formData.photoURL,
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

  const handleLogout = () => {
    Alert.alert(
      'Confirm Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', onPress: logout },
      ]
    );
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
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.headerContainer}>
              {formData.photoURL ? (
                <Image
                  source={{ uri: formData.photoURL }}
                  style={styles.profileImage}
                />
              ) : (
                <View style={styles.avatarContainer}>
                  <Text style={styles.avatarText}>
                    {profile?.name?.charAt(0) || 'H'}
                  </Text>
                </View>
              )}
              <View style={styles.headerTextContainer}>
                <Text style={styles.name}>{profile?.name}</Text>
                <Text style={styles.email}>{profile?.email}</Text>
                <View style={styles.badgeContainer}>
                  <Chip style={styles.categoryChip}>
                    {profile?.category.replace('_', ' ')}
                  </Chip>
                  <Chip style={styles.typeChip}>{profile?.employment_type}</Chip>
                </View>
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
                  label="Age"
                  value={formData.age}
                  onChangeText={(text) => setFormData({ ...formData, age: text })}
                  style={styles.input}
                  keyboardType="numeric"
                />
                
                <TextInput
                  label="Experience (years)"
                  value={formData.experience}
                  onChangeText={(text) => setFormData({ ...formData, experience: text })}
                  style={styles.input}
                  keyboardType="numeric"
                />
                
                <View style={styles.dropdownContainer}>
                  <Text style={styles.dropdownLabel}>Category</Text>
                  <DropDownPicker
                    open={categoryOpen}
                    value={categoryValue}
                    items={categories}
                    setOpen={setCategoryOpen}
                    setValue={setCategoryValue}
                    style={styles.dropdown}
                    dropDownContainerStyle={styles.dropdownList}
                    zIndex={3000}
                    zIndexInverse={1000}
                  />
                </View>
                
                <View style={styles.dropdownContainer}>
                  <Text style={styles.dropdownLabel}>Employment Type</Text>
                  <DropDownPicker
                    open={typeOpen}
                    value={typeValue}
                    items={types}
                    setOpen={setTypeOpen}
                    setValue={setTypeValue}
                    style={styles.dropdown}
                    dropDownContainerStyle={styles.dropdownList}
                    zIndex={2000}
                    zIndexInverse={2000}
                  />
                </View>
                
                <TextInput
                  label="Location"
                  value={formData.location}
                  onChangeText={(text) => setFormData({ ...formData, location: text })}
                  style={styles.input}
                />
                
                <TextInput
                  label="Phone Number"
                  value={formData.phoneNumber}
                  onChangeText={(text) => setFormData({ ...formData, phoneNumber: text })}
                  style={styles.input}
                  keyboardType="phone-pad"
                />
                
                <View style={styles.skillsContainer}>
                  <Text style={styles.sectionTitle}>Skills</Text>
                  <View style={styles.skillInputContainer}>
                    <TextInput
                      label="Add a skill"
                      value={currentSkill}
                      onChangeText={setCurrentSkill}
                      style={styles.skillInput}
                    />
                    <Button mode="contained" onPress={addSkill} style={styles.addButton}>
                      Add
                    </Button>
                  </View>
                  <View style={styles.chipContainer}>
                    {formData.skills.map((skill, index) => (
                      <Chip
                        key={index}
                        onClose={() => removeSkill(skill)}
                        style={styles.chip}
                      >
                        {skill}
                      </Chip>
                    ))}
                  </View>
                </View>
                
                <View style={styles.skillsContainer}>
                  <Text style={styles.sectionTitle}>Certifications</Text>
                  <View style={styles.skillInputContainer}>
                    <TextInput
                      label="Add a certification"
                      value={currentCertification}
                      onChangeText={setCurrentCertification}
                      style={styles.skillInput}
                    />
                    <Button mode="contained" onPress={addCertification} style={styles.addButton}>
                      Add
                    </Button>
                  </View>
                  <View style={styles.chipContainer}>
                    {formData.certifications.map((cert, index) => (
                      <Chip
                        key={index}
                        onClose={() => removeCertification(cert)}
                        style={styles.chip}
                      >
                        {cert}
                      </Chip>
                    ))}
                  </View>
                </View>
                
                <View style={styles.photoContainer}>
                  <Text style={styles.sectionTitle}>Profile Photo</Text>
                  <Button
                    mode="outlined"
                    onPress={pickImage}
                    style={styles.photoButton}
                    icon="camera"
                  >
                    {formData.photoURL ? 'Change Photo' : 'Select Photo'}
                  </Button>
                </View>
                
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
                <View style={styles.infoSection}>
                  <View style={styles.infoRow}>
                    <Ionicons name="person-outline" size={20} color="#4A6572" />
                    <View style={styles.infoTextContainer}>
                      <Text style={styles.infoLabel}>Age</Text>
                      <Text style={styles.infoValue}>{profile?.age} years</Text>
                    </View>
                  </View>
                  
                  <View style={styles.infoRow}>
                    <Ionicons name="briefcase-outline" size={20} color="#4A6572" />
                    <View style={styles.infoTextContainer}>
                      <Text style={styles.infoLabel}>Experience</Text>
                      <Text style={styles.infoValue}>{profile?.experience} years</Text>
                    </View>
                  </View>
                  
                  <View style={styles.infoRow}>
                    <Ionicons name="location-outline" size={20} color="#4A6572" />
                    <View style={styles.infoTextContainer}>
                      <Text style={styles.infoLabel}>Location</Text>
                      <Text style={styles.infoValue}>{profile?.location}</Text>
                    </View>
                  </View>
                  
                  <View style={styles.infoRow}>
                    <Ionicons name="call-outline" size={20} color="#4A6572" />
                    <View style={styles.infoTextContainer}>
                      <Text style={styles.infoLabel}>Phone Number</Text>
                      <Text style={styles.infoValue}>{profile?.phone_number}</Text>
                    </View>
                  </View>
                </View>
                
                <Divider style={styles.divider} />
                
                <Text style={styles.sectionTitle}>Skills</Text>
                <View style={styles.chipContainer}>
                  {profile?.skills && profile.skills.length > 0 ? (
                    profile.skills.map((skill, index) => (
                      <Chip key={index} style={styles.skillChip}>
                        {skill}
                      </Chip>
                    ))
                  ) : (
                    <Text style={styles.noDataText}>No skills listed</Text>
                  )}
                </View>
                
                <Text style={styles.sectionTitle}>Certifications</Text>
                <View style={styles.chipContainer}>
                  {profile?.certifications && profile.certifications.length > 0 ? (
                    profile.certifications.map((cert, index) => (
                      <Chip key={index} style={styles.certChip}>
                        {cert}
                      </Chip>
                    ))
                  ) : (
                    <Text style={styles.noDataText}>No certifications listed</Text>
                  )}
                </View>
                
                <Button
                  mode="contained"
                  onPress={() => setEditing(true)}
                  style={styles.editButton}
                  icon="pencil"
                >
                  Edit Profile
                </Button>
              </View>
            )}
          </Card.Content>
        </Card>
        
        <Button
          mode="outlined"
          onPress={handleLogout}
          style={styles.logoutButton}
          icon="logout"
        >
          Logout
        </Button>
        
        <Text style={styles.versionText}>AGAZH v1.0.0</Text>
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
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#4A6572',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerTextContainer: {
    marginLeft: 16,
    flex: 1,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#344955',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: '#4A6572',
    marginBottom: 8,
  },
  badgeContainer: {
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
  infoSection: {
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  infoTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#9E9E9E',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    color: '#344955',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#344955',
    marginBottom: 12,
    marginTop: 8,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  skillChip: {
    margin: 4,
    backgroundColor: '#F9AA33',
  },
  certChip: {
    margin: 4,
    backgroundColor: '#4A6572',
  },
  noDataText: {
    color: '#9E9E9E',
    fontStyle: 'italic',
    marginBottom: 16,
  },
  form: {
    marginBottom: 16,
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
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
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    flex: 1,
    marginRight: 8,
  },
  saveButton: {
    flex: 1,
    marginLeft: 8,
    backgroundColor: '#4A6572',
  },
  editButton: {
    backgroundColor: '#4A6572',
    marginTop: 8,
  },
  logoutButton: {
    marginBottom: 24,
    borderColor: '#F44336',
    borderWidth: 1,
  },
  versionText: {
    textAlign: 'center',
    color: '#9E9E9E',
    marginBottom: 16,
  },
});

export default HousekeeperProfileScreen;