import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Platform } from 'react-native';
import { Text, Card, Searchbar, ActivityIndicator, IconButton } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getHousekeepers } from '../../api/api';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';

interface Housekeeper {
    id: string;
    name: string;
    email: string;
    location: string;
    experience: number;
    category: 'NORMAL' | 'CHILD_CARE' | 'CLEANING';
    employment_type: 'LIVE_OUT' | 'LIVE_IN';
    skills?: string[];
    photo_url?: string;
    rating?: number;
    age: number;
    certifications: string[];
    phone_number: string;
    reviews: string[];
    is_available: boolean;
}

interface Filters {
    category: 'NORMAL' | 'CHILD_CARE' | 'CLEANING' | null;
    employment_type: 'LIVE_OUT' | 'LIVE_IN' | null;
    location: string | null;
}

const BrowseHousekeepersScreen = ({ navigation }: { navigation: any }) => {
    const [housekeepers, setHousekeepers] = useState<Housekeeper[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState<Filters>({
        category: null,
        employment_type: null,
        location: null,
    });
    const [isCategoryPickerVisible, setIsCategoryPickerVisible] = useState(false);
    const [isEmploymentTypePickerVisible, setIsEmploymentTypePickerVisible] = useState(false);

    const fetchHousekeepers = async () => {
        try {
            setLoading(true);
            const activeFilters = Object.fromEntries(
                Object.entries(filters).filter(([_, v]) => v !== null)
            ) as Partial<Filters>;
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

    const handleCategoryChange = (value: string | null) => {
        setFilters((prev) => ({
            ...prev,
            category: value as 'NORMAL' | 'CHILD_CARE' | 'CLEANING' | null,
        }));
        if (Platform.OS === 'ios') {
            setIsCategoryPickerVisible(false);
        }
    };

    const handleEmploymentTypeChange = (value: string | null) => {
        console.log('Employment Type Changed to:', value);
        setFilters((prev) => ({
            ...prev,
            employment_type: value as 'LIVE_OUT' | 'LIVE_IN' | null,
        }));
        console.log('Current Filters:', filters);
        if (Platform.OS === 'ios') {
            setIsEmploymentTypePickerVisible(false);
        }
    };

    const toggleCategoryPicker = () => {
        setIsCategoryPickerVisible(!isCategoryPickerVisible);
    };

    const toggleEmploymentTypePicker = () => {
        setIsEmploymentTypePickerVisible(!isEmploymentTypePickerVisible);
    };

    const filteredHousekeepers = housekeepers?.filter((housekeeper) => {
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
                        <Text style={styles.chipText}>
                            {item.category ? item.category.replace('_', ' ') : 'N/A'}
                        </Text>
                        <Text style={styles.chipText}>
                            {item.employment_type ? item.employment_type.replace('_', ' ') : 'N/A'}
                        </Text>
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

                <View style={styles.filterItem}>
                    <Text style={styles.filterLabel}>Category:</Text>
                    {Platform.OS === 'web' ? (
                        <select
                            style={styles.webPicker}
                            value={filters.category || ''} // Ensure a string value, '' for null
                            onChange={(e) => handleCategoryChange(e.target.value === '' ? null : e.target.value)}
                        >
                            <option value="">All</option>
                            <option value="NORMAL">Normal</option>
                            <option value="CHILD_CARE">Child Care</option>
                            <option value="CLEANING">Cleaning</option>
                        </select>
                    ) : Platform.OS === 'android' ? (
                        <Picker
                            selectedValue={filters.category}
                            style={styles.picker}
                            onValueChange={(itemValue) => handleCategoryChange(itemValue as 'NORMAL' | 'CHILD_CARE' | 'CLEANING' | null)}
                        >
                            <Picker.Item label="All" value={null} />
                            <Picker.Item label="Normal" value="NORMAL" />
                            <Picker.Item label="Child Care" value="CHILD_CARE" />
                            <Picker.Item label="Cleaning" value="CLEANING" />
                        </Picker>
                    ) : (
                        <TouchableOpacity onPress={toggleCategoryPicker} style={styles.iosPickerButton}>
                            <Text style={styles.iosPickerText}>
                                {filters.category ? filters.category.replace('_', ' ') : 'Select Category'}
                            </Text>
                            <Ionicons name="chevron-down-outline" size={20} color="#4A6572" />
                        </TouchableOpacity>
                    )}
                </View>

                <View style={styles.filterItem}>
                    <Text style={styles.filterLabel}>Type:</Text>
                    {Platform.OS === 'web' ? (
                        <select
                            style={styles.webPicker}
                            value={filters.employment_type || ''} // Ensure a string value, '' for null
                            onChange={(e) => handleEmploymentTypeChange(e.target.value === '' ? null : e.target.value)}
                        >
                            <option value="">All</option>
                            <option value="LIVE_OUT">Live Out</option>
                            <option value="LIVE_IN">Live In</option>
                        </select>
                    ) : Platform.OS === 'android' ? (
                        <Picker
                            selectedValue={filters.employment_type}
                            style={styles.picker}
                            onValueChange={(itemValue) => handleEmploymentTypeChange(itemValue as 'LIVE_OUT' | 'LIVE_IN' | null)}
                        >
                            <Picker.Item label="All" value={null} />
                            <Picker.Item label="Live Out" value="LIVE_OUT" />
                            <Picker.Item label="Live In" value="LIVE_IN" />
                        </Picker>
                    ) : (
                        <TouchableOpacity onPress={toggleEmploymentTypePicker} style={styles.iosPickerButton}>
                            <Text style={styles.iosPickerText}>
                                {filters.employment_type ? filters.employment_type.replace('_', ' ') : 'Select Type'}
                            </Text>
                            <Ionicons name="chevron-down-outline" size={20} color="#4A6572" />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {isCategoryPickerVisible && Platform.OS === 'ios' && (
                <View style={styles.iosPickerContainer}>
                    <Picker
                        selectedValue={filters.category}
                        style={styles.iosActualPicker}
                        onValueChange={(itemValue) => handleCategoryChange(itemValue as 'NORMAL' | 'CHILD_CARE' | 'CLEANING' | null)}
                    >
                        <Picker.Item label="All" value={null} />
                        <Picker.Item label="Normal" value="NORMAL" />
                        <Picker.Item label="Child Care" value="CHILD_CARE" />
                        <Picker.Item label="Cleaning" value="CLEANING" />
                    </Picker>
                    <TouchableOpacity style={styles.iosPickerDoneButton} onPress={() => setIsCategoryPickerVisible(false)}>
                        <Text style={styles.iosPickerDoneText}>Done</Text>
                    </TouchableOpacity>
                </View>
            )}

            {isEmploymentTypePickerVisible && Platform.OS === 'ios' && (
                <View style={styles.iosPickerContainer}>
                    <Picker
                        selectedValue={filters.employment_type}
                        style={styles.iosActualPicker}
                        onValueChange={(itemValue) => handleEmploymentTypeChange(itemValue as 'LIVE_OUT' | 'LIVE_IN' | null)}
                    >
                        <Picker.Item label="All" value={null} />
                        <Picker.Item label="Live Out" value="LIVE_OUT" />
                        <Picker.Item label="Live In" value="LIVE_IN" />
                    </Picker>
                    <TouchableOpacity style={styles.iosPickerDoneButton} onPress={() => setIsEmploymentTypePickerVisible(false)}>
                        <Text style={styles.iosPickerDoneText}>Done</Text>
                    </TouchableOpacity>
                </View>
            )}

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
    filterItem: {
        marginBottom: 16,
    },
    filterLabel: {
        fontSize: 14,
        color: '#4A6572',
        marginBottom: 4,
    },
    picker: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 4,
        paddingHorizontal: 8,
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
    chipText: {
        marginRight: 8,
        backgroundColor: '#E0E0E0',
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 4,
        fontSize: 12,
        color: '#4A6572',
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
    // iOS Specific Styles
    iosPickerButton: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 4,
        paddingHorizontal: 12,
        paddingVertical: 10,
    },
    iosPickerText: {
        fontSize: 16,
        color: '#4A6572',
    },
    iosPickerContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderColor: '#E0E0E0',
        zIndex: 10,
    },
    iosActualPicker: {
        height: 200,
    },
    iosPickerDoneButton: {
        padding: 16,
        alignItems: 'flex-end',
    },
    iosPickerDoneText: {
        color: '#007AFF', // Typical iOS blue
        fontSize: 18,
        fontWeight: 'bold',
    },
    // Web Specific Styles
    webPicker: {
        padding: 8,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 4,
        backgroundColor: '#FFFFFF',
        fontSize: 16,color: '#4A6572',
      },
});

export default BrowseHousekeepersScreen;

