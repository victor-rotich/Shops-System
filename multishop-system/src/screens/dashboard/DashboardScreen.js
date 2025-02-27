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

const DashboardScreen = ({ navigation }) => {
  const { colors, fontSizes } = useTheme();
  const { user } = useAuth();
  const {
    shops,
    sales,
    expenses,
    inventory,
    deliveries,
    notifications,
    isLoading,
    fetchInitialData,
  } = useApp();

  const [refreshing, setRefreshing] = useState(false);
  const [summary, setSummary] = useState({
    totalSales: 0,
    totalExpenses: 0,
    totalProfit: 0,
    lowStockItems: 0,
    pendingDeliveries: 0,
    activeShops: 0,
  });

  useEffect(() => {
    calculateSummary();
  }, [shops, sales, expenses, inventory, deliveries]);

  const calculateSummary = () => {
    // Calculate total sales amount
    const totalSales = sales.reduce((total, sale) => total + sale.totalAmount, 0);

    // Calculate total expenses
    const totalExpenses = expenses.reduce((total, expense) => total + expense.amount, 0);

    // Calculate profit
    const totalProfit = totalSales - totalExpenses;

    // Count low stock items
    const lowStockItems = inventory.filter(
      (item) => item.currentStock <= item.lowStockThreshold
    ).length;

    // Count pending deliveries
    const pendingDeliveries = deliveries.filter(
      (delivery) => delivery.status === 'pending'
    ).length;

    // Count active shops
    const activeShops = shops.filter((shop) => shop.status === 'active').length;

    setSummary({
      totalSales,
      totalExpenses,
      totalProfit,
      lowStockItems,
      pendingDeliveries,
      activeShops,
    });
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchInitialData();
    setRefreshing(false);
  };

  // Recent activity data
  const recentActivities = [
    ...sales.map((sale) => ({
      id: `sale-${sale.id}`,
      type: 'sale',
      title: `Sale at ${sale.shopName}`,
      description: `Amount: $${sale.totalAmount.toFixed(2)}`,
      timestamp: sale.createdAt,
      icon: <Ionicons name="cash-outline" size={wp(5)} color={colors.success} />,
    })),
    ...expenses.map((expense) => ({
      id: `expense-${expense.id}`,
      type: 'expense',
      title: `${expense.category} Expense`,
      description: `Amount: $${expense.amount.toFixed(2)}`,
      timestamp: expense.createdAt,
      icon: <Ionicons name="wallet-outline" size={wp(5)} color={colors.danger} />,
    })),
    ...deliveries.map((delivery) => ({
      id: `delivery-${delivery.id}`,
      type: 'delivery',
      title: `Delivery ${delivery.status.charAt(0).toUpperCase() + delivery.status.slice(1)}`,
      description: `From: ${delivery.shopName}`,
      timestamp: delivery.createdAt,
      icon: <Ionicons name="bicycle-outline" size={wp(5)} color={colors.primary} />,
    })),
  ]
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 10);

  const renderActivityItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.activityItem,
        { borderBottomColor: colors.border },
      ]}
      onPress={() => {
        if (item.type === 'sale') {
          navigation.navigate('Sales', { screen: 'SalesHome' });
        } else if (item.type === 'expense') {
          navigation.navigate('Sales', { screen: 'Expenses' });
        } else if (item.type === 'delivery') {
          navigation.navigate('Deliveries', { screen: 'DeliveriesHome' });
        }
      }}
    >
      <View style={styles.activityIcon}>{item.icon}</View>
      <View style={styles.activityContent}>
        <Text
          style={[styles.activityTitle, { color: colors.text, fontSize: fontSizes.md }]}
          numberOfLines={1}
        >
          {item.title}
        </Text>
        <Text
          style={[
            styles.activityDescription,
            { color: colors.text + 'AA', fontSize: fontSizes.sm },
          ]}
          numberOfLines={1}
        >
          {item.description}
        </Text>
      </View>
      <Text
        style={[
          styles.activityTimestamp,
          { color: colors.text + '80', fontSize: fontSizes.xs },
        ]}
      >
        {new Date(item.timestamp).toLocaleDateString()}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.greeting, { color: colors.text, fontSize: fontSizes.lg }]}>
            Hello, {user?.name || 'Admin'}
          </Text>
          <Text
            style={[
              styles.subtitle,
              { color: colors.text + 'AA', fontSize: fontSizes.sm },
            ]}
          >
            Here's your business overview
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
        <View style={styles.summaryContainer}>
          <AppCard style={[styles.summaryCard, { backgroundColor: colors.primary + '15' }]}>
            <View style={styles.summaryCardContent}>
              <Ionicons name="cash-outline" size={wp(10)} color={colors.primary} />
              <View style={styles.summaryTextContainer}>
                <Text
                  style={[
                    styles.summaryAmount,
                    { color: colors.primary, fontSize: fontSizes.xl },
                  ]}
                >
                  ${summary.totalSales.toFixed(2)}
                </Text>
                <Text
                  style={[
                    styles.summaryLabel,
                    { color: colors.text, fontSize: fontSizes.sm },
                  ]}
                >
                  Total Sales
                </Text>
              </View>
            </View>
          </AppCard>

          <AppCard style={[styles.summaryCard, { backgroundColor: colors.danger + '15' }]}>
            <View style={styles.summaryCardContent}>
              <Ionicons name="wallet-outline" size={wp(10)} color={colors.danger} />
              <View style={styles.summaryTextContainer}>
                <Text
                  style={[
                    styles.summaryAmount,
                    { color: colors.danger, fontSize: fontSizes.xl },
                  ]}
                >
                  ${summary.totalExpenses.toFixed(2)}
                </Text>
                <Text
                  style={[
                    styles.summaryLabel,
                    { color: colors.text, fontSize: fontSizes.sm },
                  ]}
                >
                  Total Expenses
                </Text>
              </View>
            </View>
          </AppCard>

          <AppCard style={[styles.summaryCard, { backgroundColor: colors.success + '15' }]}>
            <View style={styles.summaryCardContent}>
              <Ionicons name="trending-up-outline" size={wp(10)} color={colors.success} />
              <View style={styles.summaryTextContainer}>
                <Text
                  style={[
                    styles.summaryAmount,
                    { color: colors.success, fontSize: fontSizes.xl },
                  ]}
                >
                  ${summary.totalProfit.toFixed(2)}
                </Text>
                <Text
                  style={[
                    styles.summaryLabel,
                    { color: colors.text, fontSize: fontSizes.sm },
                  ]}
                >
                  Total Profit
                </Text>
              </View>
            </View>
          </AppCard>
        </View>

        <View style={styles.statsContainer}>
          <AppCard
            style={styles.statsCard}
            title="Business Stats"
            icon={
              <Ionicons name="stats-chart-outline" size={wp(5)} color={colors.primary} />
            }
          >
            <View style={styles.statsGrid}>
              <View
                style={[
                  styles.statItem,
                  { borderRightColor: colors.border, borderBottomColor: colors.border },
                ]}
              >
                <Text
                  style={[
                    styles.statValue,
                    { color: colors.text, fontSize: fontSizes.xl },
                  ]}
                >
                  {shops.length}
                </Text>
                <Text
                  style={[
                    styles.statLabel,
                    { color: colors.text + 'AA', fontSize: fontSizes.sm },
                  ]}
                >
                  Total Shops
                </Text>
              </View>
              <View
                style={[
                  styles.statItem,
                  { borderBottomColor: colors.border },
                ]}
              >
                <Text
                  style={[
                    styles.statValue,
                    { color: colors.text, fontSize: fontSizes.xl },
                  ]}
                >
                  {summary.activeShops}
                </Text>
                <Text
                  style={[
                    styles.statLabel,
                    { color: colors.text + 'AA', fontSize: fontSizes.sm },
                  ]}
                >
                  Active Shops
                </Text>
              </View>
              <View
                style={[
                  styles.statItem,
                  { borderRightColor: colors.border },
                ]}
              >
                <Text
                  style={[
                    styles.statValue,
                    { color: colors.text, fontSize: fontSizes.xl },
                  ]}
                >
                  {summary.lowStockItems}
                </Text>
                <Text
                  style={[
                    styles.statLabel,
                    { color: colors.text + 'AA', fontSize: fontSizes.sm },
                  ]}
                >
                  Low Stock Items
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text
                  style={[
                    styles.statValue,
                    { color: colors.text, fontSize: fontSizes.xl },
                  ]}
                >
                  {summary.pendingDeliveries}
                </Text>
                <Text
                  style={[
                    styles.statLabel,
                    { color: colors.text + 'AA', fontSize: fontSizes.sm },
                  ]}
                >
                  Pending Deliveries
                </Text>
              </View>
            </View>
          </AppCard>
        </View>

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
              onPress={() => navigation.navigate('Shops', { screen: 'AddShop' })}
            >
              <View
                style={[
                  styles.quickActionIcon,
                  { backgroundColor: colors.primary + '20' },
                ]}
              >
                <Ionicons name="add-circle-outline" size={wp(6)} color={colors.primary} />
              </View>
              <Text
                style={[
                  styles.quickActionText,
                  { color: colors.text, fontSize: fontSizes.sm },
                ]}
              >
                Add Shop
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.quickActionItem,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
              onPress={() => navigation.navigate('Inventory', { screen: 'AddProduct' })}
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
                Add Product
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.quickActionItem,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
              onPress={() => navigation.navigate('Shops', { screen: 'AddEmployee' })}
            >
              <View
                style={[
                  styles.quickActionIcon,
                  { backgroundColor: colors.info + '20' },
                ]}
              >
                <Ionicons name="person-add-outline" size={wp(6)} color={colors.info} />
              </View>
              <Text
                style={[
                  styles.quickActionText,
                  { color: colors.text, fontSize: fontSizes.sm },
                ]}
              >
                Add Employee
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.quickActionItem,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
              onPress={() => navigation.navigate('Reports', { screen: 'SalesReport' })}
            >
              <View
                style={[
                  styles.quickActionIcon,
                  { backgroundColor: colors.success + '20' },
                ]}
              >
                <Ionicons name="bar-chart-outline" size={wp(6)} color={colors.success} />
              </View>
              <Text
                style={[
                  styles.quickActionText,
                  { color: colors.text, fontSize: fontSizes.sm },
                ]}
              >
                Sales Report
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.recentActivityContainer}>
          <Text
            style={[
              styles.sectionTitle,
              { color: colors.text, fontSize: fontSizes.lg },
            ]}
          >
            Recent Activity
          </Text>
          <AppCard style={styles.activityCard}>
            <FlatList
              data={recentActivities}
              renderItem={renderActivityItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              ListEmptyComponent={
                <Text
                  style={[
                    styles.emptyListText,
                    { color: colors.text + '80', fontSize: fontSizes.md },
                  ]}
                >
                  No recent activities
                </Text>
              }
            />
          </AppCard>
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
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    marginBottom: hp(2),
  },
  summaryCard: {
    width: wp(90),
    marginBottom: hp(2),
    marginHorizontal: 0,
  },
  summaryCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryTextContainer: {
    marginLeft: wp(3),
  },
  summaryAmount: {
    fontWeight: 'bold',
  },
  summaryLabel: {
    marginTop: hp(0.5),
  },
  statsContainer: {
    marginBottom: hp(3),
  },
  statsCard: {
    marginHorizontal: 0,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  statItem: {
    width: '50%',
    padding: wp(3),
    borderRightWidth: 1,
    borderBottomWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    fontWeight: 'bold',
  },
  statLabel: {
    marginTop: hp(0.5),
    textAlign: 'center',
  },
  quickActionsContainer: {
    marginBottom: hp(3),
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: hp(1.5),
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
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
  recentActivityContainer: {
    marginBottom: hp(3),
  },
  activityCard: {
    marginHorizontal: 0,
    padding: 0,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(4),
    borderBottomWidth: 1,
  },
  activityIcon: {
    marginRight: wp(3),
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontWeight: '500',
  },
  activityDescription: {
    marginTop: hp(0.3),
  },
  activityTimestamp: {
    marginLeft: wp(2),
  },
  emptyListText: {
    textAlign: 'center',
    padding: hp(3),
  },
});

export default DashboardScreen;