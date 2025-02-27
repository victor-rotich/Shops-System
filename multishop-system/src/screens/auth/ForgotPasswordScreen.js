import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
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
const ForgotPasswordSchema = Yup.object().shape({
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
});

const ForgotPasswordScreen = ({ navigation }) => {
  const { colors, fontSizes } = useTheme();
  const { resetPassword } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleResetPassword = async (values) => {
    try {
      setIsSubmitting(true);
      await resetPassword(values.email);
      Alert.alert(
        'Reset Email Sent',
        'Check your email for a link to reset your password.',
        [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
      );
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
        <View style={styles.content}>
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
                styles.title,
                { color: colors.text, fontSize: fontSizes.xxl },
              ]}
            >
              Reset Password
            </Text>
            <Text
              style={[
                styles.subtitle,
                { color: colors.text + '99', fontSize: fontSizes.md },
              ]}
            >
              Enter your email to receive reset instructions
            </Text>
          </View>

          <View style={styles.formContainer}>
            <Formik
              initialValues={{ email: '' }}
              validationSchema={ForgotPasswordSchema}
              onSubmit={handleResetPassword}
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

                  <AppButton
                    title="Send Reset Link"
                    onPress={handleSubmit}
                    loading={isSubmitting}
                    style={styles.resetButton}
                  />
                </View>
              )}
            </Formik>
          </View>

          <TouchableOpacity
            style={styles.loginContainer}
            onPress={() => navigation.navigate('Login')}
          >
            <Ionicons
              name="arrow-back"
              size={wp(4)}
              color={colors.primary}
              style={styles.backIcon}
            />
            <Text
              style={[
                styles.loginText,
                { color: colors.primary, fontSize: fontSizes.md },
              ]}
            >
              Back to Login
            </Text>
          </TouchableOpacity>
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
    marginTop: hp(4),
    marginBottom: hp(4),
  },
  logo: {
    width: wp(25),
    height: wp(25),
    marginBottom: hp(2),
  },
  title: {
    fontWeight: 'bold',
    marginBottom: hp(1),
  },
  subtitle: {
    textAlign: 'center',
  },
  formContainer: {
    marginVertical: hp(2),
  },
  resetButton: {
    marginTop: hp(2),
    width: '100%',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: hp(4),
  },
  backIcon: {
    marginRight: wp(1),
  },
  loginText: {
    fontWeight: '500',
  },
});

export default ForgotPasswordScreen;