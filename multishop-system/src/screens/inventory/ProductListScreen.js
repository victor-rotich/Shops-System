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
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useApp } from '../../context/AppContext';
import AppCard from '../../components/common/AppCard';
import AppButton from '../../components/common/AppButton';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

const ProductListScreen = ({ navigation }) => {
  const { colors, fontSizes } = useTheme();
  const { products, fetchInitialData, isLoading, deleteProduct } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [sorting, setSorting] = useState({ key: 'name', ascending: true });
  const [categoryFilter, setCategoryFilter] = useState('All');

  useEffect(() => {
    filterAndSortProducts();
  }, [products, searchQuery, sorting, categoryFilter]);

  const filterAndSortProducts = () => {
    let filtered = products;

    // Apply category filter
    if (categoryFilter !== 'All') {
      filtered = filtered.filter(
        (product) => product.category === categoryFilter
      );
    }

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Apply sorting
    filtered = [...filtered].sort((a, b) => {
      let valueA, valueB;

      if (sorting.key === 'price') {
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

    setFilteredProducts(filtered);
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

  const handleDeleteProduct = (productId, productName) => {
    Alert.alert(
      'Delete Product',
      `Are you sure you want to delete ${productName}? This action cannot be undone.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          onPress: async () => {
            try {
              await deleteProduct(productId);
              Alert.alert('Success', `${productName} has been deleted.`);
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

  // Get unique categories for filter
  const categories = ['All', ...new Set(products.map((product) => product.category))];

  const renderCategoryFilter = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.categoryContainer}
      contentContainerStyle={styles.categoryContent}
    >
      {categories.map((category) => (
        <TouchableOpacity
          key={category}
          style={[
            styles.categoryChip,
            {
              backgroundColor:
                categoryFilter === category
                  ? colors.primary
                  : colors.card,
              borderColor: colors.border,
            },
          ]}
          onPress={() => setCategoryFilter(category)}
        >
          <Text
            style={[
              styles.categoryChipText,
              {
                color: categoryFilter === category ? '#FFFFFF' : colors.text,
                fontSize: fontSizes.xs,
              },
            ]}
          >
            {category}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderProductItem = ({ item }) => (
    <AppCard
      style={styles.productCard}
      onPress={() => navigation.navigate('ProductDetail', { productId: item.id, productName: item.name })}
    >
      <View style={styles.productHeader}>
        <View style={styles.productInfo}>
          {item.imageUrl ? (
            <Image
              source={{ uri: item.imageUrl }}
              style={[styles.productImage, { backgroundColor: colors.background }]}
              resizeMode="contain"
            />
          ) : (
            <View style={[styles.productImage, { backgroundColor: colors.primary + '20' }]}>
              <Ionicons name="cube-outline" size={wp(8)} color={colors.primary} />
            </View>
          )}
          <View style={styles.productDetails}>
            <Text
              style={[styles.productName, { color: colors.text, fontSize: fontSizes.md }]}
              numberOfLines={1}
            >
              {item.name}
            </Text>
            <View style={styles.productCategory}>
              <Text
                style={[
                  styles.categoryText,
                  { backgroundColor: colors.secondary + '20', color: colors.secondary },
                ]}
              >
                {item.category}
              </Text>
            </View>
            <Text
              style={[styles.productPrice, { color: colors.text, fontSize: fontSizes.lg }]}
            >
              ${parseFloat(item.price).toFixed(2)}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={[styles.deleteButton, { backgroundColor: colors.danger + '20' }]}
          onPress={() => handleDeleteProduct(item.id, item.name)}
        >
          <Ionicons name="trash-outline" size={wp(5)} color={colors.danger} />
        </TouchableOpacity>
      </View>
      {item.description && (
        <Text
          style={[styles.productDescription, { color: colors.text + '99' }]}
          numberOfLines={2}
        >
          {item.description}
        </Text>
      )}
      <View style={styles.productActions}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.primary + '20' }]}
          onPress={() => navigation.navigate('ProductDetail', { productId: item.id, productName: item.name })}
        >
          <Ionicons name="eye-outline" size={wp(4)} color={colors.primary} />
          <Text style={[styles.actionText, { color: colors.primary }]}>View</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.warning + '20' }]}
          onPress={() => navigation.navigate('Inventory', { productId: item.id, productName: item.name })}
        >
          <Ionicons name="stats-chart-outline" size={wp(4)} color={colors.warning} />
          <Text style={[styles.actionText, { color: colors.warning }]}>Stock</Text>
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
            placeholder="Search products"
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
          onPress={() => navigation.navigate('AddProduct')}
        >
          <Ionicons name="add" size={wp(6)} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {renderCategoryFilter()}

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
            sorting.key === 'category' && {
              backgroundColor: colors.primary + '20',
            },
          ]}
          onPress={() => handleSort('category')}
        >
          <Text
            style={[
              styles.sortButtonText,
              {
                color: sorting.key === 'category' ? colors.primary : colors.text,
                fontSize: fontSizes.xs,
              },
            ]}
          >
            Category
            {sorting.key === 'category' && (
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
            sorting.key === 'price' && {
              backgroundColor: colors.primary + '20',
            },
          ]}
          onPress={() => handleSort('price')}
        >
          <Text
            style={[
              styles.sortButtonText,
              {
                color: sorting.key === 'price' ? colors.primary : colors.text,
                fontSize: fontSizes.xs,
              },
            ]}
          >
            Price
            {sorting.key === 'price' && (
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
          data={filteredProducts}
          renderItem={renderProductItem}
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
                  ? 'No products match your search criteria'
                  : 'No products available'}
              </Text>
              <AppButton
                title="Add Your First Product"
                type="primary"
                size="small"
                onPress={() => navigation.navigate('AddProduct')}
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
  categoryContainer: {
    paddingHorizontal: wp(5),
    marginBottom: hp(1),
  },
  categoryContent: {
    paddingRight: wp(5),
  },
  categoryChip: {
    paddingHorizontal: wp(3),
    paddingVertical: hp(0.8),
    borderRadius: hp(2),
    marginRight: wp(2),
    borderWidth: 1,
  },
  categoryChipText: {
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
  productCard: {
    marginVertical: hp(1),
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  productInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  productImage: {
    width: wp(15),
    height: wp(15),
    borderRadius: wp(2),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: wp(3),
  },
  productDetails: {
    flex: 1,
  },
  productName: {
    fontWeight: 'bold',
  },
  productCategory: {
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
  productPrice: {
    fontWeight: 'bold',
    marginTop: hp(0.5),
  },
  deleteButton: {
    padding: wp(2),
    borderRadius: wp(5),
  },
  productDescription: {
    marginTop: hp(1),
    marginBottom: hp(1.5),
  },
  productActions: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
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

export default ProductListScreen;