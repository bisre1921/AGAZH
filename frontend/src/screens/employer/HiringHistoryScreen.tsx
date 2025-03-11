import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { Text, Card, ActivityIndicator, Chip } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import api, { getHiringHistory } from '../../api/api';

interface Hiring {
    id: string;
    housekeeperName: string;
    start_date: string;
    salary_offer: number;
    created_at: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED';
}

const HiringHistoryScreen = ({ navigation }: {navigation: any}) => {
  const { userInfo } = useAuth();
  const [hirings, setHirings] = useState<Hiring[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchHiringHistory = async () => {
    try {
      setLoading(true);
      // This endpoint would need to be added to your backend
      const response = await getHiringHistory(userInfo?.user_id)
      setHirings(response.data);
    } catch (error) {
      console.error('Error fetching hiring history:', error);
      Alert.alert('Error', 'Failed to load hiring history');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchHiringHistory();
  }, [userInfo?.user_id]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchHiringHistory();
  };

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

  const renderHiringItem = ({ item }: {item: Hiring}) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('HiringStatus', { hiringId: item.id })}
    >
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <Text style={styles.housekeeperName}>{item.housekeeperName}</Text>
            <Chip
              style={[
                styles.statusChip,
                { backgroundColor: getStatusColor(item.status) },
              ]}
              textStyle={styles.statusChipText}
            >
              {item.status}
            </Chip>
          </View>
          
          <View style={styles.detailRow}>
            <Ionicons name="calendar-outline" size={16} color="#4A6572" />
            <Text style={styles.detailText}>
              Start Date: {new Date(item.start_date).toLocaleDateString()}
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <Ionicons name="cash-outline" size={16} color="#4A6572" />
            <Text style={styles.detailText}>
                 Salary: ${item.salary_offer?.toFixed(2) || 'N/A'}
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <Ionicons name="time-outline" size={16} color="#4A6572" />
            <Text style={styles.detailText}>
              Requested: {new Date(item.created_at).toLocaleDateString()}
            </Text>
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4A6572" />
        <Text style={styles.loadingText}>Loading hiring history...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
      <FlatList
        data={hirings}
        renderItem={renderHiringItem}
        keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
        contentContainerStyle={styles.listContent}
        refreshing={refreshing}
        onRefresh={onRefresh}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={64} color="#4A6572" />
            <Text style={styles.emptyText}>No hiring history found</Text>
            <Text style={styles.emptySubtext}>
              Your hiring requests will appear here
            </Text>
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
  card: {
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  housekeeperName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#344955',
  },
  statusChip: {
    height: 28,
  },
  statusChipText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    marginLeft: 8,
    color: '#4A6572',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 64,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#344955',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#4A6572',
    marginTop: 8,
  },
});

export default HiringHistoryScreen;