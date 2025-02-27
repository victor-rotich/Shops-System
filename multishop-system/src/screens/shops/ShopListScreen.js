import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useApp } from '../../context/AppContext';
import AppCard from '../../components/common/AppCard';
import AppButton from '../../components/common/AppButton';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

const ShopListScreen = ({ navigation }) => {
  const { colors, fontSizes } = useTheme();
  const { shops, fetchInitialData, isLoading, deleteShop } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [filteredShops, setFilteredShops] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [sorting, setSorting] = useState({ key: 'name', ascending: true });

  useEffect(() => {
    filterAndSortShops();
  }, [shops, searchQuery, sorting]);

  const filterAndSortShops = () => {
    let filtered = shops;

    // Apply search filter
    if (searchQuery) {
      filtered = shops.filter(
        (shop) =>
          shop.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          shop.location.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply sorting
    filtered = [...filtered].sort((a, b) => {
      const valueA = a[sorting.key]?.toString().toLowerCase() || '';
      const valueB = b[sorting.key]?.toString().toLowerCase() || '';
      
      if (sorting.ascending) {
        return valueA.localeCompare(valueB);
      } else {
        return valueB.localeCompare(valueA);
      }
    });

    setFilteredShops(filtered);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchInitialData();
    setRefreshing(false);
  };

  const handleSort = (key) => {
    if (sorting.key === key) {
      setSorting({ key, ascending: !sorting.ascending });
    } else {
      setSorting({ key, ascending: true });
    }
  };

  const handleDeleteShop = (shopId, shopName) => {
    Alert.alert(
      'Delete Shop',
      `Are you sure you want to delete ${shopName}? This action cannot be undone.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          onPress: async () => {
            try {
              await deleteShop(shopId);
              Alert.alert('Success', `${shopName} has been deleted.`);
            } catch (error) {
              Alert.alert('Error', error.message);
            }
          },
          style: 'destructive',
        },
      ],
      { cancelable: true }
    );
  };

  const renderShopItem = ({ item }) => (
    <AppCard
      style={styles.shopCard}
      onPress={() => navigation.navigate('ShopDetail', { shopId: item.id, shopName: item.name })}
    >
      <View style={styles.shopInfo}>
        <View style={styles.shopDetails}>
          <Text
            style={[styles.shopName, { color: colors.text, fontSize: fontSizes.lg }]}
            numberOfLines={1}
          >
            {item.name}
          </Text>
          <View style={styles.shopMetaRow}>
            <Ionicons name="location-outline" size={wp(4)} color={colors.text + '80'} />
            <Text
              style={[
                styles.shopLocation,
                { color: colors.text + '80', fontSize: fontSizes.sm },
              ]}
              numberOfLines={1}
            >
              {item.location}
            </Text>
          </View>
          <View style={styles.shopMetaRow}>
            <Ionicons name="person-outline" size={wp(4)} color={colors.text + '80'} />
            <Text
              style={[
                styles.shopManager,
                { color: colors.text + '80', fontSize: fontSizes.sm },
              ]}
              numberOfLines={1}
            >
              {item.managerName || 'No manager assigned'}
            </Text>
          </View>
          <View style={styles.shopMetaRow}>
            <Ionicons name="call-outline" size={wp(4)} color={colors.text + '80'} />
            <Text
              style={[
                styles.shopPhone,
                { color: colors.text + '80', fontSize: fontSizes.sm },
              ]}
              numberOfLines={1}
            >
              {item.phone || 'N/A'}
            </Text>
          </View>
        </View>
        <View style={styles.shopStatus}>
          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor:
                  item.status === 'active'
                    ? colors.success + '20'
                    : colors.danger + '20',
              },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                {
                  color:
                    item.status === 'active' ? colors.success : colors.danger,
                  fontSize: fontSizes.xs,
                },
              ]}
            >
              {item.status === 'active' ? 'Active' : 'Inactive'}
            </Text>
          </View>
        </View>
      </View>
      <View style={styles.shopActions}>
        <TouchableOpacity
          style={[
            styles.actionButton,
            { backgroundColor: colors.primary + '20', marginRight: wp(2) },
          ]}
          onPress={() => navigation.navigate('ShopDetail', { shopId: item.id, shopName: item.name })}
        >
          <Ionicons name="eye-outline" size={wp(4.5)} color={colors.primary} />
          <Text
            style={[
              styles.actionText,
              { color: colors.primary, fontSize: fontSizes.xs },
            ]}
          >
            View
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.actionButton,
            { backgroundColor: colors.warning + '20', marginRight: wp(2) },
          ]}
          onPress={() => navigation.navigate('EmployeeList', { shopId: item.id, shopName: item.name })}
        >
          <Ionicons name="people-outline" size={wp(4.5)} color={colors.warning} />
          <Text
            style={[
              styles.actionText,
              { color: colors.warning, fontSize: fontSizes.xs },
            ]}
          >
            Staff
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.actionButton,
            { backgroundColor: colors.danger + '20' },
          ]}
          onPress={() => handleDeleteShop(item.id, item.name)}
        >
          <Ionicons name="trash-outline" size={wp(4.5)} color={colors.danger} />
          <Text
            style={[
              styles.actionText,
              { color: colors.danger, fontSize: fontSizes.xs },
            ]}
          >
            Delete
          </Text>
        </TouchableOpacity>
      </View>
    </AppCard>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.searchContainer}>
        <View
          style={[
            styles.searchBar,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <Ionicons name="search-outline" size={wp(5)} color={colors.text + '80'} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search shops by name or location"
            placeholderTextColor={colors.text + '60'}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={wp(5)} color={colors.text + '80'} />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          style={[
            styles.addButton,
            { backgroundColor: colors.primary },
          ]}
          onPress={() => navigation.navigate('AddShop')}
        >
          <Ionicons name="add" size={wp(6)} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.sortContainer}>
        <Text style={[styles.sortLabel, { color: colors.text, fontSize: fontSizes.sm }]}>
          Sort by:
        </Text>
        <TouchableOpacity
          style={[
            styles.sortButton,
            sorting.key === 'name' && {
              backgroundColor: colors.primary + '20',
            },
          ]}
          onPress={() => handleSort('name')}
        >
          <Text
            style={[
              styles.sortButtonText,
              {
                color: sorting.key === 'name' ? colors.primary : colors.text,
                fontSize: fontSizes.xs,
              },
            ]}
          >
            Name
            {sorting.key === 'name' && (
              <Ionicons
                name={sorting.ascending ? 'arrow-up' : 'arrow-down'}
                size={wp(3.5)}
                color={colors.primary}
              />
            )}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.sortButton,
            sorting.key === 'location' && {
              backgroundColor: colors.primary + '20',
            },
          ]}
          onPress={() => handleSort('location')}
        >
          <Text
            style={[
              styles.sortButtonText,
              {
                color: sorting.key === 'location' ? colors.primary : colors.text,
                fontSize: fontSizes.xs,
              },
            ]}
          >
            Location
            {sorting.key === 'location' && (
              <Ionicons
                name={sorting.ascending ? 'arrow-up' : 'arrow-down'}
                size={wp(3.5)}
                color={colors.primary}
              />
            )}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.sortButton,
            sorting.key === 'status' && {
              backgroundColor: colors.primary + '20',
            },
          ]}
          onPress={() => handleSort('status')}
        >
          <Text
            style={[
              styles.sortButtonText,
              {
                color: sorting.key === 'status' ? colors.primary : colors.text,
                fontSize: fontSizes.xs,
              },
            ]}
          >
            Status
            {sorting.key === 'status' && (
              <Ionicons
                name={sorting.ascending ? 'arrow-up' : 'arrow-down'}
                size={wp(3.5)}
                color={colors.primary}
              />
            )}
          </Text>
        </TouchableOpacity>
      </View>

      {isLoading && !refreshing ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredShops}
          renderItem={renderShopItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="business-outline" size={wp(20)} color={colors.text + '30'} />
              <Text style={[styles.emptyText, { color: colors.text, fontSize: fontSizes.md }]}>
                {searchQuery
                  ? 'No shops match your search criteria'
                  : 'No shops available'}
              </Text>
              <AppButton
                title="Add Your First Shop"
                type="primary"
                size="small"
                onPress={() => navigation.navigate('AddShop')}
                style={styles.emptyButton}
              />
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
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: wp(5),
    paddingVertical: hp(1.5),
    alignItems: 'center',
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: hp(2.5),
    paddingHorizontal: wp(3),
    paddingVertical: hp(1),
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    paddingHorizontal: wp(2),
    paddingVertical: hp(1),
    fontSize: wp(3.5),
  },
  addButton: {
    marginLeft: wp(3),
    width: wp(12),
    height: wp(12),
    borderRadius: wp(6),
    justifyContent: 'center',
    alignItems: 'center',
  },
  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp(5),
    paddingBottom: hp(1.5),
  },
  sortLabel: {
    marginRight: wp(2),
    fontWeight: '500',
  },
  sortButton: {
    paddingHorizontal: wp(3),
    paddingVertical: hp(0.8),
    borderRadius: hp(1),
    marginRight: wp(2),
  },
  sortButtonText: {
    fontWeight: '500',
  },
  listContent: {
    paddingHorizontal: wp(5),
    paddingBottom: hp(2),
  },
  shopCard: {
    marginVertical: hp(1),
  },
  shopInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: hp(1.5),
  },
  shopDetails: {
    flex: 1,
  },
  shopName: {
    fontWeight: 'bold',
    marginBottom: hp(0.5),
  },
  shopMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: hp(0.5),
  },
  shopLocation: {
    marginLeft: wp(1),
  },
  shopManager: {
    marginLeft: wp(1),
  },
  shopPhone: {
    marginLeft: wp(1),
  },
  shopStatus: {
    paddingLeft: wp(2),
    justifyContent: 'flex-start',
  },
  statusBadge: {
    paddingHorizontal: wp(2),
    paddingVertical: hp(0.5),
    borderRadius: hp(1),
  },
  statusText: {
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  shopActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: hp(1),
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp(3),
    paddingVertical: hp(0.8),
    borderRadius: hp(1),
  },
  actionText: {
    fontWeight: '500',
    marginLeft: wp(1),
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: hp(10),
  },
  emptyText: {
    fontWeight: '500',
    marginTop: hp(2),
    marginBottom: hp(2),
    textAlign: 'center',
  },
  emptyButton: {
    marginTop: hp(2),
  },
});

export default ShopListScreen;