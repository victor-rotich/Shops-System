import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

const AppButton = ({
  title,
  onPress,
  type = 'primary',
  size = 'medium',
  rounded = true,
  outlined = false,
  loading = false,
  disabled = false,
  icon = null,
  style = {},
  textStyle = {},
}) => {
  const { colors, fontSizes } = useTheme();

  // Determine button colors based on type
  const getButtonColors = () => {
    const colorMap = {
      primary: colors.primary,
      secondary: colors.secondary,
      success: colors.success,
      danger: colors.danger,
      warning: colors.warning,
      info: colors.info,
    };

    return colorMap[type] || colors.primary;
  };

  // Determine button size
  const getButtonSize = () => {
    const sizeMap = {
      small: {
        paddingVertical: hp(1),
        paddingHorizontal: wp(3),
        fontSize: fontSizes.sm,
      },
      medium: {
        paddingVertical: hp(1.5),
        paddingHorizontal: wp(4),
        fontSize: fontSizes.md,
      },
      large: {
        paddingVertical: hp(2),
        paddingHorizontal: wp(5),
        fontSize: fontSizes.lg,
      },
    };

    return sizeMap[size] || sizeMap.medium;
  };

  const buttonColor = getButtonColors();
  const buttonSize = getButtonSize();

  const buttonStyles = [
    styles.button,
    {
      paddingVertical: buttonSize.paddingVertical,
      paddingHorizontal: buttonSize.paddingHorizontal,
      backgroundColor: outlined ? 'transparent' : buttonColor,
      borderRadius: rounded ? hp(5) : hp(1),
      borderWidth: outlined ? 1 : 0,
      borderColor: buttonColor,
      opacity: disabled ? 0.6 : 1,
    },
    style,
  ];

  const textStyles = [
    styles.text,
    {
      fontSize: buttonSize.fontSize,
      color: outlined ? buttonColor : '#FFFFFF',
    },
    textStyle,
  ];

  return (
    <TouchableOpacity
      style={buttonStyles}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator size="small" color={outlined ? buttonColor : '#FFFFFF'} />
      ) : (
        <>
          {icon && icon}
          <Text style={textStyles}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    minWidth: wp(30),
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
    marginLeft: wp(1),
  },
});

export default AppButton;