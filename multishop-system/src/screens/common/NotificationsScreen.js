import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useApp } from '../../context/AppContext';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

const NotificationsScreen = ({ navigation }) => {
  const { colors, fontSizes } = useTheme();
  const { notifications, markNotificationAsRead, fetchInitialData } = useApp();
  
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchInitialData();
    setRefreshing(false);
  };

  const handleNotificationPress = (notification) => {
    if (!notification.read) {
      markNotificationAsRead(notification.id);
    }
    
    // Navigate based on notification type
    switch (notification.type) {
      case 'low_stock':
        navigation.navigate('Inventory', { screen: 'InventoryHome' });
        break;
      case 'delivery_status_update':
        navigation.navigate('Deliveries', { 
          screen: 'DeliveryDetail', 
          params: { deliveryId: notification.data?.deliveryId } 
        });
        break;
      case 'transfer_request':
        navigation.navigate('Inventory', { screen: 'InventoryHome' });
        break;
      case 'new_delivery':
        navigation.navigate('Deliveries', { screen: 'DeliveriesHome' });
        break;
      default:
        // Default action for other notification types
        break;
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'low_stock':
        return <Ionicons name="alert-circle" size={wp(6)} color={colors.warning} />;
      case 'delivery_status_update':
        return <Ionicons name="bicycle" size={wp(6)} color={colors.primary} />;
      case 'transfer_request':
        return <Ionicons name="swap-horizontal" size={wp(6)} color={colors.secondary} />;
      case 'new_delivery':
        return <Ionicons name="cube" size={wp(6)} color={colors.info} />;
      default:
        return <Ionicons name="notifications" size={wp(6)} color={colors.text} />;
    }
  };

  const renderNotificationItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.notificationItem,
        {
          backgroundColor: item.read ? colors.card : colors.primary + '10',
          borderLeftColor: item.read ? colors.border : colors.primary,
        },
      ]}
      onPress={() => handleNotificationPress(item)}
    >
      <View style={styles.notificationIcon}>
        {getNotificationIcon(item.type)}
      </View>
      <View style={styles.notificationContent}>
        <Text
          style={[
            styles.notificationMessage,
            {
              color: colors.text,
              fontSize: fontSizes.md,
              fontWeight: item.read ? 'normal' : 'bold',
            },
          ]}
        >
          {item.message}
        </Text>
        <Text
          style={[
            styles.notificationTime,
            { color: colors.text + '80', fontSize: fontSizes.sm },
          ]}
        >
          {new Date(item.createdAt).toLocaleString()}
        </Text>
      </View>
      {!item.read && (
        <View
          style={[styles.unreadIndicator, { backgroundColor: colors.primary }]}
        />
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back-outline" size={wp(6)} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text, fontSize: fontSizes.xl }]}>
          Notifications
        </Text>
        <View style={styles.placeholder} />
      </View>

      <FlatList
        data={notifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))}
        renderItem={renderNotificationItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.notificationsList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="notifications-off-outline" size={wp(15)} color={colors.text + '40'} />
            <Text style={[styles.emptyText, { color: colors.text }]}>
              No notifications yet
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: wp(5),
    paddingVertical: hp(2),
  },
  backButton: {
    padding: wp(1),
  },
  headerTitle: {
    fontWeight: 'bold',
  },
  placeholder: {
    width: wp(8),
  },
  notificationsList: {
    paddingHorizontal: wp(5),
    paddingBottom: hp(4),
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: wp(4),
    borderRadius: hp(1),
    marginBottom: hp(1.5),
    borderLeftWidth: wp(1),
  },
  notificationIcon: {
    marginRight: wp(3),
  },
  notificationContent: {
    flex: 1,
  },
  notificationMessage: {
    marginBottom: hp(0.5),
  },
  notificationTime: {
    fontStyle: 'italic',
  },
  unreadIndicator: {
    width: wp(2.5),
    height: wp(2.5),
    borderRadius: wp(1.25),
    marginLeft: wp(2),
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: hp(10),
  },
  emptyText: {
    marginTop: hp(2),
    fontSize: wp(4),
  },
});

export default NotificationsScreen;