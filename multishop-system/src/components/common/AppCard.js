import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

const AppCard = ({
  title,
  subtitle,
  children,
  onPress,
  icon,
  rightContent,
  style = {},
  contentStyle = {},
  elevated = true,
  bordered = false,
  borderColor,
  actionText,
  onAction,
}) => {
  const { colors, fontSizes, isDark } = useTheme();

  const cardStyles = [
    styles.card,
    {
      backgroundColor: colors.card,
      borderWidth: bordered ? 1 : 0,
      borderColor: borderColor || colors.border,
      elevation: elevated ? 2 : 0,
      shadowColor: isDark ? 'rgba(0, 0, 0, 0.3)' : colors.shadow,
    },
    style,
  ];

  const contentStyles = [
    styles.content,
    contentStyle,
  ];

  const CardContainer = onPress ? TouchableOpacity : View;

  return (
    <CardContainer
      style={cardStyles}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {(title || subtitle || icon || rightContent) && (
        <View style={styles.header}>
          <View style={styles.leftHeader}>
            {icon && <View style={styles.iconContainer}>{icon}</View>}
            <View style={styles.titleContainer}>
              {title && (
                <Text
                  style={[
                    styles.title,
                    { color: colors.text, fontSize: fontSizes.md },
                  ]}
                  numberOfLines={1}
                >
                  {title}
                </Text>
              )}
              {subtitle && (
                <Text
                  style={[
                    styles.subtitle,
                    { color: colors.text + 'AA', fontSize: fontSizes.sm },
                  ]}
                  numberOfLines={1}
                >
                  {subtitle}
                </Text>
              )}
            </View>
          </View>
          {rightContent && <View>{rightContent}</View>}
        </View>
      )}
      <View style={contentStyles}>{children}</View>
      {actionText && (
        <TouchableOpacity style={styles.actionContainer} onPress={onAction}>
          <Text
            style={[
              styles.actionText,
              { color: colors.primary, fontSize: fontSizes.sm },
            ]}
          >
            {actionText}
          </Text>
        </TouchableOpacity>
      )}
    </CardContainer>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: hp(1),
    marginVertical: hp(1),
    marginHorizontal: wp(1),
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: wp(4),
    paddingTop: hp(2),
    paddingBottom: hp(1),
  },
  leftHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    marginRight: wp(2),
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontWeight: '600',
  },
  subtitle: {
    marginTop: hp(0.5),
  },
  content: {
    padding: wp(4),
  },
  actionContainer: {
    padding: wp(4),
    paddingTop: 0,
    alignItems: 'flex-end',
  },
  actionText: {
    fontWeight: '600',
  },
});

export default AppCard;