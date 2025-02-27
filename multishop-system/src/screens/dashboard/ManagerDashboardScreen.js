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
import AppButton from '../../components/common/AppButton';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

const ManagerDashboardScreen = ({ navigation }) => {
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
    setSelectedShop
  } = useApp();

  const [refreshing, setRefreshing] = useState(false);
  const [summary, setSummary] = useState({
    todaySales: 0,
    weekSales: 0,
    monthSales: 0,
    lowStockItems: 0,
    pendingDeliveries: 0,
    profit: 0,
  });
  const [shop, setShop] = useState(null);

  useEffect(() => {
    // Find manager's shop
    if (user && user.shopId) {
      const managerShop = shops.find(s => s.id === user.shopId);
      if (managerShop) {
        setShop(managerShop);
        setSelectedShop(managerShop);
      }
    }
  }, [user, shops]);

  useEffect(() => {
    calculateSummary();
  }, [shop, sales, expenses, inventory, deliveries]);

  const calculateSummary = () => {
    if (!shop) return;

    const shopId = shop.id;
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const weekAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7).toISOString();
    const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate()).toISOString();

    // Filter sales for current shop
    const shopSales = sales.filter(sale => sale.shopId === shopId);
    
    // Calculate today's sales
    const todaySales = shopSales
      .filter(sale => sale.createdAt >= today)
      .reduce((total, sale) => total + sale.totalAmount, 0);
    
    // Calculate week's sales
    const weekSales = shopSales
      .filter(sale => sale.createdAt >= weekAgo)
      .reduce((total, sale) => total + sale.totalAmount, 0);
    
    // Calculate month's sales
    const monthSales = shopSales
      .filter(sale => sale.createdAt >= monthAgo)
      .reduce((total, sale) => total + sale.totalAmount, 0);
    
    // Calculate shop's expenses for the month
    const monthExpenses = expenses
      .filter(exp => exp.shopId === shopId && exp.createdAt >= monthAgo)
      .reduce((total, exp) => total + exp.amount, 0);
    
    // Calculate profit
    const profit = monthSales - monthExpenses;
    
    // Count low stock items
    const lowStockItems = inventory
      .filter(item => 
        item.shopId === shopId && 
        item.currentStock <= item.lowStockThreshold
      ).length;
    
    // Count pending deliveries
    const pendingDeliveries = deliveries
      .filter(delivery => 
        (delivery.shopId === shopId || delivery.toShopId === shopId) && 
        delivery.status === 'pending'
      ).length;
    
    setSummary({
      todaySales,
      weekSales,
      monthSales,
      lowStockItems,
      pendingDeliveries,
      profit,
    });
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchInitialData();
    setRefreshing(false);
  };

  // Recent activities
  const getRecentActivities = () => {
    if (!shop) return [];
    
    const shopId = shop.id;
    
    // Combine sales, deliveries, and inventory changes
    const allActivities = [
      ...sales
        .filter(sale => sale.shopId === shopId)
        .map(sale => ({
          id: `sale-${sale.id}`,
          type: 'sale',
          title: `Sale Completed`,
          description: `Amount: $${sale.totalAmount.toFixed(2)}`,
          timestamp: sale.createdAt,
          icon: <Ionicons name="cash-outline" size={wp(5)} color={colors.success} />,
        })),
      ...deliveries
        .filter(delivery => 
          delivery.shopId === shopId || delivery.toShopId === shopId
        )
        .map(delivery => ({
          id: `delivery-${delivery.id}`,
          type: 'delivery',
          title: `Delivery ${delivery.status.charAt(0).toUpperCase() + delivery.status.slice(1)}`,
          description: delivery.shopId === shopId 
            ? `To: ${delivery.toShopName || 'Another Shop'}`
            : `From: ${delivery.shopName || 'Another Shop'}`,
          timestamp: delivery.createdAt,
          icon: <Ionicons name="bicycle-outline" size={wp(5)} color={colors.primary} />,
        })),
      ...inventory
        .filter(item => 
          item.shopId === shopId && item.lastRestockDate
        )
        .map(item => {
          const product = products.find(p => p.id === item.productId);
          return {
            id: `restock-${item.id}-${item.lastRestockDate}`,
            type: 'restock',
            title: `Stock Updated`,
            description: `${product?.name || 'Product'}: ${item.lastRestockQuantity || 0} units added`,
            timestamp: item.lastRestockDate,
            icon: <Ionicons name="cube-outline" size={wp(5)} color={colors.secondary} />,
          };
        }),
    ];
    
    // Sort by date descending and take the first 10
    return allActivities
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 10);
  };

  const renderActivityItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.activityItem,
        { borderBottomColor: colors.border },
      ]}
      onPress={() => {
        if (item.type === 'sale') {
          navigation.navigate('Sales', { screen: 'SalesHistory' });
        } else if (item.type === 'delivery') {
          navigation.navigate('Deliveries', { screen: 'DeliveriesHome' });
        } else if (item.type === 'restock') {
          navigation.navigate('Inventory', { screen: 'InventoryHome' });
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
            Hello, {user?.name || 'Manager'}
          </Text>
          <Text
            style={[
              styles.subtitle,
              { color: colors.text + 'AA', fontSize: fontSizes.sm },
            ]}
          >
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
        {/* Sales Summary */}
        <View style={styles.summaryContainer}>
          <AppCard style={[styles.summaryCard, { backgroundColor: colors.success + '15' }]}>
            <View style={styles.summaryCardContent}>
              <Ionicons name="cash-outline" size={wp(10)} color={colors.success} />
              <View style={styles.summaryTextContainer}>
                <Text
                  style={[
                    styles.summaryAmount,
                    { color: colors.success, fontSize: fontSizes.xl },
                  ]}
                >
                  ${summary.todaySales.toFixed(2)}
                </Text>
                <Text
                  style={[
                    styles.summaryLabel,
                    { color: colors.text, fontSize: fontSizes.sm },
                  ]}
                >
                  Today's Sales
                </Text>
              </View>
            </View>
          </AppCard>

          <AppCard style={[styles.summaryCard, { backgroundColor: colors.primary + '15' }]}>
            <View style={styles.summaryCardContent}>
              <Ionicons name="trending-up-outline" size={wp(10)} color={colors.primary} />
              <View style={styles.summaryTextContainer}>
                <Text
                  style={[
                    styles.summaryAmount,
                    { color: colors.primary, fontSize: fontSizes.xl },
                  ]}
                >
                  ${summary.weekSales.toFixed(2)}
                </Text>
                <Text
                  style={[
                    styles.summaryLabel,
                    { color: colors.text, fontSize: fontSizes.sm },
                  ]}
                >
                  This Week
                </Text>
              </View>
            </View>
          </AppCard>

          <AppCard style={[styles.summaryCard, { backgroundColor: colors.secondary + '15' }]}>
            <View style={styles.summaryCardContent}>
              <Ionicons name="calendar-outline" size={wp(10)} color={colors.secondary} />
              <View style={styles.summaryTextContainer}>
                <Text
                  style={[
                    styles.summaryAmount,
                    { color: colors.secondary, fontSize: fontSizes.xl },
                  ]}
                >
                  ${summary.monthSales.toFixed(2)}
                </Text>
                <Text
                  style={[
                    styles.summaryLabel,
                    { color: colors.text, fontSize: fontSizes.sm },
                  ]}
                >
                  This Month
                </Text>
              </View>
            </View>
          </AppCard>
        </View>

        {/* Store Status */}
        <View style={styles.storeStatusContainer}>
          <Text
            style={[
              styles.sectionTitle,
              { color: colors.text, fontSize: fontSizes.lg },
            ]}
          >
            Store Status
          </Text>
          <View style={styles.statusCardsContainer}>
            <AppCard
              style={[
                styles.statusCard,
                { backgroundColor: summary.lowStockItems > 0 ? colors.warning + '15' : colors.success + '15' },
              ]}
            >
              <View style={styles.statusCardContent}>
                <View style={styles.statusIconContainer}>
                  <Ionicons
                    name="cube-outline"
                    size={wp(7)}
                    color={summary.lowStockItems > 0 ? colors.warning : colors.success}
                  />
                </View>
                <View style={styles.statusTextContainer}>
                  <Text
                    style={[
                      styles.statusValue,
                      { 
                        color: summary.lowStockItems > 0 ? colors.warning : colors.success,
                        fontSize: fontSizes.xl 
                      },
                    ]}
                  >
                    {summary.lowStockItems}
                  </Text>
                  <Text
                    style={[
                      styles.statusLabel,
                      { color: colors.text, fontSize: fontSizes.sm },
                    ]}
                  >
                    Low Stock Items
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                style={[
                  styles.statusButton,
                  { 
                    backgroundColor: summary.lowStockItems > 0 ? colors.warning + '25' : colors.success + '25'
                  },
                ]}
                onPress={() => navigation.navigate('Inventory', { screen: 'InventoryHome' })}
              >
                <Text
                  style={[
                    styles.statusButtonText,
                    { 
                      color: summary.lowStockItems > 0 ? colors.warning : colors.success
                    },
                  ]}
                >
                  View Inventory
                </Text>
              </TouchableOpacity>
            </AppCard>

            <AppCard
              style={[
                styles.statusCard,
                { backgroundColor: colors.primary + '15' },
              ]}
            >
              <View style={styles.statusCardContent}>
                <View style={styles.statusIconContainer}>
                  <Ionicons
                    name="bicycle-outline"
                    size={wp(7)}
                    color={colors.primary}
                  />
                </View>
                <View style={styles.statusTextContainer}>
                  <Text
                    style={[
                      styles.statusValue,
                      { color: colors.primary, fontSize: fontSizes.xl },
                    ]}
                  >
                    {summary.pendingDeliveries}
                  </Text>
                  <Text
                    style={[
                      styles.statusLabel,
                      { color: colors.text, fontSize: fontSizes.sm },
                    ]}
                  >
                    Pending Deliveries
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                style={[
                  styles.statusButton,
                  { backgroundColor: colors.primary + '25' },
                ]}
                onPress={() => navigation.navigate('Deliveries', { screen: 'DeliveriesHome' })}
              >
                <Text
                  style={[
                    styles.statusButtonText,
                    { color: colors.primary },
                  ]}
                >
                  View Deliveries
                </Text>
              </TouchableOpacity>
            </AppCard>
          </View>
        </View>

        {/* Profit Overview */}
        <AppCard style={styles.profitCard}>
          <Text
            style={[
              styles.profitTitle,
              { color: colors.text, fontSize: fontSizes.md },
            ]}
          >
            Monthly Profit Overview
          </Text>
          <View style={styles.profitInfo}>
            <View style={styles.profitItem}>
              <Text
                style={[
                  styles.profitLabel,
                  { color: colors.text + '80', fontSize: fontSizes.sm },
                ]}
              >
                Revenue
              </Text>
              <Text
                style={[
                  styles.profitValue,
                  { color: colors.success, fontSize: fontSizes.lg },
                ]}
              >
                ${summary.monthSales.toFixed(2)}
              </Text>
            </View>
            <View
              style={[
                styles.profitDivider,
                { backgroundColor: colors.border },
              ]}
            ></View>
            <View style={styles.profitItem}>
              <Text
                style={[
                  styles.profitLabel,
                  { color: colors.text + '80', fontSize: fontSizes.sm },
                ]}
              >
                Expenses
              </Text>
              <Text
                style={[
                  styles.profitValue,
                  { color: colors.danger, fontSize: fontSizes.lg },
                ]}
              >
                ${(summary.monthSales - summary.profit).toFixed(2)}
              </Text>
            </View>
            <View
              style={[
                styles.profitDivider,
                { backgroundColor: colors.border },
              ]}
            ></View>
            <View style={styles.profitItem}>
              <Text
                style={[
                  styles.profitLabel,
                  { color: colors.text + '80', fontSize: fontSizes.sm },
                ]}
              >
                Profit
              </Text>
              <Text
                style={[
                  styles.profitValue,
                  { 
                    color: summary.profit >= 0 ? colors.success : colors.danger, 
                    fontSize: fontSizes.lg 
                  },
                ]}
              >
                ${summary.profit.toFixed(2)}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={[styles.viewReportButton, { backgroundColor: colors.primary + '15' }]}
            onPress={() => navigation.navigate('Reports', { screen: 'ProfitLoss' })}
          >
            <Text style={[styles.viewReportText, { color: colors.primary }]}>
              View Full Report
            </Text>
            <Ionicons name="chevron-forward" size={wp(4)} color={colors.primary} />
          </TouchableOpacity>
        </AppCard>

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
              onPress={() => navigation.navigate('Inventory', { screen: 'StockEntry' })}
            >
              <View
                style={[
                  styles.quickActionIcon,
                  { backgroundColor: colors.secondary + '20' },
                ]}
              >
                <Ionicons name="add-circle-outline" size={wp(6)} color={colors.secondary} />
              </View>
              <Text
                style={[
                  styles.quickActionText,
                  { color: colors.text, fontSize: fontSizes.sm },
                ]}
              >
                Add Stock
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.quickActionItem,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
              onPress={() => navigation.navigate('Deliveries', { screen: 'CreateDelivery' })}
            >
              <View
                style={[
                  styles.quickActionIcon,
                  { backgroundColor: colors.info + '20' },
                ]}
              >
                <Ionicons name="bicycle-outline" size={wp(6)} color={colors.info} />
              </View>
              <Text
                style={[
                  styles.quickActionText,
                  { color: colors.text, fontSize: fontSizes.sm },
                ]}
              >
                Request Delivery
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.quickActionItem,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
              onPress={() => navigation.navigate('Sales', { screen: 'Expenses' })}
            >
              <View
                style={[
                  styles.quickActionIcon,
                  { backgroundColor: colors.warning + '20' },
                ]}
              >
                <Ionicons name="wallet-outline" size={wp(6)} color={colors.warning} />
              </View>
              <Text
                style={[
                  styles.quickActionText,
                  { color: colors.text, fontSize: fontSizes.sm },
                ]}
              >
                Record Expense
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Activity */}
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
              data={getRecentActivities()}
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
    marginBottom: hp(2.5),
  },
  summaryCard: {
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
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: hp(1.5),
  },
  storeStatusContainer: {
    marginBottom: hp(2.5),
  },
  statusCardsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statusCard: {
    width: wp(42),
    marginHorizontal: 0,
  },
  statusCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp(1.5),
  },
  statusIconContainer: {
    marginRight: wp(2),
  },
  statusTextContainer: {
    flex: 1,
  },
  statusValue: {
    fontWeight: 'bold',
  },
  statusLabel: {
    marginTop: hp(0.2),
  },
  statusButton: {
    paddingVertical: hp(0.8),
    borderRadius: hp(1),
    alignItems: 'center',
  },
  statusButtonText: {
    fontWeight: '500',
    fontSize: wp(3.5),
  },
  profitCard: {
    marginBottom: hp(2.5),
    marginHorizontal: 0,
  },
  profitTitle: {
    fontWeight: 'bold',
    marginBottom: hp(1.5),
  },
  profitInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp(1.5),
  },
  profitItem: {
    flex: 1,
    alignItems: 'center',
  },
  profitDivider: {
    width: 1,
    height: hp(5),
  },
  profitLabel: {
    marginBottom: hp(0.5),
  },
  profitValue: {
    fontWeight: 'bold',
  },
  viewReportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: hp(1),
    borderRadius: hp(1),
  },
  viewReportText: {
    fontWeight: '500',
    marginRight: wp(1),
  },
  quickActionsContainer: {
    marginBottom: hp(2.5),
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
    marginBottom: hp(2),
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

export default ManagerDashboardScreen;