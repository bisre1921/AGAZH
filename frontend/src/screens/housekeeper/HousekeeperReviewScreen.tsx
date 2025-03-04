import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, Alert } from 'react-native';
import { Text, Card, Divider, ActivityIndicator } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Rating } from 'react-native-ratings';
import { useAuth } from '../../contexts/AuthContext';
import { getHousekeeperReviews } from '../../api/api';

interface Review {
    id: string; 
    rating: number;
    comment?: string;
    created_at: string;
}
  

const HousekeeperReviewsScreen = () => {
  const { userInfo } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    averageRating: 0,
    totalReviews: 0,
    ratingCounts: {} as Record<number, number>,
  });

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await getHousekeeperReviews(userInfo.user_id);
      setReviews(response.data);
      
      const totalReviews = response.data.length;
      let sum = 0;
      const counts: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
      
      response.data.forEach((review: any) => {
        const rating = Math.floor(review.rating);
        counts[rating] = (counts[rating] || 0) + 1;
        sum += review.rating;
      });
  
      setStats({
        averageRating: totalReviews > 0 ? sum / totalReviews : 0,
        totalReviews,
        ratingCounts: counts,
      });
    } catch (error) {
      console.error('Error fetching reviews:', error);
      Alert.alert('Error', 'Failed to load reviews');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [userInfo.user_id]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchReviews();
  };

  const renderRatingBar = (rating: any, count: any) => {
    const percentage = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;
    
    return (
      <View style={styles.ratingBarContainer}>
        <Text style={styles.ratingBarLabel}>{rating}</Text>
        <View style={styles.ratingBarBackground}>
          <View
            style={[styles.ratingBarFill, { width: `${percentage}%` }]}
          />
        </View>
        <Text style={styles.ratingBarCount}>{count}</Text>
      </View>
    );
  };

  const renderReviewItem = ({ item }: {item: Review}) => (
    <Card style={styles.reviewCard}>
      <Card.Content>
        <View style={styles.reviewHeader}>
          <Rating
            readonly
            startingValue={item.rating}
            imageSize={16}
            style={styles.reviewRating}
          />
          <Text style={styles.reviewDate}>
            {new Date(item.created_at).toLocaleDateString()}
          </Text>
        </View>
        <Text style={styles.reviewComment}>
          {item.comment || 'No comment provided'}
        </Text>
      </Card.Content>
    </Card>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4A6572" />
        <Text style={styles.loadingText}>Loading reviews...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <FlatList
        data={reviews}
        renderItem={renderReviewItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshing={refreshing}
        onRefresh={onRefresh}
        ListHeaderComponent={
          <View>
            <Card style={styles.summaryCard}>
              <Card.Content>
                <View style={styles.ratingOverview}>
                  <View style={styles.averageRatingContainer}>
                    <Text style={styles.averageRating}>
                      {stats.averageRating.toFixed(1)}
                    </Text>
                    <Rating
                      readonly
                      startingValue={stats.averageRating}
                      imageSize={20}
                      style={styles.averageRatingStars}
                    />
                    <Text style={styles.totalReviews}>
                      {stats.totalReviews} {stats.totalReviews === 1 ? 'review' : 'reviews'}
                    </Text>
                  </View>
                  
                  <View style={styles.ratingBars}>
                    {renderRatingBar(5, stats.ratingCounts[5])}
                    {renderRatingBar(4, stats.ratingCounts[4])}
                    {renderRatingBar(3, stats.ratingCounts[3])}
                    {renderRatingBar(2, stats.ratingCounts[2])}
                    {renderRatingBar(1, stats.ratingCounts[1])}
                  </View>
                </View>
              </Card.Content>
            </Card>
            
            {reviews.length > 0 ? (
              <Text style={styles.reviewsTitle}>All Reviews</Text>
            ) : (
              <Card style={styles.emptyCard}>
                <Card.Content>
                  <Text style={styles.emptyText}>No reviews yet</Text>
                  <Text style={styles.emptySubtext}>
                    Reviews from employers will appear here
                  </Text>
                </Card.Content>
              </Card>
            )}
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
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
  listContent: {
    padding: 16,
  },
  summaryCard: {
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  ratingOverview: {
    flexDirection: 'row',
  },
  averageRatingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: '#E0E0E0',
    paddingRight: 16,
  },
  averageRating: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#344955',
  },
  averageRatingStars: {
    marginVertical: 8,
  },
  totalReviews: {
    fontSize: 14,
    color: '#4A6572',
  },
  ratingBars: {
    flex: 2,
    paddingLeft: 16,
  },
  ratingBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingBarLabel: {
    width: 16,
    fontSize: 12,
    color: '#4A6572',
    marginRight: 8,
  },
  ratingBarBackground: {
    flex: 1,
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  ratingBarFill: {
    height: '100%',
    backgroundColor: '#F9AA33',
  },
  ratingBarCount: {
    width: 24,
    fontSize: 12,
    color: '#4A6572',
    textAlign: 'right',
    marginLeft: 8,
  },
  reviewsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#344955',
    marginBottom: 16,
  },
  reviewCard: {
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
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
  emptyCard: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#FFFFFF',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#344955',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#4A6572',
    textAlign: 'center',
  },
});

export default HousekeeperReviewsScreen;