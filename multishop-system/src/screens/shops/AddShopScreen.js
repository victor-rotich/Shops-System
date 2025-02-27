import React, { useState } from 'react';
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
import AppInput from '../../components/common/AppInput';
import AppButton from '../../components/common/AppButton';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

// Validation schema
const ShopSchema = Yup.object().shape({
  name: Yup.string().required('Shop name is required'),
  location: Yup.string().required('Location is required'),
  phone: Yup.string().required('Phone number is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  openingTime: Yup.string().required('Opening time is required'),
  closingTime: Yup.string().required('Closing time is required'),
  description: Yup.string(),
});

const AddShopScreen = ({ navigation }) => {
  const { colors, fontSizes } = useTheme();
  const { addShop } = useApp();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const initialValues = {
    name: '',
    location: '',
    phone: '',
    email: '',
    openingTime: '09:00',
    closingTime: '18:00',
    description: '',
  };

  const handleAddShop = async (values) => {
    try {
      setIsSubmitting(true);
      
      const shopData = {
        ...values,
        status: 'active',
        createdAt: new Date().toISOString(),
      };
      
      await addShop(shopData);
      Alert.alert('Success', 'Shop has been added successfully');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

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
              Add New Shop
            </Text>
            <View style={styles.placeholder} />
          </View>

          <Formik
            initialValues={initialValues}
            validationSchema={ShopSchema}
            onSubmit={handleAddShop}
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
                  label="Shop Name"
                  value={values.name}
                  onChangeText={handleChange('name')}
                  onBlur={handleBlur('name')}
                  placeholder="Enter shop name"
                  error={errors.name}
                  touched={touched.name}
                  leftIcon={
                    <Ionicons
                      name="business-outline"
                      size={wp(5)}
                      color={colors.text + '80'}
                    />
                  }
                />

                <AppInput
                  label="Location"
                  value={values.location}
                  onChangeText={handleChange('location')}
                  onBlur={handleBlur('location')}
                  placeholder="Enter shop address"
                  error={errors.location}
                  touched={touched.location}
                  leftIcon={
                    <Ionicons
                      name="location-outline"
                      size={wp(5)}
                      color={colors.text + '80'}
                    />
                  }
                />

                <AppInput
                  label="Phone Number"
                  value={values.phone}
                  onChangeText={handleChange('phone')}
                  onBlur={handleBlur('phone')}
                  placeholder="Enter phone number"
                  keyboardType="phone-pad"
                  error={errors.phone}
                  touched={touched.phone}
                  leftIcon={
                    <Ionicons
                      name="call-outline"
                      size={wp(5)}
                      color={colors.text + '80'}
                    />
                  }
                />

                <AppInput
                  label="Email"
                  value={values.email}
                  onChangeText={handleChange('email')}
                  onBlur={handleBlur('email')}
                  placeholder="Enter email address"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  error={errors.email}
                  touched={touched.email}
                  leftIcon={
                    <Ionicons
                      name="mail-outline"
                      size={wp(5)}
                      color={colors.text + '80'}
                    />
                  }
                />

                <View style={styles.rowInputs}>
                  <View style={styles.halfInput}>
                    <AppInput
                      label="Opening Time"
                      value={values.openingTime}
                      onChangeText={handleChange('openingTime')}
                      onBlur={handleBlur('openingTime')}
                      placeholder="HH:MM"
                      error={errors.openingTime}
                      touched={touched.openingTime}
                      leftIcon={
                        <Ionicons
                          name="time-outline"
                          size={wp(5)}
                          color={colors.text + '80'}
                        />
                      }
                    />
                  </View>
                  <View style={styles.halfInput}>
                    <AppInput
                      label="Closing Time"
                      value={values.closingTime}
                      onChangeText={handleChange('closingTime')}
                      onBlur={handleBlur('closingTime')}
                      placeholder="HH:MM"
                      error={errors.closingTime}
                      touched={touched.closingTime}
                      leftIcon={
                        <Ionicons
                          name="time-outline"
                          size={wp(5)}
                          color={colors.text + '80'}
                        />
                      }
                    />
                  </View>
                </View>

                <AppInput
                  label="Description (Optional)"
                  value={values.description}
                  onChangeText={handleChange('description')}
                  onBlur={handleBlur('description')}
                  placeholder="Enter shop description"
                  multiline
                  numberOfLines={4}
                  error={errors.description}
                  touched={touched.description}
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
                    onPress={() => navigation.goBack()}
                    type="secondary"
                    outlined
                    style={styles.cancelButton}
                  />
                  <AppButton
                    title="Add Shop"
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
  formContainer: {
    marginTop: hp(1),
  },
  rowInputs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    width: '48%',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: hp(3),
  },
  cancelButton: {
    width: '45%',
  },
  submitButton: {
    width: '45%',
  },
});

export default AddShopScreen;