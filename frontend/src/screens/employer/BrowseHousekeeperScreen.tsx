import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, RefreshControl, ScrollView } from 'react-native';
import { Text, Card, Searchbar, Chip, ActivityIndicator } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getHousekeepers } from '../../api/api';
import { Ionicons } from '@expo/vector-icons';

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
    certifications: string[];  
    phone_number: string;    
    reviews: string[];       
    is_available: boolean;    
}

const BrowseHousekeepersScreen = ({ navigation }: {navigation: any}) => {
  const [housekeepers, setHousekeepers] = useState<Housekeeper[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<{
    category: string | null;
    employment_type: string | null;
    location: string | null;
  }>({
    category: null,
    employment_type: null,
    location: null,
  });

  const fetchHousekeepers = async () => {
    try {
      setLoading(true);
      const activeFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, v]) => v !== null)
      );
      const response = await getHousekeepers(activeFilters);
      setHousekeepers(response.data);
    } catch (error) {
      console.error('Error fetching housekeepers:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchHousekeepers();
  }, [filters]);

  const onRefresh = () => {
    setRefreshing(true);
    setSearchQuery('');
    fetchHousekeepers();
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const toggleCategoryFilter = (category: string) => {
    setFilters((prev) => ({
      ...prev,
      category: prev.category === category ? null : category,
    }));
  };

  const toggleEmploymentTypeFilter = (type: string) => {
    setFilters((prev) => ({
      ...prev,
      employment_type: prev.employment_type === type ? null : type,
    }));
  };

  const filteredHousekeepers = housekeepers.filter((housekeeper) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        housekeeper.name.toLowerCase().includes(query) ||
        housekeeper.location.toLowerCase().includes(query) ||
        housekeeper.skills?.some(skill => skill.toLowerCase().includes(query))
      );
    }
    return true;
  });

  const renderHousekeeperItem = ({ item }: { item: Housekeeper }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('HousekeeperDetail', { housekeeper: item })}
    >
      <Card style={styles.card}>
        <Card.Cover source={{ uri: item.photo_url || 'https://via.placeholder.com/150' }} />
        <Card.Content style={styles.cardContent}>
          <View style={styles.ratingContainer}>
            <Text style={styles.name}>{item.name}</Text>
            <View style={styles.rating}>
              <Ionicons name="star" size={16} color="#F9AA33" />
              <Text style={styles.ratingText}>{item.rating ? item.rating.toFixed(1) : 'N/A'}</Text>
            </View>
          </View>
          
          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={16} color="#4A6572" />
            <Text style={styles.infoText}>{item.location}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Ionicons name="briefcase-outline" size={16} color="#4A6572" />
            <Text style={styles.infoText}>{item.experience} years experience</Text>
          </View>
          
          <View style={styles.tagsContainer}>
            <Chip style={styles.categoryChip}>{item.category.replace('_', ' ')}</Chip>
            <Chip style={styles.typeChip}>{item.employment_type}</Chip>
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Searchbar
        placeholder="Search by name, location, or skills"
        onChangeText={handleSearch}
        value={searchQuery}
        style={styles.searchBar}
      />

      <View style={styles.filtersContainer}>
        <Text style={styles.filtersTitle}>Filters:</Text>
        <View style={styles.filterChips}>
          <Text style={styles.filterLabel}>Category:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {['NORMAL', 'CHILD_TAKER', 'CLEANER'].map((category) => (
              <Chip
                key={category}
                mode={filters.category === category ? 'outlined' : 'flat'}
                onPress={() => toggleCategoryFilter(category)}
                style={styles.filterChip}
              >
                {category.replace('_', ' ')}
              </Chip>
            ))}
          </ScrollView>
        </View>

        <View style={styles.filterChips}>
          <Text style={styles.filterLabel}>Type:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {['TEMPORARY', 'PERMANENT'].map((type) => (
              <Chip
                key={type}
                mode={filters.employment_type === type ? 'outlined' : 'flat'}
                onPress={() => toggleEmploymentTypeFilter(type)}
                style={styles.filterChip}
              >
                {type}
              </Chip>
            ))}
          </ScrollView>
        </View>
      </View>

      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4A6572" />
        </View>
      ) : (
        <FlatList
          data={filteredHousekeepers}
          renderItem={renderHousekeeperItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="search-outline" size={64} color="#4A6572" />
              <Text style={styles.emptyText}>No housekeepers found</Text>
              <Text style={styles.emptySubtext}>Try adjusting your filters</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};



const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  searchBar: {
    margin: 16,
    backgroundColor: '#FFFFFF',
  },
  filtersContainer: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  filtersTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#344955',
  },
  filterChips: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  filterLabel: {
    marginRight: 8,
    color: '#4A6572',
  },
  filterChip: {
    marginRight: 8,
    backgroundColor: '#E0E0E0',
  },
  listContent: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  cardContent: {
    paddingTop: 16,
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#344955',
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    marginLeft: 4,
    color: '#4A6572',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  infoText: {
    marginLeft: 8,
    color: '#4A6572',
  },
  tagsContainer: {
    flexDirection: 'row',
    marginTop: 8,
  },
  categoryChip: {
    marginRight: 8,
    backgroundColor: '#E0E0E0',
  },
  typeChip: {
    backgroundColor: '#E0E0E0',
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    alignItems: 'center',
  },
  skillChip: {
    marginRight: 8,
    marginBottom: 4,
    backgroundColor: '#F9AA33',
  },
  skillChipText: {
    color: '#FFFFFF',
  },
  moreSkills: {
    color: '#4A6572',
    fontSize: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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

export default BrowseHousekeepersScreen;