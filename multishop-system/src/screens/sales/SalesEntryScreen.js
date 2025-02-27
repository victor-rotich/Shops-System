import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity,
  FlatList,
  Modal,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import AppInput from '../../components/common/AppInput';
import AppButton from '../../components/common/AppButton';
import AppCard from '../../components/common/AppCard';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

// Validation schema for sale form
const SaleSchema = Yup.object().shape({
  customerName: Yup.string(),
  customerPhone: Yup.string(),
  paymentMethod: Yup.string().required('Payment method is required'),
  discount: Yup.number()
    .min(0, 'Discount cannot be negative')
    .max(100, 'Discount cannot exceed 100%'),
  notes: Yup.string(),
});

const SalesEntryScreen = ({ navigation }) => {
  const { colors, fontSizes } = useTheme();
  const { inventory, products, selectedShop, addSale, isLoading } = useApp();
  const { user } = useAuth();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [showProductSelector, setShowProductSelector] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [availableProducts, setAvailableProducts] = useState([]);
  const [showQuantityModal, setShowQuantityModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState('1');
  const [shopId, setShopId] = useState(null);
  
  // Sale summary calculations
  const [subtotal, setSubtotal] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    // Determine which shop to use (for managers and employees)
    const currentShopId = selectedShop?.id || user.shopId;
    if (!currentShopId) {
      Alert.alert('Error', 'No shop selected or assigned');
      navigation.goBack();
      return;
    }
    setShopId(currentShopId);

    // Combine inventory with product details for the current shop
    const shopInventory = inventory.filter(item => item.shopId === currentShopId);
    
    const productsWithInventory = shopInventory.map(invItem => {
      const productDetails = products.find(p => p.id === invItem.productId);
      if (!productDetails) return null;
      
      return {
        ...productDetails,
        inventoryId: invItem.id,
        currentStock: invItem.currentStock,
        lowStockThreshold: invItem.lowStockThreshold,
      };
    }).filter(item => item !== null && item.currentStock > 0);
    
    setAvailableProducts(productsWithInventory);
  }, [selectedShop, user, inventory, products]);

  // Calculate cart totals whenever cartItems or discount changes
  useEffect(() => {
    const calculatedSubtotal = cartItems.reduce(
      (sum, item) => sum + (parseFloat(item.price) * item.quantity),
      0
    );
    setSubtotal(calculatedSubtotal);
    
    const calculatedDiscount = (calculatedSubtotal * (discount / 100)) || 0;
    const calculatedTotal = calculatedSubtotal - calculatedDiscount;
    
    setTotal(calculatedTotal);
  }, [cartItems, discount]);

  const addToCart = (product, qty) => {
    // Check if product is already in cart
    const existingItemIndex = cartItems.findIndex(item => item.id === product.id);
    
    if (existingItemIndex >= 0) {
      // Update quantity if product already in cart
      const updatedCart = [...cartItems];
      const newQuantity = updatedCart[existingItemIndex].quantity + parseInt(qty, 10);
      
      // Check if new quantity exceeds available stock
      if (newQuantity > product.currentStock) {
        Alert.alert('Insufficient Stock', `Only ${product.currentStock} units available`);
        return;
      }
      
      updatedCart[existingItemIndex].quantity = newQuantity;
      setCartItems(updatedCart);
    } else {
      // Add new product to cart
      if (parseInt(qty, 10) > product.currentStock) {
        Alert.alert('Insufficient Stock', `Only ${product.currentStock} units available`);
        return;
      }
      
      setCartItems([
        ...cartItems,
        {
          id: product.id,
          name: product.name,
          price: product.price,
          quantity: parseInt(qty, 10),
          inventoryId: product.inventoryId,
          productId: product.id,
          currentStock: product.currentStock,
          lowStockThreshold: product.lowStockThreshold,
        },
      ]);
    }
    
    // Close modals
    setShowQuantityModal(false);
    setShowProductSelector(false);
    setSearchQuery('');
  };

  const removeFromCart = (productId) => {
    const updatedCart = cartItems.filter(item => item.id !== productId);
    setCartItems(updatedCart);
  };

  const updateCartItemQuantity = (productId, newQuantity) => {
    const product = cartItems.find(item => item.id === productId);
    if (!product) return;
    
    if (parseInt(newQuantity, 10) > product.currentStock) {
      Alert.alert('Insufficient Stock', `Only ${product.currentStock} units available`);
      return;
    }
    
    const updatedCart = cartItems.map(item => 
      item.id === productId 
        ? { ...item, quantity: parseInt(newQuantity, 10) } 
        : item
    );
    
    setCartItems(updatedCart);
  };

  const handleCompleteSale = async (values) => {
    if (cartItems.length === 0) {
      Alert.alert('Empty Cart', 'Please add at least one product to the cart');
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Prepare sale data
      const saleData = {
        shopId,
        items: cartItems.map(item => ({
          productId: item.id,
          productName: item.name,
          quantity: item.quantity,
          price: parseFloat(item.price),
          subtotal: item.quantity * parseFloat(item.price),
          inventoryId: item.inventoryId,
          lowStockThreshold: item.lowStockThreshold,
        })),
        customerName: values.customerName || 'Walk-in Customer',
        customerPhone: values.customerPhone || '',
        paymentMethod: values.paymentMethod,
        subtotal,
        discountPercentage: parseFloat(values.discount) || 0,
        discountAmount: (subtotal * (parseFloat(values.discount) || 0)) / 100,
        totalAmount: total,
        notes: values.notes || '',
        status: 'completed',
        createdAt: new Date().toISOString(),
      };
      
      await addSale(saleData);
      
      Alert.alert(
        'Success',
        'Sale has been recorded successfully',
        [{ text: 'OK', onPress: () => {
          setCartItems([]);
          navigation.navigate('SalesHistory');
        }}]
      );
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredProducts = searchQuery
    ? availableProducts.filter(
        product =>
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : availableProducts;

  const renderProductItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.productItem,
        { borderBottomColor: colors.border },
      ]}
      onPress={() => {
        setSelectedProduct(item);
        setQuantity('1');
        setShowQuantityModal(true);
      }}
    >
      <View style={styles.productInfo}>
        <Text style={[styles.productName, { color: colors.text, fontSize: fontSizes.md }]}>
          {item.name}
        </Text>
        <View style={styles.productMeta}>
          <Text style={[styles.productCategory, { color: colors.text + '80', fontSize: fontSizes.sm }]}>
            {item.category}
          </Text>
          <Text style={[styles.productStock, { color: colors.text + '80', fontSize: fontSizes.sm }]}>
            Stock: {item.currentStock}
          </Text>
        </View>
      </View>
      <View style={styles.productPrice}>
        <Text style={[styles.priceValue, { color: colors.primary, fontSize: fontSizes.lg }]}>
          ${parseFloat(item.price).toFixed(2)}
        </Text>
        <Ionicons
          name="add-circle"
          size={wp(6)}
          color={colors.primary}
        />
      </View>
    </TouchableOpacity>
  );

  const renderCartItem = ({ item, index }) => (
    <View style={[styles.cartItem, { backgroundColor: colors.card }]}>
      <View style={styles.cartItemInfo}>
        <Text style={[styles.cartItemName, { color: colors.text, fontSize: fontSizes.md }]}>
          {item.name}
        </Text>
        <Text style={[styles.cartItemPrice, { color: colors.text + '80', fontSize: fontSizes.sm }]}>
          ${parseFloat(item.price).toFixed(2)} × {item.quantity} = ${(item.price * item.quantity).toFixed(2)}
        </Text>
      </View>
      <View style={styles.cartItemActions}>
        <TouchableOpacity
          style={[styles.quantityButton, { borderColor: colors.border }]}
          onPress={() => {
            if (item.quantity > 1) {
              updateCartItemQuantity(item.id, item.quantity - 1);
            }
          }}
        >
          <Ionicons name="remove" size={wp(4)} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.quantityText, { color: colors.text }]}>
          {item.quantity}
        </Text>
        <TouchableOpacity
          style={[styles.quantityButton, { borderColor: colors.border }]}
          onPress={() => {
            if (item.quantity < item.currentStock) {
              updateCartItemQuantity(item.id, item.quantity + 1);
            } else {
              Alert.alert('Maximum Stock', `Only ${item.currentStock} units available`);
            }
          }}
        >
          <Ionicons name="add" size={wp(4)} color={colors.text} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.removeButton, { backgroundColor: colors.danger + '20' }]}
          onPress={() => removeFromCart(item.id)}
        >
          <Ionicons name="trash-outline" size={wp(4)} color={colors.danger} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const ProductSelectorModal = () => (
    <Modal
      visible={showProductSelector}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowProductSelector(false)}
    >
      <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
        <View
          style={[
            styles.modalContent,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <View style={styles.modalHeader}>
            <Text
              style={[
                styles.modalTitle,
                { color: colors.text, fontSize: fontSizes.lg },
              ]}
            >
              Select Product
            </Text>
            <TouchableOpacity onPress={() => setShowProductSelector(false)}>
              <Ionicons name="close" size={wp(6)} color={colors.text} />
            </TouchableOpacity>
          </View>
          
          <View
            style={[
              styles.searchBar,
              { backgroundColor: colors.background, borderColor: colors.border },
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
          
          {filteredProducts.length === 0 ? (
            <View style={styles.emptyProducts}>
              <Text style={[styles.emptyText, { color: colors.text }]}>
                No products available or matching search
              </Text>
            </View>
          ) : (
            <FlatList
              data={filteredProducts}
              renderItem={renderProductItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.productList}
            />
          )}
          
          <AppButton
            title="Cancel"
            onPress={() => setShowProductSelector(false)}
            style={styles.closeButton}
          />
        </View>
      </View>
    </Modal>
  );

  const QuantityModal = () => (
    <Modal
      visible={showQuantityModal}
      animationType="fade"
      transparent={true}
      onRequestClose={() => setShowQuantityModal(false)}
    >
      <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
        <View
          style={[
            styles.quantityModalContent,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <Text
            style={[
              styles.quantityModalTitle,
              { color: colors.text, fontSize: fontSizes.lg },
            ]}
          >
            Set Quantity
          </Text>
          
          {selectedProduct && (
            <>
              <Text style={[styles.selectedProductName, { color: colors.text }]}>
                {selectedProduct.name}
              </Text>
              <Text style={[styles.stockAvailable, { color: colors.text + '80' }]}>
                Available: {selectedProduct.currentStock} units
              </Text>
            </>
          )}
          
          <View style={styles.quantityInputContainer}>
            <TouchableOpacity
              style={[
                styles.quantityModalButton,
                { borderColor: colors.border },
              ]}
              onPress={() => {
                const current = parseInt(quantity, 10) || 0;
                if (current > 1) {
                  setQuantity((current - 1).toString());
                }
              }}
            >
              <Ionicons name="remove" size={wp(5)} color={colors.text} />
            </TouchableOpacity>
            
            <TextInput
              style={[
                styles.quantityModalInput,
                { color: colors.text, borderColor: colors.border },
              ]}
              value={quantity}
              onChangeText={value => {
                const numValue = parseInt(value, 10);
                if (!value) {
                  setQuantity('');
                } else if (!isNaN(numValue) && numValue > 0) {
                  if (selectedProduct && numValue <= selectedProduct.currentStock) {
                    setQuantity(numValue.toString());
                  } else if (selectedProduct) {
                    setQuantity(selectedProduct.currentStock.toString());
                  }
                }
              }}
              keyboardType="numeric"
            />
            
            <TouchableOpacity
              style={[
                styles.quantityModalButton,
                { borderColor: colors.border },
              ]}
              onPress={() => {
                const current = parseInt(quantity, 10) || 0;
                if (selectedProduct && current < selectedProduct.currentStock) {
                  setQuantity((current + 1).toString());
                }
              }}
            >
              <Ionicons name="add" size={wp(5)} color={colors.text} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.quantityModalActions}>
            <AppButton
              title="Cancel"
              onPress={() => setShowQuantityModal(false)}
              type="secondary"
              outlined
              style={styles.quantityModalButton}
            />
            <AppButton
              title="Add to Cart"
              onPress={() => {
                if (selectedProduct) {
                  addToCart(selectedProduct, quantity);
                }
              }}
              style={styles.quantityModalButton}
            />
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={[styles.headerTitle, { color: colors.text, fontSize: fontSizes.xl }]}>
              Sales Entry
            </Text>
            <TouchableOpacity
              style={[
                styles.addProductButton,
                { backgroundColor: colors.primary },
              ]}
              onPress={() => setShowProductSelector(true)}
            >
              <Ionicons name="add" size={wp(5)} color="#FFFFFF" />
              <Text style={[styles.addProductText, { color: '#FFFFFF' }]}>
                Add Product
              </Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.cartContainer}>
            <Text style={[styles.sectionTitle, { color: colors.text, fontSize: fontSizes.lg }]}>
              Cart Items
            </Text>
            {cartItems.length === 0 ? (
              <View style={[styles.emptyCart, { backgroundColor: colors.card }]}>
                <Ionicons name="cart-outline" size={wp(15)} color={colors.text + '30'} />
                <Text style={[styles.emptyCartText, { color: colors.text }]}>
                  Cart is empty
                </Text>
                <Text style={[styles.emptyCartSubtext, { color: colors.text + '80' }]}>
                  Add products to create a sale
                </Text>
              </View>
            ) : (
              <FlatList
                data={cartItems}
                renderItem={renderCartItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.cartList}
                style={{ flexGrow: 0 }}
              />
            )}
          </View>
          
          <View style={styles.salesForm}>
            <Formik
              initialValues={{
                customerName: '',
                customerPhone: '',
                paymentMethod: 'cash',
                discount: '0',
                notes: '',
              }}
              validationSchema={SaleSchema}
              onSubmit={handleCompleteSale}
              onSubmitEditing={() => {
                if (cartItems.length === 0) {
                  Alert.alert('Empty Cart', 'Please add at least one product to the cart');
                }
              }}
            >
              {({
                handleChange,
                handleBlur,
                handleSubmit,
                setFieldValue,
                values,
                errors,
                touched,
              }) => (
                <ScrollView showsVerticalScrollIndicator={false}>
                  <AppCard style={styles.summaryCard}>
                    <Text style={[styles.summaryTitle, { color: colors.text, fontSize: fontSizes.md }]}>
                      Sale Summary
                    </Text>
                    
                    <View style={[styles.summaryRow, { borderColor: colors.border }]}>
                      <Text style={[styles.summaryLabel, { color: colors.text }]}>Subtotal:</Text>
                      <Text style={[styles.summaryValue, { color: colors.text }]}>
                        ${subtotal.toFixed(2)}
                      </Text>
                    </View>
                    
                    <View style={[styles.discountRow, { borderColor: colors.border }]}>
                      <Text style={[styles.summaryLabel, { color: colors.text }]}>Discount:</Text>
                      <View style={styles.discountInputContainer}>
                        <TextInput
                          style={[
                            styles.discountInput,
                            { color: colors.text, borderColor: colors.border },
                          ]}
                          value={values.discount}
                          onChangeText={value => {
                            setFieldValue('discount', value);
                            setDiscount(parseFloat(value) || 0);
                          }}
                          keyboardType="numeric"
                          placeholder="0"
                          placeholderTextColor={colors.text + '60'}
                        />
                        <Text style={[styles.discountSymbol, { color: colors.text }]}>%</Text>
                      </View>
                    </View>
                    
                    <View style={[styles.summaryRow, { borderColor: colors.border }]}>
                      <Text style={[styles.totalLabel, { color: colors.text }]}>Total:</Text>
                      <Text style={[styles.totalValue, { color: colors.primary }]}>
                        ${total.toFixed(2)}
                      </Text>
                    </View>
                  </AppCard>
                  
                  <View style={styles.formContainer}>
                    <Text style={[styles.formTitle, { color: colors.text, fontSize: fontSizes.md }]}>
                      Payment Details
                    </Text>
                    
                    <AppInput
                      label="Customer Name (Optional)"
                      value={values.customerName}
                      onChangeText={handleChange('customerName')}
                      onBlur={handleBlur('customerName')}
                      placeholder="Enter customer name"
                      error={errors.customerName}
                      touched={touched.customerName}
                      leftIcon={
                        <Ionicons
                          name="person-outline"
                          size={wp(5)}
                          color={colors.text + '80'}
                        />
                      }
                    />
                    
                    <AppInput
                      label="Customer Phone (Optional)"
                      value={values.customerPhone}
                      onChangeText={handleChange('customerPhone')}
                      onBlur={handleBlur('customerPhone')}
                      placeholder="Enter customer phone"
                      keyboardType="phone-pad"
                      error={errors.customerPhone}
                      touched={touched.customerPhone}
                      leftIcon={
                        <Ionicons
                          name="call-outline"
                          size={wp(5)}
                          color={colors.text + '80'}
                        />
                      }
                    />
                    
                    <Text style={[styles.inputLabel, { color: colors.text, fontSize: fontSizes.sm }]}>
                      Payment Method
                    </Text>
                    <View style={styles.paymentMethods}>
                      <TouchableOpacity
                        style={[
                          styles.paymentMethod,
                          {
                            backgroundColor:
                              values.paymentMethod === 'card'
                                ? colors.primary
                                : colors.card,
                            borderColor: colors.border,
                          },
                        ]}
                        onPress={() => setFieldValue('paymentMethod', 'card')}
                      >
                        <Ionicons
                          name="card-outline"
                          size={wp(5)}
                          color={values.paymentMethod === 'card' ? '#FFFFFF' : colors.text}
                        />
                        <Text
                          style={[
                            styles.paymentMethodText,
                            {
                              color:
                                values.paymentMethod === 'card' ? '#FFFFFF' : colors.text,
                            },
                          ]}
                        >
                          Card
                        </Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity
                        style={[
                          styles.paymentMethod,
                          {
                            backgroundColor:
                              values.paymentMethod === 'mobile'
                                ? colors.primary
                                : colors.card,
                            borderColor: colors.border,
                          },
                        ]}
                        onPress={() => setFieldValue('paymentMethod', 'mobile')}
                      >
                        <Ionicons
                          name="phone-portrait-outline"
                          size={wp(5)}
                          color={values.paymentMethod === 'mobile' ? '#FFFFFF' : colors.text}
                        />
                        <Text
                          style={[
                            styles.paymentMethodText,
                            {
                              color:
                                values.paymentMethod === 'mobile' ? '#FFFFFF' : colors.text,
                            },
                          ]}
                        >
                          Mobile
                        </Text>
                      </TouchableOpacity>
                    </View>
                    {errors.paymentMethod && touched.paymentMethod && (
                      <Text style={[styles.errorText, { color: colors.danger }]}>
                        {errors.paymentMethod}
                      </Text>
                    )}
                    
                    <AppInput
                      label="Notes (Optional)"
                      value={values.notes}
                      onChangeText={handleChange('notes')}
                      onBlur={handleBlur('notes')}
                      placeholder="Enter any notes for this sale"
                      multiline
                      numberOfLines={2}
                      error={errors.notes}
                      touched={touched.notes}
                      leftIcon={
                        <Ionicons
                          name="document-text-outline"
                          size={wp(5)}
                          color={colors.text + '80'}
                        />
                      }
                    />
                    
                    <View style={styles.buttonContainer}>
                      <AppButton
                        title="Cancel"
                        onPress={() => {
                          if (cartItems.length > 0) {
                            Alert.alert(
                              'Cancel Sale',
                              'Are you sure you want to cancel this sale?',
                              [
                                { text: 'No', style: 'cancel' },
                                { text: 'Yes', onPress: () => {
                                  setCartItems([]);
                                  navigation.goBack();
                                }}
                              ]
                            );
                          } else {
                            navigation.goBack();
                          }
                        }}
                        type="secondary"
                        outlined
                        style={styles.cancelButton}
                      />
                      <AppButton
                        title="Complete Sale"
                        onPress={handleSubmit}
                        loading={isSubmitting}
                        disabled={cartItems.length === 0}
                        style={styles.submitButton}
                      />
                    </View>
                  </View>
                </ScrollView>
              )}
            </Formik>
          </View>
          
          <ProductSelectorModal />
          <QuantityModal />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: wp(5),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp(2),
  },
  headerTitle: {
    fontWeight: 'bold',
  },
  addProductButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp(3),
    paddingVertical: hp(1),
    borderRadius: hp(2),
  },
  addProductText: {
    marginLeft: wp(1),
    fontWeight: '500',
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: hp(1),
  },
  cartContainer: {
    marginBottom: hp(2),
  },
  emptyCart: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: wp(5),
    borderRadius: hp(1),
  },
  emptyCartText: {
    fontWeight: 'bold',
    fontSize: wp(4),
    marginTop: hp(1),
  },
  emptyCartSubtext: {
    fontSize: wp(3.5),
    marginTop: hp(0.5),
  },
  cartList: {
    marginTop: hp(1),
  },
  cartItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: wp(3),
    borderRadius: hp(1),
    marginBottom: hp(1),
  },
  cartItemInfo: {
    flex: 1,
  },
  cartItemName: {
    fontWeight: '500',
    marginBottom: hp(0.3),
  },
  cartItemPrice: {
    fontSize: wp(3.5),
  },
  cartItemActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    width: wp(8),
    height: wp(8),
    borderRadius: wp(4),
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    marginHorizontal: wp(1),
  },
  quantityText: {
    fontWeight: 'bold',
    minWidth: wp(8),
    textAlign: 'center',
  },
  removeButton: {
    width: wp(8),
    height: wp(8),
    borderRadius: wp(4),
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: wp(2),
  },
  salesForm: {
    flex: 1,
  },
  summaryCard: {
    marginBottom: hp(2),
  },
  summaryTitle: {
    fontWeight: 'bold',
    marginBottom: hp(1),
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: hp(1),
    borderBottomWidth: 1,
  },
  discountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: hp(1),
    borderBottomWidth: 1,
  },
  summaryLabel: {
    fontSize: wp(3.8),
  },
  summaryValue: {
    fontSize: wp(3.8),
    fontWeight: '500',
  },
  discountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  discountInput: {
    width: wp(15),
    paddingHorizontal: wp(2),
    paddingVertical: hp(0.5),
    borderWidth: 1,
    borderRadius: hp(0.5),
    textAlign: 'center',
  },
  discountSymbol: {
    marginLeft: wp(1),
    fontSize: wp(3.8),
  },
  totalLabel: {
    fontSize: wp(4.5),
    fontWeight: 'bold',
  },
  totalValue: {
    fontSize: wp(4.5),
    fontWeight: 'bold',
  },
  formContainer: {
    flex: 1,
  },
  formTitle: {
    fontWeight: 'bold',
    marginBottom: hp(1.5),
  },
  inputLabel: {
    fontWeight: '500',
    marginBottom: hp(1),
  },
  paymentMethods: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: hp(2),
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp(3),
    paddingVertical: hp(1.2),
    borderRadius: hp(1),
    borderWidth: 1,
    width: wp(26),
    justifyContent: 'center',
  },
  paymentMethodText: {
    fontWeight: '500',
    marginLeft: wp(1),
  },
  errorText: {
    marginTop: hp(0.5),
    marginLeft: wp(2),
    fontSize: wp(3),
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: hp(2),
    marginBottom: hp(4),
  },
  cancelButton: {
    width: '45%',
  },
  submitButton: {
    width: '45%',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: wp(5),
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    borderRadius: hp(2),
    borderWidth: 1,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: wp(4),
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontWeight: 'bold',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: wp(4),
    paddingHorizontal: wp(3),
    paddingVertical: hp(1),
    borderRadius: hp(2),
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    paddingHorizontal: wp(2),
    paddingVertical: hp(1),
  },
  productList: {
    paddingHorizontal: wp(4),
  },
  productItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: hp(2),
    borderBottomWidth: 1,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontWeight: 'bold',
    marginBottom: hp(0.5),
  },
  productMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  productCategory: {
    fontSize: wp(3.5),
  },
  productStock: {
    fontSize: wp(3.5),
  },
  productPrice: {
    alignItems: 'center',
  },
  priceValue: {
    fontWeight: 'bold',
    marginBottom: hp(0.5),
  },
  emptyProducts: {
    padding: wp(5),
    alignItems: 'center',
  },
  emptyText: {
    fontSize: wp(4),
    textAlign: 'center',
  },
  closeButton: {
    margin: wp(4),
  },
  quantityModalContent: {
    width: wp(70),
    padding: wp(5),
    borderRadius: hp(2),
    borderWidth: 1,
    alignItems: 'center',
  },
  quantityModalTitle: {
    fontWeight: 'bold',
    marginBottom: hp(1.5),
  },
  selectedProductName: {
    fontSize: wp(4),
    fontWeight: '500',
    marginBottom: hp(0.5),
    textAlign: 'center',
  },
  stockAvailable: {
    fontSize: wp(3.5),
    marginBottom: hp(2),
  },
  quantityInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: hp(1.5),
  },
  quantityModalButton: {
    width: wp(10),
    height: wp(10),
    borderRadius: wp(5),
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  quantityModalInput: {
    width: wp(20),
    textAlign: 'center',
    paddingVertical: hp(1),
    borderWidth: 1,
    borderRadius: hp(1),
    marginHorizontal: wp(3),
    fontSize: wp(4.5),
    fontWeight: 'bold',
  },
  quantityModalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: hp(2),
  },
  quantityModalButton: {
    width: '48%',
  },
});

export default SalesEntryScreen;