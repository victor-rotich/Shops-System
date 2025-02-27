import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import AppCard from '../../components/common/AppCard';
import AppButton from '../../components/common/AppButton';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

const ShopDetailScreen = ({ navigation, route }) => {
  const { colors, fontSizes } = useTheme();
  const { shops, sales, expenses, inventory, employees, fetchInitialData, updateShop } = useApp();
  const { user } = useAuth();
  
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [shop, setShop] = useState(null);
  const [shopStats, setShopStats] = useState({
    totalProducts: 0,
    lowStockItems: 0,
    totalSales: 0,
    totalExpenses: 0,
    profit: 0,
    employeeCount: 0,
  });

  const { shopId } = route.params || {};

  useEffect(() => {
    if (shopId) {
      loadShopData();
    } else {
      navigation.goBack();
    }
  }, [shopId, shops, sales, expenses, inventory, employees]);

  const loadShopData = () => {
    setIsLoading(true);
    
    // Find the shop
    const foundShop = shops.find(s => s.id === shopId);
    if (foundShop) {
      setShop(foundShop);
      
      // Calculate statistics
      // 1. Count products in inventory
      const shopInventory = inventory.filter(item => item.shopId === shopId);
      
      // 2. Count low stock items
      const lowStock = shopInventory.filter(
        item => item.currentStock <= item.lowStockThreshold
      );
      
      // 3. Calculate total sales
      const shopSales = sales.filter(sale => sale.shopId === shopId);
      const totalSales = shopSales.reduce(
        (sum, sale) => sum + sale.totalAmount,
        0
      );
      
      // 4. Calculate total expenses
      const shopExpenses = expenses.filter(expense => expense.shopId === shopId);
      const totalExpenses = shopExpenses.reduce(
        (sum, expense) => sum + expense.amount,
        0
      );
      
      // 5. Count employees
      const shopEmployees = employees.filter(emp => emp.shopId === shopId);
      
      setShopStats({
        totalProducts: shopInventory.length,
        lowStockItems: lowStock.length,
        totalSales,
        totalExpenses,
        profit: totalSales - totalExpenses,
        employeeCount: shopEmployees.length,
      });
    }
    
    setIsLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchInitialData();
    setRefreshing(false);
  };

  const handleToggleStatus = async () => {
    try {
      const newStatus = shop.status === 'active' ? 'inactive' : 'active';
      
      await updateShop(shop.id, {
        ...shop,
        status: newStatus,
      });
      
      Alert.alert(
        'Status Updated',
        `Shop has been ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully.`
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to update shop status');
    }
  };

  if (!shop) {
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
            Shop Details
          </Text>
          <View style={styles.placeholder} />
        </View>
        
        <View style={styles.loadingContainer}>
          <Text style={{ color: colors.text }}>Loading shop information...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back-outline" size={wp(6)} color={colors.text} />
        </TouchableOpacity>
        <Text 
          style={[styles.headerTitle, { color: colors.text, fontSize: fontSizes.xl }]}
          numberOfLines={1}
        >
          {shop.name}
        </Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('AddShop', { shop })}
        >
          <Ionicons name="create-outline" size={wp(6)} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Shop Info Card */}
        <AppCard style={styles.shopInfoCard}>
          <View style={styles.shopStatusContainer}>
            <View style={styles.shopDetailsContainer}>
              <Text 
                style={[styles.shopName, { color: colors.text, fontSize: fontSizes.lg }]}
                numberOfLines={1}
              >
                {shop.name}
              </Text>
              
              <View style={styles.infoRow}>
                <Ionicons name="location-outline" size={wp(4)} color={colors.text + '80'} />
                <Text style={[styles.infoText, { color: colors.text + '80' }]}>
                  {shop.location}
                </Text>
              </View>
              
              <View style={styles.infoRow}>
                <Ionicons name="call-outline" size={wp(4)} color={colors.text + '80'} />
                <Text style={[styles.infoText, { color: colors.text + '80' }]}>
                  {shop.phone}
                </Text>
              </View>
              
              <View style={styles.infoRow}>
                <Ionicons name="mail-outline" size={wp(4)} color={colors.text + '80'} />
                <Text style={[styles.infoText, { color: colors.text + '80' }]}>
                  {shop.email}
                </Text>
              </View>
              
              <View style={styles.infoRow}>
                <Ionicons name="time-outline" size={wp(4)} color={colors.text + '80'} />
                <Text style={[styles.infoText, { color: colors.text + '80' }]}>
                  {shop.openingTime} - {shop.closingTime}
                </Text>
              </View>
            </View>
            
            <View style={styles.statusSection}>
              <View
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor:
                      shop.status === 'active' ? colors.success + '20' : colors.danger + '20',
                  },
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    {
                      color: shop.status === 'active' ? colors.success : colors.danger,
                      fontSize: fontSizes.xs,
                    },
                  ]}
                >
                  {shop.status === 'active' ? 'ACTIVE' : 'INACTIVE'}
                </Text>
              </View>
              
              <AppButton
                title={shop.status === 'active' ? 'Deactivate' : 'Activate'}
                type={shop.status === 'active' ? 'danger' : 'success'}
                size="small"
                onPress={handleToggleStatus}
                style={styles.statusButton}
              />
            </View>
          </View>
          
          {shop.description && (
            <View style={styles.descriptionContainer}>
              <Text style={[styles.descriptionLabel, { color: colors.text }]}>
                Description:
              </Text>
              <Text style={[styles.descriptionText, { color: colors.text + '99' }]}>
                {shop.description}
              </Text>
            </View>
          )}
        </AppCard>

        {/* Shop Statistics */}
        <View style={styles.statsContainer}>
          <Text style={[styles.sectionTitle, { color: colors.text, fontSize: fontSizes.lg }]}>
            Shop Statistics
          </Text>
          
          <View style={styles.statsGrid}>
            <AppCard style={[styles.statCard, { backgroundColor: colors.primary + '15' }]}>
              <Ionicons name="cube-outline" size={wp(6)} color={colors.primary} />
              <Text style={[styles.statValue, { color: colors.text, fontSize: fontSizes.lg }]}>
                {shopStats.totalProducts}
              </Text>
              <Text style={[styles.statLabel, { color: colors.text + '99' }]}>
                Products
              </Text>
            </AppCard>
            
            <AppCard style={[styles.statCard, { backgroundColor: colors.warning + '15' }]}>
              <Ionicons name="alert-circle-outline" size={wp(6)} color={colors.warning} />
              <Text style={[styles.statValue, { color: colors.text, fontSize: fontSizes.lg }]}>
                {shopStats.lowStockItems}
              </Text>
              <Text style={[styles.statLabel, { color: colors.text + '99' }]}>
                Low Stock
              </Text>
            </AppCard>
            
            <AppCard style={[styles.statCard, { backgroundColor: colors.success + '15' }]}>
              <Ionicons name="cash-outline" size={wp(6)} color={colors.success} />
              <Text style={[styles.statValue, { color: colors.text, fontSize: fontSizes.lg }]}>
                ${shopStats.totalSales.toFixed(2)}
              </Text>
              <Text style={[styles.statLabel, { color: colors.text + '99' }]}>
                Sales
              </Text>
            </AppCard>
            
            <AppCard style={[styles.statCard, { backgroundColor: colors.danger + '15' }]}>
              <Ionicons name="wallet-outline" size={wp(6)} color={colors.danger} />
              <Text style={[styles.statValue, { color: colors.text, fontSize: fontSizes.lg }]}>
                ${shopStats.totalExpenses.toFixed(2)}
              </Text>
              <Text style={[styles.statLabel, { color: colors.text + '99' }]}>
                Expenses
              </Text>
            </AppCard>
            
            <AppCard 
              style={[
                styles.statCard, 
                { 
                  backgroundColor: 
                    shopStats.profit >= 0 ? colors.success + '15' : colors.danger + '15'
                }
              ]}
            >
              <Ionicons 
                name="trending-up-outline" 
                size={wp(6)} 
                color={shopStats.profit >= 0 ? colors.success : colors.danger} 
              />
              <Text style={[styles.statValue, { color: colors.text, fontSize: fontSizes.lg }]}>
                ${shopStats.profit.toFixed(2)}
              </Text>
              <Text style={[styles.statLabel, { color: colors.text + '99' }]}>
                Profit
              </Text>
            </AppCard>
            
            <AppCard style={[styles.statCard, { backgroundColor: colors.secondary + '15' }]}>
              <Ionicons name="people-outline" size={wp(6)} color={colors.secondary} />
              <Text style={[styles.statValue, { color: colors.text, fontSize: fontSizes.lg }]}>
                {shopStats.employeeCount}
              </Text>
              <Text style={[styles.statLabel, { color: colors.text + '99' }]}>
                Employees
              </Text>
            </AppCard>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.primary + '15' }]}
            onPress={() => navigation.navigate('Inventory', { screen: 'InventoryHome', params: { shopId: shop.id } })}
          >
            <Ionicons name="cube" size={wp(6)} color={colors.primary} />
            <Text style={[styles.actionText, { color: colors.text }]}>Inventory</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.success + '15' }]}
            onPress={() => navigation.navigate('Sales', { screen: 'SalesReport', params: { shopId: shop.id } })}
          >
            <Ionicons name="bar-chart" size={wp(6)} color={colors.success} />
            <Text style={[styles.actionText, { color: colors.text }]}>Sales Report</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.secondary + '15' }]}
            onPress={() => navigation.navigate('EmployeeList', { shopId: shop.id })}
          >
            <Ionicons name="people" size={wp(6)} color={colors.secondary} />
            <Text style={[styles.actionText, { color: colors.text }]}>Employees</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.info + '15' }]}
            onPress={() => navigation.navigate('Reports', { screen: 'ProfitLoss', params: { shopId: shop.id } })}
          >
            <Ionicons name="analytics" size={wp(6)} color={colors.info} />
            <Text style={[styles.actionText, { color: colors.text }]}>Reports</Text>
          </TouchableOpacity>
        </View>

        {/* Manager Section */}
        <View style={styles.managerSection}>
          <Text style={[styles.sectionTitle, { color: colors.text, fontSize: fontSizes.lg }]}>
            Shop Manager
          </Text>
          
          {shop.managerId ? (
            <AppCard style={styles.managerCard}>
              <View style={styles.managerInfo}>
                <View style={[styles.managerAvatar, { backgroundColor: colors.primary + '30' }]}>
                  <Text style={[styles.managerInitials, { color: colors.primary }]}>
                    {shop.managerName ? shop.managerName.charAt(0).toUpperCase() : 'M'}
                  </Text>
                </View>
                
                <View style={styles.managerDetails}>
                  <Text style={[styles.managerName, { color: colors.text, fontSize: fontSizes.md }]}>
                    {shop.managerName || 'Manager Name'}
                  </Text>
                  <Text style={[styles.managerEmail, { color: colors.text + '99' }]}>
                    {shop.managerEmail || 'manager@example.com'}
                  </Text>
                  <Text style={[styles.managerPhone, { color: colors.text + '99' }]}>
                    {shop.managerPhone || 'No phone provided'}
                  </Text>
                </View>
              </View>
              
              <TouchableOpacity
                style={[styles.changeManagerButton, { borderColor: colors.border }]}
                onPress={() => navigation.navigate('EmployeeList', { 
                  shopId: shop.id, 
                  selectingManager: true 
                })}
              >
                <Text style={[styles.changeManagerText, { color: colors.primary }]}>
                  Change Manager
                </Text>
              </TouchableOpacity>
            </AppCard>
          ) : (
            <AppCard style={styles.noManagerCard}>
              <Text style={[styles.noManagerText, { color: colors.text }]}>
                No manager assigned to this shop
              </Text>
              <AppButton
                title="Assign Manager"
                type="primary"
                size="small"
                onPress={() => navigation.navigate('EmployeeList', { 
                  shopId: shop.id, 
                  selectingManager: true 
                })}
                style={styles.assignManagerButton}
              />
            </AppCard>
          )}
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
    flex: 1,
    textAlign: 'center',
  },
  placeholder: {
    width: wp(6),
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingHorizontal: wp(5),
    paddingBottom: hp(4),
  },
  shopInfoCard: {
    marginHorizontal: 0,
    marginBottom: hp(3),
  },
  shopStatusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  shopDetailsContainer: {
    flex: 1,
  },
  shopName: {
    fontWeight: 'bold',
    marginBottom: hp(1),
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp(0.8),
  },
  infoText: {
    marginLeft: wp(2),
    fontSize: wp(3.5),
  },
  statusSection: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusBadge: {
    paddingHorizontal: wp(3),
    paddingVertical: hp(0.5),
    borderRadius: hp(1),
    marginBottom: hp(1),
  },
  statusText: {
    fontWeight: 'bold',
  },
  statusButton: {
    minWidth: wp(25),
  },
  descriptionContainer: {
    marginTop: hp(2),
    paddingTop: hp(2),
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  descriptionLabel: {
    fontWeight: '500',
    marginBottom: hp(0.5),
  },
  descriptionText: {
    fontSize: wp(3.8),
    lineHeight: wp(5.5),
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: hp(1.5),
  },
  statsContainer: {
    marginBottom: hp(3),
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: wp(27),
    alignItems: 'center',
    marginBottom: hp(2),
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(2),
  },
  statValue: {
    fontWeight: 'bold',
    marginTop: hp(0.8),
  },
  statLabel: {
    fontSize: wp(3),
    marginTop: hp(0.5),
  },
  actionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: hp(3),
  },
  actionButton: {
    width: wp(42),
    borderRadius: hp(1),
    paddingVertical: hp(2),
    alignItems: 'center',
    marginBottom: hp(2),
  },
  actionText: {
    fontWeight: '500',
    marginTop: hp(1),
  },
  managerSection: {
    marginBottom: hp(3),
  },
  managerCard: {
    marginHorizontal: 0,
  },
  managerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp(2),
  },
  managerAvatar: {
    width: wp(14),
    height: wp(14),
    borderRadius: wp(7),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: wp(3),
  },
  managerInitials: {
    fontSize: wp(6),
    fontWeight: 'bold',
  },
  managerDetails: {
    flex: 1,
  },
  managerName: {
    fontWeight: 'bold',
    marginBottom: hp(0.5),
  },
  managerEmail: {
    fontSize: wp(3.5),
    marginBottom: hp(0.5),
  },
  managerPhone: {
    fontSize: wp(3.5),
  },
  changeManagerButton: {
    paddingVertical: hp(1),
    borderRadius: hp(1),
    alignItems: 'center',
    borderWidth: 1,
  },
  changeManagerText: {
    fontWeight: '500',
  },
  noManagerCard: {
    marginHorizontal: 0,
    alignItems: 'center',
    paddingVertical: hp(3),
  },
  noManagerText: {
    marginBottom: hp(2),
  },
  assignManagerButton: {
    minWidth: wp(40),
  },
});

export default ShopDetailScreen;