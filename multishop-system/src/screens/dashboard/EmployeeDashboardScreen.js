import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import AppCard from '../../components/common/AppCard';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

const EmployeeDashboardScreen = ({ navigation }) => {
  const { colors, fontSizes } = useTheme();
  const { user } = useAuth();
  const {
    shops,
    sales,
    inventory,
    notifications,
    isLoading,
    fetchInitialData,
  } = useApp();

  const [refreshing, setRefreshing] = useState(false);
  const [shop, setShop] = useState(null);
  const [salesCount, setSalesCount] = useState(0);
  const [lowStockCount, setLowStockCount] = useState(0);
  const [attendanceStatus, setAttendanceStatus] = useState('Not Checked In');

  useEffect(() => {
    // Find employee's shop
    if (user && user.shopId) {
      const employeeShop = shops.find(s => s.id === user.shopId);
      if (employeeShop) {
        setShop(employeeShop);
      }
    }
  }, [user, shops]);

  useEffect(() => {
    if (shop) {
      // Count today's sales by this employee
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const todaySales = sales.filter(sale => 
        sale.shopId === shop.id && 
        sale.createdBy === user.uid &&
        new Date(sale.createdAt) >= today
      );
      
      setSalesCount(todaySales.length);
      
      // Count low stock items
      const lowStock = inventory.filter(item => 
        item.shopId === shop.id && 
        item.currentStock <= item.lowStockThreshold
      );
      
      setLowStockCount(lowStock.length);
      
      // For demo purposes, just set a random attendance status
      const statuses = ['Checked In', 'Not Checked In'];
      setAttendanceStatus(statuses[Math.floor(Math.random() * statuses.length)]);
    }
  }, [shop, sales, inventory, user]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchInitialData();
    setRefreshing(false);
  };

  // Recent inventory activity
  const getInventoryAlerts = () => {
    if (!shop) return [];
    
    return inventory
      .filter(item => 
        item.shopId === shop.id && 
        item.currentStock <= item.lowStockThreshold
      )
      .map(item => {
        const product = products.find(p => p.id === item.productId) || { name: 'Unknown Product' };
        return {
          id: item.id,
          productName: product.name,
          currentStock: item.currentStock,
          threshold: item.lowStockThreshold,
          status: item.currentStock === 0 ? 'out' : 'low',
        };
      });
  };

  const renderInventoryAlert = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.alertItem,
        { 
          backgroundColor: item.status === 'out' ? colors.danger + '15' : colors.warning + '15',
          borderLeftColor: item.status === 'out' ? colors.danger : colors.warning,
        },
      ]}
      onPress={() => navigation.navigate('Inventory', { screen: 'InventoryView' })}
    >
      <Ionicons
        name={item.status === 'out' ? 'alert-circle' : 'warning'}
        size={wp(6)}
        color={item.status === 'out' ? colors.danger : colors.warning}
        style={styles.alertIcon}
      />
      <View style={styles.alertContent}>
        <Text style={[styles.alertTitle, { color: colors.text, fontSize: fontSizes.md }]}>
          {item.productName}
        </Text>
        <Text style={[styles.alertDescription, { color: colors.text + '99' }]}>
          {item.status === 'out' ? 'Out of stock' : `Low stock: ${item.currentStock} units left`}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.greeting, { color: colors.text, fontSize: fontSizes.lg }]}>
            Hello, {user?.name || 'Employee'}
          </Text>
          <Text style={[styles.subtitle, { color: colors.text + 'AA', fontSize: fontSizes.sm }]}>
            {shop ? shop.name : 'Loading shop data...'}
          </Text>
        </View>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={[
              styles.iconButton,
              { backgroundColor: colors.background, borderColor: colors.border },
            ]}
            onPress={() => navigation.navigate('Notifications')}
          >
            <Ionicons name="notifications-outline" size={wp(5.5)} color={colors.text} />
            {notifications.filter((n) => !n.read).length > 0 && (
              <View
                style={[
                  styles.notificationBadge,
                  { backgroundColor: colors.notification },
                ]}
              >
                <Text style={styles.badgeText}>
                  {notifications.filter((n) => !n.read).length}
                </Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.iconButton,
              { backgroundColor: colors.background, borderColor: colors.border },
            ]}
            onPress={() => navigation.navigate('Profile')}
          >
            <Ionicons name="person-outline" size={wp(5.5)} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Status Cards */}
        <View style={styles.statusContainer}>
          <AppCard
            style={[
              styles.statusCard,
              { backgroundColor: colors.primary + '15' },
            ]}
          >
            <View style={styles.statusIconContainer}>
              <Ionicons name="cash-outline" size={wp(8)} color={colors.primary} />
            </View>
            <Text style={[styles.statusValue, { color: colors.text, fontSize: fontSizes.xl }]}>
              {salesCount}
            </Text>
            <Text style={[styles.statusLabel, { color: colors.text + '99' }]}>
              Today's Sales
            </Text>
          </AppCard>

          <AppCard
            style={[
              styles.statusCard,
              { backgroundColor: colors.warning + '15' },
            ]}
          >
            <View style={styles.statusIconContainer}>
              <Ionicons name="alert-circle-outline" size={wp(8)} color={colors.warning} />
            </View>
            <Text style={[styles.statusValue, { color: colors.text, fontSize: fontSizes.xl }]}>
              {lowStockCount}
            </Text>
            <Text style={[styles.statusLabel, { color: colors.text + '99' }]}>
              Low Stock Items
            </Text>
          </AppCard>

          <AppCard
            style={[
              styles.statusCard,
              {
                backgroundColor:
                  attendanceStatus === 'Checked In'
                    ? colors.success + '15'
                    : colors.danger + '15',
              },
            ]}
          >
            <View style={styles.statusIconContainer}>
              <Ionicons
                name={
                  attendanceStatus === 'Checked In'
                    ? 'checkmark-circle-outline'
                    : 'time-outline'
                }
                size={wp(8)}
                color={
                  attendanceStatus === 'Checked In' ? colors.success : colors.danger
                }
              />
            </View>
            <Text
              style={[
                styles.statusValue,
                {
                  color:
                    attendanceStatus === 'Checked In'
                      ? colors.success
                      : colors.danger,
                  fontSize: fontSizes.md,
                  marginTop: hp(1),
                },
              ]}
            >
              {attendanceStatus}
            </Text>
            <TouchableOpacity
              style={[
                styles.checkInButton,
                {
                  backgroundColor:
                    attendanceStatus === 'Checked In'
                      ? colors.danger + '20'
                      : colors.success + '20',
                },
              ]}
              onPress={() => {
                setAttendanceStatus(
                  attendanceStatus === 'Checked In'
                    ? 'Not Checked In'
                    : 'Checked In'
                );
              }}
            >
              <Text
                style={[
                  styles.checkInButtonText,
                  {
                    color:
                      attendanceStatus === 'Checked In'
                        ? colors.danger
                        : colors.success,
                  },
                ]}
              >
                {attendanceStatus === 'Checked In' ? 'Check Out' : 'Check In'}
              </Text>
            </TouchableOpacity>
          </AppCard>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          <Text
            style={[
              styles.sectionTitle,
              { color: colors.text, fontSize: fontSizes.lg },
            ]}
          >
            Quick Actions
          </Text>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity
              style={[
                styles.quickActionItem,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
              onPress={() => navigation.navigate('Sales', { screen: 'SalesEntry' })}
            >
              <View
                style={[
                  styles.quickActionIcon,
                  { backgroundColor: colors.primary + '20' },
                ]}
              >
                <Ionicons name="cash-outline" size={wp(6)} color={colors.primary} />
              </View>
              <Text
                style={[
                  styles.quickActionText,
                  { color: colors.text, fontSize: fontSizes.sm },
                ]}
              >
                New Sale
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.quickActionItem,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
              onPress={() => navigation.navigate('Inventory', { screen: 'InventoryView' })}
            >
              <View
                style={[
                  styles.quickActionIcon,
                  { backgroundColor: colors.secondary + '20' },
                ]}
              >
                <Ionicons name="cube-outline" size={wp(6)} color={colors.secondary} />
              </View>
              <Text
                style={[
                  styles.quickActionText,
                  { color: colors.text, fontSize: fontSizes.sm },
                ]}
              >
                View Inventory
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.quickActionItem,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
              onPress={() => navigation.navigate('Attendance', { screen: 'LeaveRequest' })}
            >
              <View
                style={[
                  styles.quickActionIcon,
                  { backgroundColor: colors.info + '20' },
                ]}
              >
                <Ionicons name="calendar-outline" size={wp(6)} color={colors.info} />
              </View>
              <Text
                style={[
                  styles.quickActionText,
                  { color: colors.text, fontSize: fontSizes.sm },
                ]}
              >
                Request Leave
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.quickActionItem,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
              onPress={() => navigation.navigate('Deliveries', { screen: 'DeliveriesView' })}
            >
              <View
                style={[
                  styles.quickActionIcon,
                  { backgroundColor: colors.warning + '20' },
                ]}
              >
                <Ionicons name="bicycle-outline" size={wp(6)} color={colors.warning} />
              </View>
              <Text
                style={[
                  styles.quickActionText,
                  { color: colors.text, fontSize: fontSizes.sm },
                ]}
              >
                View Deliveries
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Inventory Alerts */}
        <View style={styles.inventoryAlertsContainer}>
          <Text
            style={[
              styles.sectionTitle,
              { color: colors.text, fontSize: fontSizes.lg },
            ]}
          >
            Inventory Alerts
          </Text>
          <FlatList
            data={getInventoryAlerts()}
            renderItem={renderInventoryAlert}
            keyExtractor={item => item.id}
            scrollEnabled={false}
            ListEmptyComponent={
              <View style={[styles.emptyAlerts, { backgroundColor: colors.card }]}>
                <Ionicons name="checkmark-circle" size={wp(10)} color={colors.success} />
                <Text style={[styles.emptyAlertsText, { color: colors.text }]}>
                  No inventory alerts
                </Text>
              </View>
            }
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: wp(5),
    paddingVertical: hp(2),
  },
  greeting: {
    fontWeight: 'bold',
  },
  subtitle: {
    marginTop: hp(0.5),
  },
  headerButtons: {
    flexDirection: 'row',
  },
  iconButton: {
    width: wp(10),
    height: wp(10),
    borderRadius: wp(5),
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: wp(2),
    borderWidth: 1,
  },
  notificationBadge: {
    position: 'absolute',
    top: -hp(0.5),
    right: -wp(1),
    minWidth: wp(4),
    height: wp(4),
    borderRadius: wp(2),
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: wp(1),
  },
  badgeText: {
    color: 'white',
    fontSize: wp(2.5),
    fontWeight: 'bold',
  },
  scrollContent: {
    paddingHorizontal: wp(5),
    paddingBottom: hp(4),
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    marginBottom: hp(3),
  },
  statusCard: {
    width: wp(27),
    alignItems: 'center',
    marginHorizontal: 0,
    marginBottom: hp(2),
  },
  statusIconContainer: {
    marginBottom: hp(1),
  },
  statusValue: {
    fontWeight: 'bold',
  },
  statusLabel: {
    fontSize: wp(3),
    textAlign: 'center',
    marginTop: hp(0.5),
  },
  checkInButton: {
    marginTop: hp(1),
    paddingVertical: hp(0.8),
    paddingHorizontal: wp(3),
    borderRadius: hp(1),
  },
  checkInButtonText: {
    fontWeight: '500',
    fontSize: wp(3),
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: hp(1.5),
  },
  quickActionsContainer: {
    marginBottom: hp(3),
  },
  quickActionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  quickActionItem: {
    width: wp(42),
    borderRadius: hp(1),
    paddingVertical: hp(2),
    paddingHorizontal: wp(3),
    alignItems: 'center',
    marginBottom: hp(2),
    borderWidth: 1,
  },
  quickActionIcon: {
    width: wp(12),
    height: wp(12),
    borderRadius: wp(6),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: hp(1),
  },
  quickActionText: {
    fontWeight: '500',
    textAlign: 'center',
  },
  inventoryAlertsContainer: {
    marginBottom: hp(3),
  },
  alertItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: wp(3),
    borderRadius: hp(1),
    marginBottom: hp(1.5),
    borderLeftWidth: wp(1),
  },
  alertIcon: {
    marginRight: wp(3),
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    fontWeight: '500',
    marginBottom: hp(0.3),
  },
  alertDescription: {
    fontSize: wp(3.5),
  },
  emptyAlerts: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: wp(5),
    borderRadius: hp(1),
  },
  emptyAlertsText: {
    marginTop: hp(1),
    fontSize: wp(4),
  },
});

export default EmployeeDashboardScreen;