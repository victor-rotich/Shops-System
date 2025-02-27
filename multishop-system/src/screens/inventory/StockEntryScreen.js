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

// Validation schema
const StockEntrySchema = Yup.object().shape({
  quantityToAdd: Yup.number()
    .required('Quantity is required')
    .integer('Quantity must be a whole number')
    .min(1, 'Quantity must be at least 1'),
  notes: Yup.string(),
  lowStockThreshold: Yup.number()
    .integer('Low stock threshold must be a whole number')
    .min(0, 'Low stock threshold must be at least 0'),
});

const StockEntryScreen = ({ navigation, route }) => {
  const { colors, fontSizes } = useTheme();
  const { inventory, products, shops, updateInventory, isLoading } = useApp();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inventoryItem, setInventoryItem] = useState(null);
  const [product, setProduct] = useState(null);
  const [shop, setShop] = useState(null);

  // Get inventoryId from route params
  const { inventoryId, productName } = route.params || {};

  useEffect(() => {
    if (!inventoryId) {
      Alert.alert('Error', 'Inventory information missing');
      navigation.goBack();
      return;
    }

    // Find the inventory item
    const item = inventory.find(item => item.id === inventoryId);
    if (!item) {
      Alert.alert('Error', 'Inventory item not found');
      navigation.goBack();
      return;
    }
    
    setInventoryItem(item);
    
    // Find associated product and shop
    const productData = products.find(p => p.id === item.productId);
    const shopData = shops.find(s => s.id === item.shopId);
    
    if (productData) setProduct(productData);
    if (shopData) setShop(shopData);
  }, [inventoryId, inventory, products, shops]);

  const handleSubmit = async (values) => {
    try {
      setIsSubmitting(true);
      
      // Calculate new stock level
      const newStockLevel = inventoryItem.currentStock + parseInt(values.quantityToAdd, 10);
      
      // Update inventory with new stock level
      const updatedInventory = {
        ...inventoryItem,
        currentStock: newStockLevel,
        lowStockThreshold: parseInt(values.lowStockThreshold, 10),
        lastRestockDate: new Date().toISOString(),
        lastRestockQuantity: parseInt(values.quantityToAdd, 10),
        notes: values.notes || '',
      };
      
      await updateInventory(inventoryItem.id, updatedInventory);
      
      Alert.alert(
        'Success',
        `Stock updated successfully. New stock level: ${newStockLevel} units.`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!inventoryItem || !product) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loaderContainer}>
          <Text style={{ color: colors.text }}>Loading inventory information...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back-outline" size={wp(6)} color={colors.text} />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: colors.text, fontSize: fontSizes.xl }]}>
              Add Stock
            </Text>
            <View style={styles.placeholder} />
          </View>

          <AppCard style={styles.productCard}>
            <Text style={[styles.productTitle, { color: colors.text, fontSize: fontSizes.lg }]}>
              {product.name}
            </Text>
            {shop && (
              <Text style={[styles.shopName, { color: colors.text + '80', fontSize: fontSizes.sm }]}>
                Shop: {shop.name}
              </Text>
            )}
            <View style={styles.stockInfo}>
              <View style={styles.stockDetail}>
                <Text style={[styles.stockLabel, { color: colors.text + '80' }]}>
                  Current Stock
                </Text>
                <Text style={[styles.stockValue, { color: colors.text }]}>
                  {inventoryItem.currentStock} units
                </Text>
              </View>
              <View style={styles.stockDetail}>
                <Text style={[styles.stockLabel, { color: colors.text + '80' }]}>
                  Low Stock Alert
                </Text>
                <Text style={[styles.stockValue, { color: colors.text }]}>
                  {inventoryItem.lowStockThreshold} units
                </Text>
              </View>
            </View>
            {inventoryItem.lastRestockDate && (
              <Text style={[styles.lastRestock, { color: colors.text + '80', fontSize: fontSizes.xs }]}>
                Last restock: {new Date(inventoryItem.lastRestockDate).toLocaleDateString()} (Added {inventoryItem.lastRestockQuantity || 'unknown'} units)
              </Text>
            )}
          </AppCard>

          <Formik
            initialValues={{
              quantityToAdd: '',
              notes: '',
              lowStockThreshold: inventoryItem.lowStockThreshold.toString(),
            }}
            validationSchema={StockEntrySchema}
            onSubmit={handleSubmit}
          >
            {({
              handleChange,
              handleBlur,
              handleSubmit,
              values,
              errors,
              touched,
            }) => (
              <View style={styles.formContainer}>
                <AppInput
                  label="Quantity to Add"
                  value={values.quantityToAdd}
                  onChangeText={handleChange('quantityToAdd')}
                  onBlur={handleBlur('quantityToAdd')}
                  placeholder="Enter quantity"
                  keyboardType="numeric"
                  error={errors.quantityToAdd}
                  touched={touched.quantityToAdd}
                  leftIcon={
                    <Ionicons
                      name="add-circle-outline"
                      size={wp(5)}
                      color={colors.text + '80'}
                    />
                  }
                />

                <AppInput
                  label="Low Stock Threshold"
                  value={values.lowStockThreshold}
                  onChangeText={handleChange('lowStockThreshold')}
                  onBlur={handleBlur('lowStockThreshold')}
                  placeholder="Enter low stock threshold"
                  keyboardType="numeric"
                  error={errors.lowStockThreshold}
                  touched={touched.lowStockThreshold}
                  leftIcon={
                    <Ionicons
                      name="warning-outline"
                      size={wp(5)}
                      color={colors.text + '80'}
                    />
                  }
                />

                <AppInput
                  label="Notes (Optional)"
                  value={values.notes}
                  onChangeText={handleChange('notes')}
                  onBlur={handleBlur('notes')}
                  placeholder="Enter notes about this stock entry"
                  multiline
                  numberOfLines={3}
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

                <View style={styles.summaryContainer}>
                  <Text style={[styles.summaryTitle, { color: colors.text, fontSize: fontSizes.md }]}>
                    Summary
                  </Text>
                  <View style={[styles.summaryRow, { borderColor: colors.border }]}>
                    <Text style={[styles.summaryLabel, { color: colors.text }]}>Current Stock:</Text>
                    <Text style={[styles.summaryValue, { color: colors.text }]}>{inventoryItem.currentStock} units</Text>
                  </View>
                  <View style={[styles.summaryRow, { borderColor: colors.border }]}>
                    <Text style={[styles.summaryLabel, { color: colors.text }]}>Adding:</Text>
                    <Text style={[styles.summaryValue, { color: colors.success }]}>
                      +{values.quantityToAdd || 0} units
                    </Text>
                  </View>
                  <View style={[styles.summaryRow, { borderColor: colors.border }]}>
                    <Text style={[styles.summaryLabel, { color: colors.text, fontWeight: 'bold' }]}>New Stock Level:</Text>
                    <Text style={[styles.summaryValue, { color: colors.primary, fontWeight: 'bold' }]}>
                      {inventoryItem.currentStock + parseInt(values.quantityToAdd || 0, 10)} units
                    </Text>
                  </View>
                </View>

                <View style={styles.buttonContainer}>
                  <AppButton
                    title="Cancel"
                    onPress={() => navigation.goBack()}
                    type="secondary"
                    outlined
                    style={styles.cancelButton}
                  />
                  <AppButton
                    title="Update Stock"
                    onPress={handleSubmit}
                    loading={isSubmitting}
                    style={styles.submitButton}
                  />
                </View>
              </View>
            )}
          </Formik>
        </ScrollView>
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
  scrollContent: {
    paddingHorizontal: wp(5),
    paddingBottom: hp(4),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: hp(2),
  },
  backButton: {
    padding: wp(2),
  },
  headerTitle: {
    fontWeight: 'bold',
  },
  placeholder: {
    width: wp(10),
  },
  productCard: {
    marginBottom: hp(2),
  },
  productTitle: {
    fontWeight: 'bold',
    marginBottom: hp(0.5),
  },
  shopName: {
    marginBottom: hp(1.5),
  },
  stockInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: hp(1),
  },
  stockDetail: {
    alignItems: 'center',
  },
  stockLabel: {
    fontSize: wp(3.5),
    marginBottom: hp(0.5),
  },
  stockValue: {
    fontWeight: 'bold',
    fontSize: wp(4),
  },
  lastRestock: {
    marginTop: hp(1),
  },
  formContainer: {
    marginTop: hp(1),
  },
  summaryContainer: {
    marginTop: hp(2),
    marginBottom: hp(2),
  },
  summaryTitle: {
    fontWeight: 'bold',
    marginBottom: hp(1),
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    paddingVertical: hp(1),
  },
  summaryLabel: {
    fontSize: wp(3.5),
  },
  summaryValue: {
    fontSize: wp(3.5),
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: hp(2),
  },
  cancelButton: {
    width: '45%',
  },
  submitButton: {
    width: '45%',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default StockEntryScreen;