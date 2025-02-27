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
  Modal,
  FlatList,
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
const TransferSchema = Yup.object().shape({
  quantity: Yup.number()
    .required('Quantity is required')
    .integer('Quantity must be a whole number')
    .min(1, 'Quantity must be at least 1'),
  notes: Yup.string(),
  toShopId: Yup.string().required('Receiving shop is required'),
});

const TransferRequestScreen = ({ navigation, route }) => {
  const { colors, fontSizes } = useTheme();
  const { shops, transferProduct, isLoading } = useApp();
  const { user } = useAuth();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showShopSelector, setShowShopSelector] = useState(false);
  const [selectedShop, setSelectedShop] = useState(null);
  const [availableShops, setAvailableShops] = useState([]);

  // Get params from route
  const { 
    inventoryId,
    productId, 
    productName, 
    shopId, 
    currentStock 
  } = route.params || {};

  useEffect(() => {
    if (!inventoryId || !productId || !shopId) {
      Alert.alert('Error', 'Product information missing');
      navigation.goBack();
      return;
    }

    // Filter shops to exclude current shop
    const filteredShops = shops.filter(shop => shop.id !== shopId);
    setAvailableShops(filteredShops);
  }, [inventoryId, productId, shopId, shops]);

  const handleSelectShop = (shop) => {
    setSelectedShop(shop);
    setShowShopSelector(false);
  };

  const handleSubmit = async (values) => {
    // Check if trying to transfer more than available
    if (parseInt(values.quantity, 10) > currentStock) {
      Alert.alert('Error', `You cannot transfer more than the current stock (${currentStock} units)`);
      return;
    }

    try {
      setIsSubmitting(true);
      
      await transferProduct(
        shopId, // from shop
        values.toShopId, // to shop
        productId,
        parseInt(values.quantity, 10),
        values.notes
      );
      
      Alert.alert(
        'Success',
        'Transfer request has been created successfully. The receiving shop will need to approve it.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderShopItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.shopItem,
        { borderBottomColor: colors.border },
      ]}
      onPress={() => handleSelectShop(item)}
    >
      <View>
        <Text style={[styles.shopName, { color: colors.text, fontSize: fontSizes.md }]}>
          {item.name}
        </Text>
        <Text style={[styles.shopLocation, { color: colors.text + '80', fontSize: fontSizes.sm }]}>
          {item.location}
        </Text>
      </View>
      <Ionicons
        name="chevron-forward"
        size={wp(5)}
        color={colors.text + '80'}
      />
    </TouchableOpacity>
  );

  const ShopSelectorModal = () => (
    <Modal
      visible={showShopSelector}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowShopSelector(false)}
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
              Select Receiving Shop
            </Text>
            <TouchableOpacity onPress={() => setShowShopSelector(false)}>
              <Ionicons name="close" size={wp(6)} color={colors.text} />
            </TouchableOpacity>
          </View>
          
          {availableShops.length === 0 ? (
            <View style={styles.emptyShops}>
              <Text style={[styles.emptyText, { color: colors.text }]}>
                No other shops available for transfer
              </Text>
            </View>
          ) : (
            <FlatList
              data={availableShops}
              renderItem={renderShopItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.shopList}
            />
          )}
          
          <AppButton
            title="Cancel"
            onPress={() => setShowShopSelector(false)}
            style={styles.closeButton}
          />
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
              Transfer Request
            </Text>
            <View style={styles.placeholder} />
          </View>

          <AppCard style={styles.productCard}>
            <Text style={[styles.productTitle, { color: colors.text, fontSize: fontSizes.lg }]}>
              {productName}
            </Text>
            <Text style={[styles.stockInfo, { color: colors.text }]}>
              Available Stock: <Text style={{ fontWeight: 'bold' }}>{currentStock} units</Text>
            </Text>
          </AppCard>

          <Formik
            initialValues={{
              quantity: '',
              notes: '',
              toShopId: selectedShop ? selectedShop.id : '',
            }}
            enableReinitialize
            validationSchema={TransferSchema}
            onSubmit={handleSubmit}
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
              <View style={styles.formContainer}>
                <TouchableOpacity
                  style={[
                    styles.shopSelector,
                    {
                      borderColor: errors.toShopId && touched.toShopId ? colors.danger : colors.border,
                      backgroundColor: colors.card,
                    },
                  ]}
                  onPress={() => setShowShopSelector(true)}
                >
                  <Ionicons
                    name="business-outline"
                    size={wp(5)}
                    color={colors.text + '80'}
                    style={styles.shopIcon}
                  />
                  <View style={styles.shopSelectorTextContainer}>
                    <Text
                      style={[
                        styles.shopSelectorLabel,
                        { color: colors.text + '80', fontSize: fontSizes.sm },
                      ]}
                    >
                      To Shop
                    </Text>
                    <Text
                      style={[
                        styles.shopSelectorValue,
                        {
                          color: selectedShop ? colors.text : colors.text + '60',
                          fontSize: fontSizes.md,
                        },
                      ]}
                    >
                      {selectedShop ? selectedShop.name : 'Select receiving shop'}
                    </Text>
                  </View>
                  <Ionicons
                    name="chevron-down"
                    size={wp(5)}
                    color={colors.text + '80'}
                  />
                </TouchableOpacity>
                {errors.toShopId && touched.toShopId && (
                  <Text style={[styles.errorText, { color: colors.danger }]}>
                    {errors.toShopId}
                  </Text>
                )}

                <AppInput
                  label="Quantity to Transfer"
                  value={values.quantity}
                  onChangeText={handleChange('quantity')}
                  onBlur={handleBlur('quantity')}
                  placeholder="Enter quantity"
                  keyboardType="numeric"
                  error={errors.quantity}
                  touched={touched.quantity}
                  leftIcon={
                    <Ionicons
                      name="swap-horizontal-outline"
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
                  placeholder="Enter any notes about this transfer"
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
                    <Text style={[styles.summaryValue, { color: colors.text }]}>{currentStock} units</Text>
                  </View>
                  <View style={[styles.summaryRow, { borderColor: colors.border }]}>
                    <Text style={[styles.summaryLabel, { color: colors.text }]}>Transferring:</Text>
                    <Text style={[styles.summaryValue, { color: colors.danger }]}>
                      -{values.quantity || 0} units
                    </Text>
                  </View>
                  <View style={[styles.summaryRow, { borderColor: colors.border }]}>
                    <Text style={[styles.summaryLabel, { color: colors.text, fontWeight: 'bold' }]}>Remaining Stock:</Text>
                    <Text style={[styles.summaryValue, { color: colors.primary, fontWeight: 'bold' }]}>
                      {currentStock - parseInt(values.quantity || 0, 10)} units
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
                    title="Request Transfer"
                    onPress={() => {
                      // Update toShopId from selected shop
                      if (selectedShop) {
                        setFieldValue('toShopId', selectedShop.id);
                        handleSubmit();
                      } else {
                        Alert.alert('Error', 'Please select a receiving shop');
                      }
                    }}
                    loading={isSubmitting}
                    style={styles.submitButton}
                  />
                </View>
              </View>
            )}
          </Formik>
          
          <ShopSelectorModal />
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
    marginBottom: hp(1),
  },
  stockInfo: {
    fontSize: wp(4),
  },
  formContainer: {
    marginTop: hp(1),
  },
  shopSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: hp(1),
    padding: wp(3),
    marginVertical: hp(1),
  },
  shopIcon: {
    marginRight: wp(2),
  },
  shopSelectorTextContainer: {
    flex: 1,
  },
  shopSelectorLabel: {
    marginBottom: 2,
  },
  shopSelectorValue: {
    fontWeight: '500',
  },
  errorText: {
    marginTop: hp(0.5),
    marginLeft: wp(3),
    fontSize: wp(3),
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
  shopList: {
    paddingHorizontal: wp(4),
    paddingBottom: hp(2),
  },
  shopItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: hp(2),
    borderBottomWidth: 1,
  },
  shopName: {
    fontWeight: 'bold',
    marginBottom: hp(0.5),
  },
  shopLocation: {
    fontSize: wp(3.5),
  },
  emptyShops: {
    padding: wp(4),
    alignItems: 'center',
  },
  emptyText: {
    fontSize: wp(4),
    textAlign: 'center',
  },
  closeButton: {
    margin: wp(4),
  },
});

export default TransferRequestScreen;