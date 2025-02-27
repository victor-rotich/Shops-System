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
const LoginSchema = Yup.object().shape({
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
});

const LoginScreen = ({ navigation }) => {
  const { colors, fontSizes, isDark } = useTheme();
  const { login } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async (values) => {
    try {
      setIsSubmitting(true);
      await login(values.email, values.password);
      // Navigation will be handled by the AppNavigator once user state changes
    } catch (error) {
      Alert.alert('Login Failed', error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
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
              Multi-Shop Admin
            </Text>
            <Text
              style={[
                styles.tagline,
                { color: colors.text, fontSize: fontSizes.md },
              ]}
            >
              Manage your shops from anywhere
            </Text>
          </View>

          <View style={styles.formContainer}>
            <Formik
              initialValues={{ email: '', password: '' }}
              validationSchema={LoginSchema}
              onSubmit={handleLogin}
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
                    label="Email"
                    value={values.email}
                    onChangeText={handleChange('email')}
                    onBlur={handleBlur('email')}
                    placeholder="Enter your email"
                    keyboardType="email-address"
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
                    placeholder="Enter your password"
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

                  <TouchableOpacity
                    style={styles.forgotPassword}
                    onPress={() => navigation.navigate('ForgotPassword')}
                  >
                    <Text
                      style={[
                        styles.forgotPasswordText,
                        { color: colors.primary, fontSize: fontSizes.sm },
                      ]}
                    >
                      Forgot Password?
                    </Text>
                  </TouchableOpacity>

                  <AppButton
                    title="Login"
                    onPress={handleSubmit}
                    loading={isSubmitting}
                    style={styles.loginButton}
                  />
                </View>
              )}
            </Formik>
          </View>

          <View style={styles.registerContainer}>
            <Text
              style={[
                styles.registerText,
                { color: colors.text, fontSize: fontSizes.sm },
              ]}
            >
              Don't have an account?
            </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('Register')}
            >
              <Text
                style={[
                  styles.registerLink,
                  { color: colors.primary, fontSize: fontSizes.sm },
                ]}
              >
                Register
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
  logoContainer: {
    alignItems: 'center',
    marginTop: hp(6),
    marginBottom: hp(4),
  },
  logo: {
    width: wp(30),
    height: wp(30),
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
  forgotPassword: {
    alignSelf: 'flex-end',
    marginVertical: hp(1),
  },
  forgotPasswordText: {
    fontWeight: '500',
  },
  loginButton: {
    marginTop: hp(2),
    width: '100%',
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: hp(4),
  },
  registerText: {
    marginRight: wp(1),
  },
  registerLink: {
    fontWeight: 'bold',
  },
});

export default LoginScreen;