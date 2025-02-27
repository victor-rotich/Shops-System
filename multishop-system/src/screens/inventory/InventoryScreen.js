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
import { useAuth } from '../../context/AuthContext';
import AppCard from '../../components/common/AppCard';
import AppButton from '../../components/common/AppButton';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

const InventoryScreen = ({ navigation, route }) => {
  const { colors, fontSizes } = useTheme();
  const { 
    inventory, 
    products, 
    shops, 
    selectedShop, 
    fetchInitialData, 
    isLoading, 
    updateInventory,
    setSelectedShop 
  } = useApp();
  const { user } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [filteredInventory, setFilteredInventory] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [sorting, setSorting] = useState({ key: 'productName', ascending: true });
  const [stockFilter, setStockFilter] = useState('all'); // all, low, out

  // Get productId from route params if provided
  const selectedProductId = route.params?.productId;

  useEffect(() => {
    // If a product ID is provided in the route, filter the inventory by that product
    if (selectedProductId) {
      setSearchQuery('');
      filterAndSortInventory(selectedProductId);
    } else {
      filterAndSortInventory();
    }
  }, [inventory, products, selectedProductId, searchQuery, sorting, stockFilter, selectedShop]);

  const filterAndSortInventory = (productId = null) => {
    // Combine inventory with product data
    let inventoryWithProductDetails = inventory.map(item => {
      const product = products.find(p => p.id === item.productId) || {};
      return {
        ...item,
        productName: product.name || 'Unknown Product',
        category: product.category || 'Uncategorized',
        price: product.price || 0,
      };
    });

    // Filter by selected shop if one is selected
    if (selectedShop) {
      inventoryWithProductDetails = inventoryWithProductDetails.filter(
        item => item.shopId === selectedShop.id
      );
    } else if (user.role === 'manager' && user.shopId) {
      // For shop managers, only show their shop's inventory
      inventoryWithProductDetails = inventoryWithProductDetails.filter(
        item => item.shopId === user.shopId
      );
    }

    // If a specific product is selected
    if (productId) {
      inventoryWithProductDetails = inventoryWithProductDetails.filter(
        item => item.productId === productId
      );
    }

    // Filter by stock level
    if (stockFilter === 'low') {
      inventoryWithProductDetails = inventoryWithProductDetails.filter(
        item => item.currentStock <= item.lowStockThreshold && item.currentStock > 0
      );
    } else if (stockFilter === 'out') {
      inventoryWithProductDetails = inventoryWithProductDetails.filter(
        item => item.currentStock === 0
      );
    }

    // Apply search filter
    if (searchQuery) {
      inventoryWithProductDetails = inventoryWithProductDetails.filter(
        item =>
          item.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply sorting
    inventoryWithProductDetails = [...inventoryWithProductDetails].sort((a, b) => {
      let valueA, valueB;

      if (sorting.key === 'currentStock') {
        valueA = parseFloat(a[sorting.key]) || 0;
        valueB = parseFloat(b[sorting.key]) || 0;
        return sorting.ascending ? valueA - valueB : valueB - valueA;
      } else {
        valueA = a[sorting.key]?.toString().toLowerCase() || '';
        valueB = b[sorting.key]?.toString().toLowerCase() || '';
        return sorting.ascending
          ? valueA.localeCompare(valueB)
          : valueB.localeCompare(valueA);
      }
    });

    setFilteredInventory(inventoryWithProductDetails);
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

  const handleShopSelect = (shop) => {
    setSelectedShop(shop);
  };

  const renderShopSelector = () => {
    // Only show for admin users
    if (user.role !== 'admin') return null;

    return (
      <View style={styles.shopSelectorContainer}>
        <Text style={[styles.selectorLabel, { color: colors.text, fontSize: fontSizes.sm }]}>
          Select Shop:
        </Text>
        <View style={styles.shopsList}>
          <TouchableOpacity
            style={[
              styles.shopChip,
              {
                backgroundColor: !selectedShop ? colors.primary : colors.card,
                borderColor: colors.border,
              },
            ]}
            onPress={() => handleShopSelect(null)}
          >
            <Text
              style={[
                styles.shopChipText,
                {
                  color: !selectedShop ? '#FFFFFF' : colors.text,
                  fontSize: fontSizes.xs,
                },
              ]}
            >
              All Shops
            </Text>
          </TouchableOpacity>
          {shops.map((shop) => (
            <TouchableOpacity
              key={shop.id}
              style={[
                styles.shopChip,
                {
                  backgroundColor:
                    selectedShop?.id === shop.id ? colors.primary : colors.card,
                  borderColor: colors.border,
                },
              ]}
              onPress={() => handleShopSelect(shop)}
            >
              <Text
                style={[
                  styles.shopChipText,
                  {
                    color: selectedShop?.id === shop.id ? '#FFFFFF' : colors.text,
                    fontSize: fontSizes.xs,
                  },
                ]}
              >
                {shop.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  const renderStockFilters = () => (
    <View style={styles.stockFilterContainer}>
      <Text style={[styles.filterLabel, { color: colors.text, fontSize: fontSizes.sm }]}>
        Filter:
      </Text>
      <View style={styles.filterOptions}>
        <TouchableOpacity
          style={[
            styles.filterChip,
            {
              backgroundColor:
                stockFilter === 'all' ? colors.primary : colors.card,
              borderColor: colors.border,
            },
          ]}
          onPress={() => setStockFilter('all')}
        >
          <Text
            style={[
              styles.filterChipText,
              {
                color: stockFilter === 'all' ? '#FFFFFF' : colors.text,
                fontSize: fontSizes.xs,
              },
            ]}
          >
            All Stock
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterChip,
            {
              backgroundColor:
                stockFilter === 'low' ? colors.warning : colors.card,
              borderColor: colors.border,
            },
          ]}
          onPress={() => setStockFilter('low')}
        >
          <Text
            style={[
              styles.filterChipText,
              {
                color: stockFilter === 'low' ? '#FFFFFF' : colors.text,
                fontSize: fontSizes.xs,
              },
            ]}
          >
            Low Stock
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterChip,
            {
              backgroundColor:
                stockFilter === 'out' ? colors.danger : colors.card,
              borderColor: colors.border,
            },
          ]}
          onPress={() => setStockFilter('out')}
        >
          <Text
            style={[
              styles.filterChipText,
              {
                color: stockFilter === 'out' ? '#FFFFFF' : colors.text,
                fontSize: fontSizes.xs,
              },
            ]}
          >
            Out of Stock
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const getStockStatusColor = (currentStock, lowStockThreshold) => {
    if (currentStock === 0) return colors.danger;
    if (currentStock <= lowStockThreshold) return colors.warning;
    return colors.success;
  };

  const getStockStatusText = (currentStock, lowStockThreshold) => {
    if (currentStock === 0) return 'Out of Stock';
    if (currentStock <= lowStockThreshold) return 'Low Stock';
    return 'In Stock';
  };

  const renderInventoryItem = ({ item }) => {
    const stockStatusColor = getStockStatusColor(item.currentStock, item.lowStockThreshold);
    const stockStatusText = getStockStatusText(item.currentStock, item.lowStockThreshold);
    
    // Find shop name
    const shop = shops.find(s => s.id === item.shopId);
    const shopName = shop ? shop.name : 'Unknown Shop';

    return (
      <AppCard style={styles.inventoryCard}>
        <View style={styles.inventoryHeader}>
          <View style={styles.productInfo}>
            <Text
              style={[styles.productName, { color: colors.text, fontSize: fontSizes.md }]}
              numberOfLines={1}
            >
              {item.productName}
            </Text>
            {user.role === 'admin' && (
              <Text
                style={[styles.shopName, { color: colors.text + '80', fontSize: fontSizes.sm }]}
              >
                {shopName}
              </Text>
            )}
            <View style={styles.categoryContainer}>
              <Text
                style={[
                  styles.categoryText,
                  { backgroundColor: colors.secondary + '20', color: colors.secondary },
                ]}
              >
                {item.category}
              </Text>
            </View>
          </View>
          <View style={styles.stockInfo}>
            <Text
              style={[
                styles.stockCount,
                { color: colors.text, fontSize: fontSizes.xl },
              ]}
            >
              {item.currentStock}
            </Text>
            <Text
              style={[
                styles.stockLabel,
                { color: colors.text + '80', fontSize: fontSizes.xs },
              ]}
            >
              in stock
            </Text>
            <View
              style={[
                styles.stockStatus,
                { backgroundColor: stockStatusColor + '20' },
              ]}
            >
              <Text
                style={[
                  styles.stockStatusText,
                  { color: stockStatusColor, fontSize: fontSizes.xs },
                ]}
              >
                {stockStatusText}
              </Text>
            </View>
          </View>
        </View>
        <View style={styles.inventoryDetails}>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.text + '80' }]}>
              Price:
            </Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>
              ${parseFloat(item.price).toFixed(2)}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.text + '80' }]}>
              Low Stock Alert:
            </Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>
              {item.lowStockThreshold} units
            </Text>
          </View>
        </View>
        <View style={styles.inventoryActions}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.primary + '20' }]}
            onPress={() => navigation.navigate('StockEntry', { inventoryId: item.id, productName: item.productName })}
          >
            <Ionicons name="add-circle-outline" size={wp(4)} color={colors.primary} />
            <Text style={[styles.actionText, { color: colors.primary }]}>Add Stock</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.secondary + '20' }]}
            onPress={() => navigation.navigate('TransferRequest', { 
              inventoryId: item.id, 
              productId: item.productId,
              productName: item.productName, 
              shopId: item.shopId,
              currentStock: item.currentStock
            })}
          >
            <Ionicons name="swap-horizontal-outline" size={wp(4)} color={colors.secondary} />
            <Text style={[styles.actionText, { color: colors.secondary }]}>Transfer</Text>
          </TouchableOpacity>
        </View>
      </AppCard>
    );
  };

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
            placeholder="Search inventory"
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
      </View>

      {renderShopSelector()}
      {renderStockFilters()}

      <View style={styles.sortContainer}>
        <Text style={[styles.sortLabel, { color: colors.text, fontSize: fontSizes.sm }]}>
          Sort by:
        </Text>
        <TouchableOpacity
          style={[
            styles.sortButton,
            sorting.key === 'productName' && {
              backgroundColor: colors.primary + '20',
            },
          ]}
          onPress={() => handleSort('productName')}
        >
          <Text
            style={[
              styles.sortButtonText,
              {
                color: sorting.key === 'productName' ? colors.primary : colors.text,
                fontSize: fontSizes.xs,
              },
            ]}
          >
            Name
            {sorting.key === 'productName' && (
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
            sorting.key === 'currentStock' && {
              backgroundColor: colors.primary + '20',
            },
          ]}
          onPress={() => handleSort('currentStock')}
        >
          <Text
            style={[
              styles.sortButtonText,
              {
                color: sorting.key === 'currentStock' ? colors.primary : colors.text,
                fontSize: fontSizes.xs,
              },
            ]}
          >
            Stock Level
            {sorting.key === 'currentStock' && (
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
          data={filteredInventory}
          renderItem={renderInventoryItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="cube-outline" size={wp(20)} color={colors.text + '30'} />
              <Text style={[styles.emptyText, { color: colors.text, fontSize: fontSizes.md }]}>
                {searchQuery
                  ? 'No inventory items match your search criteria'
                  : stockFilter !== 'all'
                  ? `No ${stockFilter === 'low' ? 'low stock' : 'out of stock'} items found`
                  : 'No inventory items available'}
              </Text>
              <AppButton
                title="Go to Products"
                type="primary"
                size="small"
                onPress={() => navigation.navigate('ProductList')}
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
    paddingHorizontal: wp(5),
    paddingVertical: hp(1.5),
    flexDirection: 'row',
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
  shopSelectorContainer: {
    paddingHorizontal: wp(5),
    marginBottom: hp(1),
  },
  selectorLabel: {
    fontWeight: '500',
    marginBottom: hp(0.5),
  },
  shopsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  shopChip: {
    paddingHorizontal: wp(3),
    paddingVertical: hp(0.8),
    borderRadius: hp(2),
    marginRight: wp(2),
    marginBottom: hp(1),
    borderWidth: 1,
  },
  shopChipText: {
    fontWeight: '500',
  },
  stockFilterContainer: {
    paddingHorizontal: wp(5),
    marginBottom: hp(1),
  },
  filterLabel: {
    fontWeight: '500',
    marginBottom: hp(0.5),
  },
  filterOptions: {
    flexDirection: 'row',
  },
  filterChip: {
    paddingHorizontal: wp(3),
    paddingVertical: hp(0.8),
    borderRadius: hp(2),
    marginRight: wp(2),
    borderWidth: 1,
  },
  filterChipText: {
    fontWeight: '500',
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
  inventoryCard: {
    marginVertical: hp(1),
  },
  inventoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontWeight: 'bold',
  },
  shopName: {
    marginTop: hp(0.3),
  },
  categoryContainer: {
    marginTop: hp(0.5),
  },
  categoryText: {
    fontSize: wp(3),
    paddingHorizontal: wp(2),
    paddingVertical: hp(0.3),
    borderRadius: hp(0.7),
    alignSelf: 'flex-start',
    fontWeight: '500',
  },
  stockInfo: {
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: wp(3),
  },
  stockCount: {
    fontWeight: 'bold',
  },
  stockLabel: {
    marginTop: -hp(0.5),
  },
  stockStatus: {
    marginTop: hp(1),
    paddingHorizontal: wp(2),
    paddingVertical: hp(0.3),
    borderRadius: hp(1),
  },
  stockStatusText: {
    fontWeight: 'bold',
  },
  inventoryDetails: {
    marginTop: hp(1.5),
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: hp(0.8),
  },
  infoLabel: {
    fontSize: wp(3.5),
  },
  infoValue: {
    fontWeight: '500',
    fontSize: wp(3.5),
  },
  inventoryActions: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginTop: hp(1.5),
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp(3),
    paddingVertical: hp(0.8),
    borderRadius: hp(1),
    marginRight: wp(3),
  },
  actionText: {
    fontWeight: '500',
    fontSize: wp(3.5),
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

export default InventoryScreen;