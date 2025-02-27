import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import AppInput from '../../components/common/AppInput';
import AppButton from '../../components/common/AppButton';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

// Validation schema
const RegisterSchema = Yup.object().shape({
  name: Yup.string().required('Full name is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords must match')
    .required('Confirm password is required'),
});

const RegisterScreen = ({ navigation }) => {
  const { colors, fontSizes } = useTheme();
  const { register } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRegister = async (values) => {
    try {
      setIsSubmitting(true);
      
      const userData = {
        name: values.name,
        email: values.email,
        role: 'employee', // Default role for self-registration
      };
      
      await register(values.email, values.password, userData);
      
      Alert.alert(
        'Registration Successful',
        'Your account has been created. Please wait for admin approval.',
        [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
      );
    } catch (error) {
      Alert.alert('Registration Failed', error.message);
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
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back-outline" size={wp(6)} color={colors.text} />
          </TouchableOpacity>

          <View style={styles.logoContainer}>
            <Image
              source={require('../../assets/logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text
              style={[
                styles.appName,
                { color: colors.primary, fontSize: fontSizes.xxl },
              ]}
            >
              Create Account
            </Text>
            <Text
              style={[
                styles.tagline,
                { color: colors.text, fontSize: fontSizes.md },
              ]}
            >
              Join the Multi-Shop Admin team
            </Text>
          </View>

          <View style={styles.formContainer}>
            <Formik
              initialValues={{
                name: '',
                email: '',
                password: '',
                confirmPassword: '',
              }}
              validationSchema={RegisterSchema}
              onSubmit={handleRegister}
            >
              {({
                handleChange,
                handleBlur,
                handleSubmit,
                values,
                errors,
                touched,
              }) => (
                <View>
                  <AppInput
                    label="Full Name"
                    value={values.name}
                    onChangeText={handleChange('name')}
                    onBlur={handleBlur('name')}
                    placeholder="Enter your full name"
                    error={errors.name}
                    touched={touched.name}
                    leftIcon={
                      <Ionicons
                        name="person-outline"
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
                    placeholder="Enter your email"
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

                  <AppInput
                    label="Password"
                    value={values.password}
                    onChangeText={handleChange('password')}
                    onBlur={handleBlur('password')}
                    placeholder="Create a password"
                    secureTextEntry
                    error={errors.password}
                    touched={touched.password}
                    leftIcon={
                      <Ionicons
                        name="lock-closed-outline"
                        size={wp(5)}
                        color={colors.text + '80'}
                      />
                    }
                  />

                  <AppInput
                    label="Confirm Password"
                    value={values.confirmPassword}
                    onChangeText={handleChange('confirmPassword')}
                    onBlur={handleBlur('confirmPassword')}
                    placeholder="Confirm your password"
                    secureTextEntry
                    error={errors.confirmPassword}
                    touched={touched.confirmPassword}
                    leftIcon={
                      <Ionicons
                        name="lock-closed-outline"
                        size={wp(5)}
                        color={colors.text + '80'}
                      />
                    }
                  />

                  <AppButton
                    title="Create Account"
                    onPress={handleSubmit}
                    loading={isSubmitting}
                    style={styles.registerButton}
                  />
                </View>
              )}
            </Formik>
          </View>

          <View style={styles.loginContainer}>
            <Text
              style={[
                styles.loginText,
                { color: colors.text, fontSize: fontSizes.sm },
              ]}
            >
              Already have an account?
            </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('Login')}
            >
              <Text
                style={[
                  styles.loginLink,
                  { color: colors.primary, fontSize: fontSizes.sm },
                ]}
              >
                Login
              </Text>
            </TouchableOpacity>
          </View>
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
    flexGrow: 1,
    paddingHorizontal: wp(6),
    paddingBottom: hp(4),
  },
  backButton: {
    alignSelf: 'flex-start',
    padding: wp(2),
    marginTop: hp(2),
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: hp(2),
    marginBottom: hp(4),
  },
  logo: {
    width: wp(25),
    height: wp(25),
    marginBottom: hp(2),
  },
  appName: {
    fontWeight: 'bold',
    marginBottom: hp(1),
  },
  tagline: {
    textAlign: 'center',
    opacity: 0.8,
  },
  formContainer: {
    marginVertical: hp(2),
  },
  registerButton: {
    marginTop: hp(2),
    width: '100%',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: hp(4),
  },
  loginText: {
    marginRight: wp(1),
  },
  loginLink: {
    fontWeight: 'bold',
  },
});

export default RegisterScreen;