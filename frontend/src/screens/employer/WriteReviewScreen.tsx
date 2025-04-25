import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, TextInput, Button } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Rating } from 'react-native-ratings';
import { createReview } from '../../api/api';
import { useAuth } from '../../contexts/AuthContext';

const WriteReviewScreen = ({ route, navigation }: { route: any; navigation: any }) => {
  const { housekeeperId, housekeeperName } = route.params;
  const { userInfo } = useAuth();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmitReview = async () => {
    if (rating === 0) {
      Alert.alert('Error', 'Please select a rating');
      return;
    }
  
    try {
      setLoading(true);
  
      const reviewData = {
        employer_id: userInfo.user_id,
        housekeeper_id: housekeeperId,
        rating: rating,
        comment: comment,
      };
  
      const response = await createReview(reviewData);
      console.log('Review submitted successfully:', response);
  
      navigation.goBack();
      Alert.alert('Review Submitted', 'Thank you for your feedback!', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error: any) {
      console.error('Review submission error:', error);
      Alert.alert(
        'Submission Failed',
        error?.response?.data?.error || error?.message || 'Failed to submit review. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Write a Review</Text>
        <Text style={styles.subtitle}>for {housekeeperName}</Text>

        <View style={styles.ratingContainer}>
          <Text style={styles.ratingLabel}>How would you rate your experience?</Text>
          <Rating
            showRating
            onFinishRating={setRating}
            style={styles.rating}
            imageSize={40}
          />
        </View>

        <TextInput
          label="Your Review (Optional)"
          value={comment}
          onChangeText={setComment}
          style={styles.input}
          multiline
          numberOfLines={6}
          placeholder="Share your experience with this housekeeper..."
        />

        <Button
          mode="contained"
          onPress={handleSubmitReview}
          style={styles.submitButton}
          loading={loading}
          disabled={loading || rating === 0}
        >
          Submit Review
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#344955',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#4A6572',
    marginBottom: 24,
  },
  ratingContainer: {
    marginBottom: 24,
  },
  ratingLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#344955',
    marginBottom: 12,
  },
  rating: {
    paddingVertical: 10,
  },
  input: {
    backgroundColor: '#FFFFFF',
    marginBottom: 24,
  },
  submitButton: {
    backgroundColor: '#F9AA33',
  },
});

export default WriteReviewScreen;
