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

const primaryColor = '#007bff'; // A professional blue
const secondaryColor = '#6c757d'; // A subtle gray
const backgroundColor = '#f8f9fa'; // Light background
const cardBackgroundColor = '#fff';
const textColorPrimary = '#343a40'; // Dark text
const textColorSecondary = '#6c757d'; // Lighter text
const accentColor = '#28a745'; // A touch of green for positive elements
const ratingColor = '#ffc107'; // Gold for ratings
const borderColor = '#dee2e6'; // Light border

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
        setFilters((prev) => ({
            ...prev,
            employment_type: value as 'LIVE_OUT' | 'LIVE_IN' | null,
        }));
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
            style={styles.cardTouchableOpacity}
        >
            <Card style={styles.card}>
                <Card.Cover
                    source={{ uri: item.photo_url || 'https://via.placeholder.com/150' }}
                    style={styles.cardCover}
                />
                <Card.Content style={styles.cardContent}>
                    <View style={styles.ratingContainer}>
                        <Text style={styles.name}>{item.name}</Text>
                        <View style={styles.rating}>
                            <Ionicons name="star" size={18} color={ratingColor} />
                            <Text style={styles.ratingText}>{item.rating ? item.rating.toFixed(1) : 'N/A'}</Text>
                        </View>
                    </View>

                    <View style={styles.infoRow}>
                        <Ionicons name="location-outline" size={16} color={textColorSecondary} />
                        <Text style={styles.infoText}>{item.location}</Text>
                    </View>

                    <View style={styles.infoRow}>
                        <Ionicons name="briefcase-outline" size={16} color={textColorSecondary} />
                        <Text style={styles.infoText}>{item.experience} years experience</Text>
                    </View>

                    <View style={styles.tagsContainer}>
                        {item.category && (
                            <View style={styles.chip}>
                                <Text style={styles.chipText}>
                                    {item.category.replace('_', ' ')}
                                </Text>
                            </View>
                        )}
                        {item.employment_type && (
                            <View style={styles.chip}>
                                <Text style={styles.chipText}>
                                    {item.employment_type.replace('_', ' ')}
                                </Text>
                            </View>
                        )}
                    </View>
                </Card.Content>
            </Card>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor }]}>
            <Searchbar
                placeholder="Search housekeepers..."
                onChangeText={handleSearch}
                value={searchQuery}
                style={styles.searchBar}
                inputStyle={styles.searchInput}
                iconColor={secondaryColor}
                placeholderTextColor={secondaryColor}
            />

            <View style={styles.filtersContainer}>
                <Text style={styles.filtersTitle}>Filter By:</Text>

                <View style={styles.filterItem}>
                    <Text style={styles.filterLabel}>Category:</Text>
                    {Platform.OS === 'web' ? (
                        <select
                            style={styles.webPicker}
                            value={filters.category || ''}
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
                            dropdownIconColor={primaryColor}
                            prompt="Select Category"
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
                                {filters.category ? filters.category.replace('_', ' ') : 'Category'}
                            </Text>
                            <Ionicons name="chevron-down-outline" size={20} color={secondaryColor} />
                        </TouchableOpacity>
                    )}
                </View>

                <View style={styles.filterItem}>
                    <Text style={styles.filterLabel}>Type:</Text>
                    {Platform.OS === 'web' ? (
                        <select
                            style={styles.webPicker}
                            value={filters.employment_type || ''}
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
                            dropdownIconColor={primaryColor}
                            prompt="Select Type"
                            onValueChange={(itemValue) => handleEmploymentTypeChange(itemValue as 'LIVE_OUT' | 'LIVE_IN' | null)}
                        >
                            <Picker.Item label="All" value={null} />
                            <Picker.Item label="Live Out" value="LIVE_OUT" />
                            <Picker.Item label="Live In" value="LIVE_IN" />
                        </Picker>
                    ) : (
                        <TouchableOpacity onPress={toggleEmploymentTypePicker} style={styles.iosPickerButton}>
                            <Text style={styles.iosPickerText}>
                                {filters.employment_type ? filters.employment_type.replace('_', ' ') : 'Employment Type'}
                            </Text>
                            <Ionicons name="chevron-down-outline" size={20} color={secondaryColor} />
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
                    <ActivityIndicator size="large" color={primaryColor} />
                </View>
            ) : (
                <FlatList
                    data={filteredHousekeepers}
                    renderItem={renderHousekeeperItem}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={styles.listContent}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={primaryColor} />}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name="search-outline" size={64} color={secondaryColor} />
                            <Text style={styles.emptyText}>No housekeepers found</Text>
                            <Text style={styles.emptySubtext}>Adjust your search or filters</Text>
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
    },
    // Compact Search Bar
    searchBar: {
        marginHorizontal: 16,
        marginTop: 16,
        marginBottom: 8, // Reduced bottom margin
        borderRadius: 8,
        backgroundColor: cardBackgroundColor,
        borderWidth: 1,
        borderColor: borderColor,
        fontSize: 16, // Inherited by inputStyle
        // height: 40, // Reduced height
        
    },
    searchInput: {
        fontSize: 16,
        color: textColorPrimary,
      
    },
    // Inline Filters
    filtersContainer: {
        // flexDirection: 'row', // Arrange filters horizontally
        paddingHorizontal: 32,
        marginBottom: 12,
        // backgroundColor: backgroundColor,
        // paddingVertical: 10, // Reduced vertical padding
        // borderBottomWidth: 1,
        // borderColor: borderColor,
        // alignItems: 'center', // Vertically align items in the row
    },
    filtersTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginRight: 12, // Space after the title
        color: textColorPrimary,
    },
    filterItem: {
        // flexDirection: 'row', // Arrange label and picker horizontally
        // alignItems: 'center',
        marginRight: 16, // Space between filter items
    },
    filterLabel: {
        fontSize: 14,
        color: textColorSecondary,
        marginRight: 6,
    },
    picker: {
        backgroundColor: cardBackgroundColor,
        borderWidth: 1,
        borderColor: borderColor,
        borderRadius: 8,
        paddingHorizontal: 8,
        color: textColorPrimary,
        height: 30, // Reduced height
        width: Platform.OS === 'web' ? 120 : undefined, // Adjust width for web
    },
    listContent: {
        paddingHorizontal: 16, // Keep horizontal padding
        paddingBottom: 16,
    },
    cardTouchableOpacity: {
        borderRadius: 8,
        overflow: 'hidden',
        marginBottom: 12, // Slightly reduced margin
        backgroundColor: cardBackgroundColor,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 }, // Subtle shadow
        shadowOpacity: 0.08,
        shadowRadius: 2,
        elevation: 1, // Subtle elevation
    },
    card: {
        borderRadius: 8,
        borderWidth: 0,
    },
    cardCover: {
        height: 160, // Slightly reduced cover height
    },
    cardContent: {
        padding: 12, // Reduced padding inside card
    },
    ratingContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6, // Reduced margin
    },
    name: {
        fontSize: 18,
        fontWeight: 'bold',
        color: textColorPrimary,
    },
    rating: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    ratingText: {
        marginLeft: 4,
        color: textColorSecondary,
        fontSize: 14,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4, // Reduced margin
    },
    infoText: {
        marginLeft: 8,
        color: textColorSecondary,
        fontSize: 12,
    },
    tagsContainer: {
        flexDirection: 'row',
        marginTop: 6, // Reduced margin
    },
    chip: {
        marginRight: 6, // Reduced margin
        backgroundColor: backgroundColor,
        paddingVertical: 4, // Reduced padding
        paddingHorizontal: 8, // Reduced padding
        borderRadius: 12, // More rounded
        fontSize: 12,
        color: textColorSecondary,
        borderWidth: 1,
        borderColor: borderColor,
    },
    chipText: {
        fontSize: 12,
        color: textColorSecondary,
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
        paddingTop: 60, // Reduced padding
    },
    emptyText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: textColorSecondary,
        marginTop: 16,
        textAlign: 'center',
    },
    emptySubtext: {
        fontSize: 14,
        color: textColorSecondary,
        marginTop: 6, // Reduced margin
        textAlign: 'center',
    },
    // iOS Specific Styles (Adjusted for compactness)
    iosPickerButton: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: cardBackgroundColor,
        borderWidth: 1,
        borderColor: borderColor,
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 8, // Reduced vertical padding
        height: 30, // Reduced height
    },
    iosPickerText: {
        fontSize: 14,
        color: textColorPrimary,
    },
    iosPickerContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: cardBackgroundColor,
        borderTopWidth: 1,
        borderColor: borderColor,
        zIndex: 10,
    },
    iosActualPicker: {
        height: 180, // Reduced height
        backgroundColor: cardBackgroundColor,
    },
    iosPickerDoneButton: {
        padding: 12, // Reduced padding
        alignItems: 'flex-end',
    },
    iosPickerDoneText: {
        color: primaryColor,
        fontSize: 16,
        fontWeight: 'bold',
    },
    // Web Specific Styles (Adjusted for compactness)
    webPicker: {
        padding: 6, // Reduced padding
        borderWidth: 1,
        borderColor: borderColor,
        borderRadius: 8,
        backgroundColor: cardBackgroundColor,
        fontSize: 14,
        color: textColorPrimary,
        height: 30, // Reduced height
    },
});
export default BrowseHousekeepersScreen;