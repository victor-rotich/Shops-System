import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

const AppInput = ({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  keyboardType = 'default',
  autoCapitalize = 'none',
  error,
  touched,
  leftIcon,
  rightIcon,
  multiline = false,
  numberOfLines = 1,
  style = {},
  inputStyle = {},
  containerStyle = {},
  onRightIconPress,
  onBlur,
  onFocus,
  editable = true,
  maxLength,
  autoCorrect = false,
  returnKeyType = 'next',
  onSubmitEditing,
  blurOnSubmit = false,
}) => {
  const { colors, fontSizes } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const handleFocus = () => {
    setIsFocused(true);
    if (onFocus) onFocus();
  };

  const handleBlur = () => {
    setIsFocused(false);
    if (onBlur) onBlur();
  };

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  // Determine border color based on state and validation
  const getBorderColor = () => {
    if (error && touched) return colors.danger;
    if (isFocused) return colors.primary;
    return colors.border;
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text
          style={[
            styles.label,
            {
              color: error && touched ? colors.danger : colors.text,
              fontSize: fontSizes.sm,
            },
          ]}
        >
          {label}
        </Text>
      )}
      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: editable ? colors.inputBackground : colors.inputBackground + '50',
            borderColor: getBorderColor(),
            borderWidth: isFocused ? 1.5 : 1,
          },
          style,
        ]}
      >
        {leftIcon && <View style={styles.iconContainer}>{leftIcon}</View>}

        <TextInput
          style={[
            styles.input,
            {
              color: colors.text,
              fontSize: fontSizes.md,
              textAlignVertical: multiline ? 'top' : 'center',
              minHeight: multiline ? hp(15) : undefined,
            },
            inputStyle,
          ]}
          placeholder={placeholder}
          placeholderTextColor={colors.text + '80'}
          value={value}
          onChangeText={onChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          multiline={multiline}
          numberOfLines={multiline ? numberOfLines : 1}
          editable={editable}
          maxLength={maxLength}
          autoCorrect={autoCorrect}
          returnKeyType={returnKeyType}
          onSubmitEditing={onSubmitEditing}
          blurOnSubmit={blurOnSubmit}
        />

        {secureTextEntry && (
          <TouchableOpacity
            style={styles.iconContainer}
            onPress={togglePasswordVisibility}
          >
            <Ionicons
              name={isPasswordVisible ? 'eye-off' : 'eye'}
              size={wp(5)}
              color={colors.text + '80'}
            />
          </TouchableOpacity>
        )}

        {rightIcon && (
          <TouchableOpacity
            style={styles.iconContainer}
            onPress={onRightIconPress}
            disabled={!onRightIconPress}
          >
            {rightIcon}
          </TouchableOpacity>
        )}
      </View>
      {error && touched && (
        <Text
          style={[
            styles.errorText,
            { color: colors.danger, fontSize: fontSizes.sm },
          ]}
        >
          {error}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: hp(1),
    width: '100%',
  },
  label: {
    marginBottom: hp(0.5),
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: hp(1),
    overflow: 'hidden',
  },
  input: {
    flex: 1,
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(3),
  },
  iconContainer: {
    paddingHorizontal: wp(3),
  },
  errorText: {
    marginTop: hp(0.5),
  },
});

export default AppInput;